/**
 * Interior Sync Service
 * 
 * Handles bidirectional sync between Google Sheets and Database
 * for Interior Quote Module data (DuAn, LayoutIDs sheets).
 * 
 * **Feature: interior-sheet-sync**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2**
 */

import { prisma } from '../../utils/prisma';
import { createLogger } from '../../utils/logger';
import { GoogleSheetsService } from '../google-sheets.service';
import { generateSlug } from './developer.service';
import type { PaginatedResult, ListOptions, UnitType } from './types';
import type {
  SyncStatus,
  InteriorSyncLogEntry,
  SyncError,
  SyncDirection,
  SyncLogStatus,
  ParsedDuAnData,
  ParsedLayoutData,
  SheetRow,
  SheetSyncResult,
  PullResult,
  PushResult,
  PreviewResult,
  PreviewRow,
} from './sync.types';
import { APARTMENT_TYPE_MAP, DUAN_SHEET_COLUMNS, LAYOUTIDS_SHEET_COLUMNS, UNIT_TYPE_TO_SHEET } from './sync.types';

const logger = createLogger();

// ============================================
// INTERIOR SYNC SERVICE CLASS
// ============================================

export class InteriorSyncService {
  private googleSheetsService: GoogleSheetsService;

  constructor(googleSheetsService?: GoogleSheetsService) {
    this.googleSheetsService = googleSheetsService ?? new GoogleSheetsService();
  }

  // ============================================
  // STATUS METHODS
  // ============================================

  /**
   * Get sync connection status
   * 
   * **Validates: Requirements 5.1, 5.2**
   * 
   * @returns SyncStatus with connection info and last sync timestamp
   */
  async getStatus(): Promise<SyncStatus> {
    // Get Google Sheets integration status
    const gsStatus = await this.googleSheetsService.getStatus();

    // Get last sync log
    const lastSyncLog = await prisma.interiorSyncLog.findFirst({
      orderBy: { syncedAt: 'desc' },
      select: {
        syncedAt: true,
        sheetId: true,
      },
    });

    return {
      connected: gsStatus.connected,
      sheetId: lastSyncLog?.sheetId ?? gsStatus.spreadsheetId ?? null,
      lastSync: lastSyncLog?.syncedAt?.toISOString() ?? null,
    };
  }

  // ============================================
  // LOG METHODS
  // ============================================

  /**
   * Get sync logs with pagination
   * 
   * **Validates: Requirements 4.2**
   * 
   * @param options - Pagination and filter options
   * @returns Paginated list of sync logs sorted by timestamp descending
   */
  async getLogs(
    options: ListOptions & {
      direction?: SyncDirection;
      status?: SyncLogStatus;
    } = {}
  ): Promise<PaginatedResult<InteriorSyncLogEntry>> {
    const { page = 1, limit = 20, direction, status } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      direction?: string;
      status?: string;
    } = {};

    if (direction) {
      where.direction = direction;
    }

    if (status) {
      where.status = status;
    }

    // Query logs with pagination
    const [items, total] = await Promise.all([
      prisma.interiorSyncLog.findMany({
        where,
        orderBy: { syncedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.interiorSyncLog.count({ where }),
    ]);

    // Transform to InteriorSyncLogEntry format
    const transformedItems: InteriorSyncLogEntry[] = items.map((log) => ({
      id: log.id,
      direction: log.direction as SyncDirection,
      sheetId: log.sheetId,
      sheetName: log.sheetName,
      status: log.status as SyncLogStatus,
      created: log.created,
      updated: log.updated,
      skipped: log.skipped,
      errors: log.errors ? (JSON.parse(log.errors) as SyncError[]) : null,
      syncedBy: log.syncedBy,
      syncedAt: log.syncedAt,
    }));

    return {
      items: transformedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================
  // TYPE MAPPING METHODS
  // ============================================

  /**
   * Map apartment type from sheet value to database UnitType enum
   * 
   * **Validates: Requirements 6.1, 6.2**
   * 
   * @param sheetValue - The apartment type value from the sheet (e.g., '1pn', '2pn', 'studio')
   * @returns The corresponding UnitType enum value, or null if unknown
   */
  mapApartmentType(sheetValue: string): UnitType | null {
    if (!sheetValue) {
      logger.warn('Empty apartment type value provided', { sheetValue });
      return null;
    }

    // Normalize the value: lowercase and trim
    const normalizedValue = sheetValue.toLowerCase().trim();

    // Check if the key exists in the map (avoid prototype pollution with keys like 'constructor')
    if (!Object.prototype.hasOwnProperty.call(APARTMENT_TYPE_MAP, normalizedValue)) {
      logger.warn('Unknown apartment type encountered', {
        sheetValue,
        normalizedValue,
        knownTypes: Object.keys(APARTMENT_TYPE_MAP),
      });
      return null;
    }

    // Look up in the mapping
    const mappedType = APARTMENT_TYPE_MAP[normalizedValue];

    return mappedType;
  }

  // ============================================
  // SHEET PARSING METHODS
  // ============================================

  /**
   * Parse DuAn sheet data into structured format
   * 
   * **Feature: interior-sheet-sync, Property 1: Pull parsing produces valid structures**
   * **Feature: interior-sheet-sync, Property 4: Invalid rows are skipped with errors**
   * **Validates: Requirements 1.1, 1.4**
   * 
   * @param rows - Raw sheet rows with headers in first row
   * @returns Object containing parsed data and any errors
   */
  parseDuAnSheet(rows: SheetRow[]): {
    data: ParsedDuAnData[];
    errors: SyncError[];
  } {
    const data: ParsedDuAnData[] = [];
    const errors: SyncError[] = [];

    if (rows.length === 0) {
      return { data, errors };
    }

    // First row is headers - find column indices
    const headerRow = rows[0];
    const headers = headerRow.values.map((v) => String(v ?? '').trim());
    
    const columnIndices: Record<string, number> = {};
    for (const col of DUAN_SHEET_COLUMNS) {
      const index = headers.findIndex(
        (h) => h.toLowerCase() === col.toLowerCase()
      );
      columnIndices[col] = index;
    }

    // Validate all required columns exist
    const missingColumns = DUAN_SHEET_COLUMNS.filter(
      (col) => columnIndices[col] === -1
    );
    if (missingColumns.length > 0) {
      errors.push({
        row: 1,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        data: { missingColumns },
      });
      return { data, errors };
    }

    // Parse data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = row.rowNumber;
      const values = row.values;

      // Extract values by column index
      const chuDauTu = String(values[columnIndices['ChuDauTu']] ?? '').trim();
      const tenDuAn = String(values[columnIndices['TenDuAn']] ?? '').trim();
      const maDuAn = String(values[columnIndices['MaDuAn']] ?? '').trim();
      const tenToaNha = String(values[columnIndices['TenToaNha']] ?? '').trim();
      const maToaNha = String(values[columnIndices['MaToaNha']] ?? '').trim();
      const soTangMaxRaw = values[columnIndices['SoTangMax']];
      const soTrucMaxRaw = values[columnIndices['SoTrucMax']];

      // Validate required fields
      const missingFields: string[] = [];
      if (!chuDauTu) missingFields.push('ChuDauTu');
      if (!tenDuAn) missingFields.push('TenDuAn');
      if (!maDuAn) missingFields.push('MaDuAn');
      if (!tenToaNha) missingFields.push('TenToaNha');
      if (!maToaNha) missingFields.push('MaToaNha');
      if (soTangMaxRaw === null || soTangMaxRaw === undefined || soTangMaxRaw === '') {
        missingFields.push('SoTangMax');
      }
      if (soTrucMaxRaw === null || soTrucMaxRaw === undefined || soTrucMaxRaw === '') {
        missingFields.push('SoTrucMax');
      }

      if (missingFields.length > 0) {
        errors.push({
          row: rowNumber,
          field: missingFields[0],
          message: `Missing required fields: ${missingFields.join(', ')}`,
          data: { missingFields },
        });
        logger.warn('Skipping row with missing required fields', {
          rowNumber,
          missingFields,
        });
        continue;
      }

      // Parse numeric fields
      const soTangMax = Number(soTangMaxRaw);
      const soTrucMax = Number(soTrucMaxRaw);

      if (isNaN(soTangMax) || soTangMax <= 0) {
        errors.push({
          row: rowNumber,
          field: 'SoTangMax',
          message: `Invalid SoTangMax value: ${soTangMaxRaw}`,
          data: { value: soTangMaxRaw },
        });
        logger.warn('Skipping row with invalid SoTangMax', {
          rowNumber,
          value: soTangMaxRaw,
        });
        continue;
      }

      if (isNaN(soTrucMax) || soTrucMax <= 0) {
        errors.push({
          row: rowNumber,
          field: 'SoTrucMax',
          message: `Invalid SoTrucMax value: ${soTrucMaxRaw}`,
          data: { value: soTrucMaxRaw },
        });
        logger.warn('Skipping row with invalid SoTrucMax', {
          rowNumber,
          value: soTrucMaxRaw,
        });
        continue;
      }

      // Add valid parsed data
      data.push({
        rowNumber,
        chuDauTu,
        tenDuAn,
        maDuAn,
        tenToaNha,
        maToaNha,
        soTangMax,
        soTrucMax,
      });
    }

    return { data, errors };
  }

  /**
   * Parse LayoutIDs sheet data into structured format
   * 
   * **Feature: interior-sheet-sync, Property 1: Pull parsing produces valid structures**
   * **Feature: interior-sheet-sync, Property 4: Invalid rows are skipped with errors**
   * **Validates: Requirements 1.1, 1.4, 6.1**
   * 
   * @param rows - Raw sheet rows with headers in first row
   * @returns Object containing parsed data and any errors
   */
  parseLayoutIDsSheet(rows: SheetRow[]): {
    data: ParsedLayoutData[];
    errors: SyncError[];
  } {
    const data: ParsedLayoutData[] = [];
    const errors: SyncError[] = [];

    if (rows.length === 0) {
      return { data, errors };
    }

    // First row is headers - find column indices
    const headerRow = rows[0];
    const headers = headerRow.values.map((v) => String(v ?? '').trim());
    
    const columnIndices: Record<string, number> = {};
    for (const col of LAYOUTIDS_SHEET_COLUMNS) {
      const index = headers.findIndex(
        (h) => h.toLowerCase() === col.toLowerCase()
      );
      columnIndices[col] = index;
    }

    // Validate all required columns exist
    const missingColumns = LAYOUTIDS_SHEET_COLUMNS.filter(
      (col) => columnIndices[col] === -1
    );
    if (missingColumns.length > 0) {
      errors.push({
        row: 1,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        data: { missingColumns },
      });
      return { data, errors };
    }

    // Parse data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = row.rowNumber;
      const values = row.values;

      // Extract values by column index
      const layoutAxis = String(values[columnIndices['LayoutAxis']] ?? '').trim();
      const maToaNha = String(values[columnIndices['MaToaNha']] ?? '').trim();
      const soTruc = String(values[columnIndices['SoTruc']] ?? '').trim();
      const apartmentTypeRaw = String(values[columnIndices['ApartmentType']] ?? '').trim();

      // Validate required fields
      const missingFields: string[] = [];
      if (!layoutAxis) missingFields.push('LayoutAxis');
      if (!maToaNha) missingFields.push('MaToaNha');
      if (!soTruc) missingFields.push('SoTruc');
      if (!apartmentTypeRaw) missingFields.push('ApartmentType');

      if (missingFields.length > 0) {
        errors.push({
          row: rowNumber,
          field: missingFields[0],
          message: `Missing required fields: ${missingFields.join(', ')}`,
          data: { missingFields },
        });
        logger.warn('Skipping row with missing required fields', {
          rowNumber,
          missingFields,
        });
        continue;
      }

      // Map apartment type
      const apartmentType = this.mapApartmentType(apartmentTypeRaw);
      if (!apartmentType) {
        errors.push({
          row: rowNumber,
          field: 'ApartmentType',
          message: `Invalid apartment type: ${apartmentTypeRaw}`,
          data: { value: apartmentTypeRaw, knownTypes: Object.keys(APARTMENT_TYPE_MAP) },
        });
        logger.warn('Skipping row with invalid apartment type', {
          rowNumber,
          value: apartmentTypeRaw,
        });
        continue;
      }

      // Add valid parsed data
      data.push({
        rowNumber,
        layoutAxis,
        maToaNha,
        soTruc,
        apartmentType,
      });
    }

    return { data, errors };
  }

  // ============================================
  // SYNC LOG CREATION (Internal)
  // ============================================

  /**
   * Create a sync log entry
   * 
   * **Validates: Requirements 4.1**
   * 
   * @param data - Log entry data
   * @returns Created log entry
   */
  async createSyncLog(data: {
    direction: SyncDirection;
    sheetId: string;
    sheetName: string;
    status: SyncLogStatus;
    created: number;
    updated: number;
    skipped: number;
    errors: SyncError[];
    syncedBy: string;
  }): Promise<InteriorSyncLogEntry> {
    const log = await prisma.interiorSyncLog.create({
      data: {
        direction: data.direction,
        sheetId: data.sheetId,
        sheetName: data.sheetName,
        status: data.status,
        created: data.created,
        updated: data.updated,
        skipped: data.skipped,
        errors: data.errors.length > 0 ? JSON.stringify(data.errors) : null,
        syncedBy: data.syncedBy,
      },
    });

    return {
      id: log.id,
      direction: log.direction as SyncDirection,
      sheetId: log.sheetId,
      sheetName: log.sheetName,
      status: log.status as SyncLogStatus,
      created: log.created,
      updated: log.updated,
      skipped: log.skipped,
      errors: data.errors.length > 0 ? data.errors : null,
      syncedBy: log.syncedBy,
      syncedAt: log.syncedAt,
    };
  }

  // ============================================
  // SYNC DATA METHODS
  // ============================================

  /**
   * Ensure slug is unique for developer
   */
  private async ensureUniqueDeveloperSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.interiorDeveloper.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Ensure slug is unique for development
   */
  private async ensureUniqueDevelopmentSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.interiorDevelopment.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Sync DuAn sheet data to database
   * 
   * **Feature: interior-sheet-sync, Property 2: DuAn upsert correctness**
   * **Feature: interior-sheet-sync, Property 14: Transaction rollback on failure**
   * **Validates: Requirements 1.2, 7.1, 7.2**
   * 
   * @param data - Parsed DuAn data rows
   * @returns Sync result with counts
   * @throws Error with detailed information if transaction fails (all changes rolled back)
   */
  async syncDuAnData(data: ParsedDuAnData[]): Promise<SheetSyncResult> {
    let created = 0;
    let updated = 0;
    const skipped = 0;
    const errors: SyncError[] = [];

    try {
      // Execute all operations in a single transaction
      // If any operation fails, the entire transaction is rolled back
      await prisma.$transaction(async (tx) => {
        for (const row of data) {
          // 1. Upsert Developer by name
          let developer = await tx.interiorDeveloper.findFirst({
            where: { name: row.chuDauTu },
          });

          if (!developer) {
            const baseSlug = generateSlug(row.chuDauTu);
            const slug = await this.ensureUniqueDeveloperSlug(baseSlug);
            
            // Get max order for new developer
            const maxOrder = await tx.interiorDeveloper.aggregate({
              _max: { order: true },
            });

            developer = await tx.interiorDeveloper.create({
              data: {
                name: row.chuDauTu,
                slug,
                order: (maxOrder._max.order ?? 0) + 1,
                isActive: true,
              },
            });
            logger.info('Created new developer', { name: row.chuDauTu, id: developer.id });
          }

          // 2. Upsert Development by code
          let development = await tx.interiorDevelopment.findUnique({
            where: { code: row.maDuAn },
          });

          const developmentWasCreated = !development;

          if (!development) {
            const baseSlug = generateSlug(row.tenDuAn);
            const slug = await this.ensureUniqueDevelopmentSlug(baseSlug);
            
            // Get max order for new development
            const maxOrder = await tx.interiorDevelopment.aggregate({
              _max: { order: true },
              where: { developerId: developer.id },
            });

            development = await tx.interiorDevelopment.create({
              data: {
                developerId: developer.id,
                name: row.tenDuAn,
                code: row.maDuAn,
                slug,
                order: (maxOrder._max.order ?? 0) + 1,
                isActive: true,
              },
            });
            logger.info('Created new development', { code: row.maDuAn, id: development.id });
          } else {
            // Update development if name changed
            if (development.name !== row.tenDuAn || development.developerId !== developer.id) {
              development = await tx.interiorDevelopment.update({
                where: { id: development.id },
                data: {
                  name: row.tenDuAn,
                  developerId: developer.id,
                },
              });
              logger.info('Updated development', { code: row.maDuAn, id: development.id });
            }
          }

          // 3. Upsert Building by developmentId + code
          const existingBuilding = await tx.interiorBuilding.findUnique({
            where: {
              developmentId_code: {
                developmentId: development.id,
                code: row.maToaNha,
              },
            },
          });

          if (!existingBuilding) {
            // Get max order for new building
            const maxOrder = await tx.interiorBuilding.aggregate({
              _max: { order: true },
              where: { developmentId: development.id },
            });

            // Generate default axis labels based on unitsPerFloor
            const axisLabels: string[] = [];
            for (let i = 1; i <= row.soTrucMax; i++) {
              axisLabels.push(i.toString().padStart(2, '0'));
            }

            await tx.interiorBuilding.create({
              data: {
                developmentId: development.id,
                name: row.tenToaNha,
                code: row.maToaNha,
                totalFloors: row.soTangMax,
                startFloor: 1,
                axisLabels: JSON.stringify(axisLabels),
                unitsPerFloor: row.soTrucMax,
                unitCodeFormat: `${row.maToaNha}.{floor}.{axis}`,
                order: (maxOrder._max.order ?? 0) + 1,
                isActive: true,
              },
            });
            created++;
            logger.info('Created new building', { 
              code: row.maToaNha, 
              developmentCode: row.maDuAn,
              rowNumber: row.rowNumber,
            });
          } else {
            // Update building if data changed
            const needsUpdate = 
              existingBuilding.name !== row.tenToaNha ||
              existingBuilding.totalFloors !== row.soTangMax ||
              existingBuilding.unitsPerFloor !== row.soTrucMax;

            if (needsUpdate) {
              // Regenerate axis labels if unitsPerFloor changed
              let axisLabels = existingBuilding.axisLabels;
              if (existingBuilding.unitsPerFloor !== row.soTrucMax) {
                const newAxisLabels: string[] = [];
                for (let i = 1; i <= row.soTrucMax; i++) {
                  newAxisLabels.push(i.toString().padStart(2, '0'));
                }
                axisLabels = JSON.stringify(newAxisLabels);
              }

              await tx.interiorBuilding.update({
                where: { id: existingBuilding.id },
                data: {
                  name: row.tenToaNha,
                  totalFloors: row.soTangMax,
                  unitsPerFloor: row.soTrucMax,
                  axisLabels,
                },
              });
              updated++;
              logger.info('Updated building', { 
                code: row.maToaNha, 
                developmentCode: row.maDuAn,
                rowNumber: row.rowNumber,
              });
            } else {
              // No changes needed, but count as processed
              // If development was created, count as created, otherwise unchanged
              if (developmentWasCreated) {
                created++;
              }
              // Building exists and no changes - this is an "unchanged" row
              // We don't have an "unchanged" counter, so we don't increment anything
              // The row was successfully processed
            }
          }
        }
      });
    } catch (error) {
      // Transaction was rolled back - no partial data persists
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('Transaction rolled back during DuAn sync', {
        error: errorMessage,
        stack: errorStack,
        rowCount: data.length,
      });

      // Return error result indicating complete rollback
      return {
        sheet: 'DuAn',
        created: 0,
        updated: 0,
        skipped: data.length,
        errors: [{
          row: 0,
          message: `Transaction rolled back: ${errorMessage}. All changes have been reverted.`,
          data: { 
            errorType: 'TRANSACTION_ROLLBACK',
            originalError: errorMessage,
            affectedRows: data.length,
          },
        }],
      };
    }

    return {
      sheet: 'DuAn',
      created,
      updated,
      skipped,
      errors,
    };
  }

  /**
   * Sync LayoutIDs sheet data to database
   * 
   * **Feature: interior-sheet-sync, Property 3: LayoutIDs upsert correctness**
   * **Feature: interior-sheet-sync, Property 14: Transaction rollback on failure**
   * **Validates: Requirements 1.3, 7.1, 7.2**
   * 
   * @param data - Parsed LayoutIDs data rows
   * @returns Sync result with counts
   * @throws Error with detailed information if transaction fails (all changes rolled back)
   */
  async syncLayoutData(data: ParsedLayoutData[]): Promise<SheetSyncResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: SyncError[] = [];

    try {
      // Execute all operations in a single transaction
      // If any operation fails, the entire transaction is rolled back
      await prisma.$transaction(async (tx) => {
        for (const row of data) {
          // 1. Lookup building by code
          const building = await tx.interiorBuilding.findFirst({
            where: { code: row.maToaNha },
          });

          if (!building) {
            // Building not found is a data validation error, not a transaction failure
            // We track it but continue processing other rows
            errors.push({
              row: row.rowNumber,
              field: 'MaToaNha',
              message: `Building not found: ${row.maToaNha}`,
              data: { maToaNha: row.maToaNha },
            });
            skipped++;
            logger.warn('Building not found for LayoutIDs row', {
              rowNumber: row.rowNumber,
              maToaNha: row.maToaNha,
            });
            continue;
          }

          // 2. Get or create a default layout for this unit type
          // First, try to find an existing layout for this unit type
          let layout = await tx.interiorUnitLayout.findFirst({
            where: { unitType: row.apartmentType },
          });

          if (!layout) {
            // Create a default layout for this unit type
            const bedroomCount = this.getBedroomCountFromUnitType(row.apartmentType);
            const layoutCode = `DEFAULT-${row.apartmentType}`;
            
            // Check if default layout already exists
            layout = await tx.interiorUnitLayout.findUnique({
              where: { code: layoutCode },
            });

            if (!layout) {
              layout = await tx.interiorUnitLayout.create({
                data: {
                  name: `Default ${row.apartmentType} Layout`,
                  code: layoutCode,
                  unitType: row.apartmentType,
                  bedrooms: bedroomCount,
                  bathrooms: bedroomCount > 0 ? bedroomCount : 1,
                  grossArea: this.getDefaultGrossArea(row.apartmentType),
                  netArea: this.getDefaultNetArea(row.apartmentType),
                  rooms: JSON.stringify([]),
                  isActive: true,
                },
              });
              logger.info('Created default layout', { 
                code: layoutCode, 
                unitType: row.apartmentType,
              });
            }
          }

          // 3. Upsert BuildingUnit by buildingId + axis
          const existingUnit = await tx.interiorBuildingUnit.findUnique({
            where: {
              buildingId_axis: {
                buildingId: building.id,
                axis: row.soTruc,
              },
            },
          });

          if (!existingUnit) {
            const bedroomCount = this.getBedroomCountFromUnitType(row.apartmentType);
            
            await tx.interiorBuildingUnit.create({
              data: {
                buildingId: building.id,
                axis: row.soTruc,
                unitType: row.apartmentType,
                bedrooms: bedroomCount,
                bathrooms: bedroomCount > 0 ? bedroomCount : 1,
                position: 'MIDDLE',
                floorStart: 1,
                layoutId: layout.id,
                isActive: true,
              },
            });
            created++;
            logger.info('Created new building unit', {
              buildingCode: row.maToaNha,
              axis: row.soTruc,
              unitType: row.apartmentType,
              rowNumber: row.rowNumber,
            });
          } else {
            // Update unit if data changed
            const needsUpdate = existingUnit.unitType !== row.apartmentType;

            if (needsUpdate) {
              const bedroomCount = this.getBedroomCountFromUnitType(row.apartmentType);
              
              await tx.interiorBuildingUnit.update({
                where: { id: existingUnit.id },
                data: {
                  unitType: row.apartmentType,
                  bedrooms: bedroomCount,
                  bathrooms: bedroomCount > 0 ? bedroomCount : 1,
                  layoutId: layout.id,
                },
              });
              updated++;
              logger.info('Updated building unit', {
                buildingCode: row.maToaNha,
                axis: row.soTruc,
                unitType: row.apartmentType,
                rowNumber: row.rowNumber,
              });
            }
            // If no update needed, row is unchanged (not counted)
          }
        }
      });
    } catch (error) {
      // Transaction was rolled back - no partial data persists
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('Transaction rolled back during LayoutIDs sync', {
        error: errorMessage,
        stack: errorStack,
        rowCount: data.length,
      });

      // Return error result indicating complete rollback
      return {
        sheet: 'LayoutIDs',
        created: 0,
        updated: 0,
        skipped: data.length,
        errors: [{
          row: 0,
          message: `Transaction rolled back: ${errorMessage}. All changes have been reverted.`,
          data: { 
            errorType: 'TRANSACTION_ROLLBACK',
            originalError: errorMessage,
            affectedRows: data.length,
          },
        }],
      };
    }

    return {
      sheet: 'LayoutIDs',
      created,
      updated,
      skipped,
      errors,
    };
  }

  /**
   * Get bedroom count from unit type
   */
  private getBedroomCountFromUnitType(unitType: UnitType): number {
    switch (unitType) {
      case 'STUDIO':
        return 0;
      case '1PN':
        return 1;
      case '2PN':
        return 2;
      case '3PN':
        return 3;
      case '4PN':
        return 4;
      case 'PENTHOUSE':
        return 3;
      case 'DUPLEX':
        return 3;
      case 'SHOPHOUSE':
        return 0;
      default:
        return 1;
    }
  }

  /**
   * Get default gross area for unit type
   */
  private getDefaultGrossArea(unitType: UnitType): number {
    switch (unitType) {
      case 'STUDIO':
        return 30;
      case '1PN':
        return 50;
      case '2PN':
        return 70;
      case '3PN':
        return 100;
      case '4PN':
        return 130;
      case 'PENTHOUSE':
        return 200;
      case 'DUPLEX':
        return 150;
      case 'SHOPHOUSE':
        return 100;
      default:
        return 50;
    }
  }

  /**
   * Get default net area for unit type
   */
  private getDefaultNetArea(unitType: UnitType): number {
    // Net area is typically 80-85% of gross area
    return Math.round(this.getDefaultGrossArea(unitType) * 0.82);
  }

  // ============================================
  // PUSH TRANSFORMATION METHODS
  // ============================================

  /**
   * Transform database data to DuAn sheet format
   * 
   * **Feature: interior-sheet-sync, Property 7: Push output contains required columns**
   * **Validates: Requirements 2.1, 2.2**
   * 
   * @returns Array of rows in sheet format with headers
   */
  async transformToDuAnSheet(): Promise<(string | number | null)[][]> {
    // Query all buildings with their development and developer relations
    const buildings = await prisma.interiorBuilding.findMany({
      where: { isActive: true },
      include: {
        development: {
          include: {
            developer: true,
          },
        },
      },
      orderBy: [
        { development: { developer: { order: 'asc' } } },
        { development: { order: 'asc' } },
        { order: 'asc' },
      ],
    });

    // Create header row
    const headers: (string | number | null)[] = [...DUAN_SHEET_COLUMNS];

    // Transform buildings to sheet rows
    const dataRows: (string | number | null)[][] = buildings.map((building) => [
      building.development.developer.name,  // ChuDauTu
      building.development.name,            // TenDuAn
      building.development.code,            // MaDuAn
      building.name,                        // TenToaNha
      building.code,                        // MaToaNha
      building.totalFloors,                 // SoTangMax
      building.unitsPerFloor,               // SoTrucMax
    ]);

    return [headers, ...dataRows];
  }

  /**
   * Transform database data to LayoutIDs sheet format
   * 
   * **Feature: interior-sheet-sync, Property 8: Push LayoutIDs output format**
   * **Validates: Requirements 2.1, 2.3**
   * 
   * @returns Array of rows in sheet format with headers
   */
  async transformToLayoutIDsSheet(): Promise<(string | number | null)[][]> {
    // Query all building units with their building relations
    const buildingUnits = await prisma.interiorBuildingUnit.findMany({
      where: { isActive: true },
      include: {
        building: true,
      },
      orderBy: [
        { building: { order: 'asc' } },
        { axis: 'asc' },
      ],
    });

    // Create header row
    const headers: (string | number | null)[] = [...LAYOUTIDS_SHEET_COLUMNS];

    // Transform building units to sheet rows
    const dataRows: (string | number | null)[][] = buildingUnits.map((unit) => {
      // Generate LayoutAxis: {MaToaNha}_{SoTruc}
      const layoutAxis = `${unit.building.code}_${unit.axis}`;
      
      // Map UnitType back to sheet value
      const apartmentType = UNIT_TYPE_TO_SHEET[unit.unitType as UnitType] || unit.unitType.toLowerCase();

      return [
        layoutAxis,           // LayoutAxis
        unit.building.code,   // MaToaNha
        unit.axis,            // SoTruc
        apartmentType,        // ApartmentType
      ];
    });

    return [headers, ...dataRows];
  }

  /**
   * Pull data from Google Sheet into database
   * 
   * **Feature: interior-sheet-sync, Property 5: Pull summary counts are accurate**
   * **Validates: Requirements 1.1, 1.5, 4.1**
   * 
   * @param sheetId - Google Sheet ID
   * @param sheets - Array of sheet names to sync ('DuAn', 'LayoutIDs')
   * @param userId - User ID performing the sync
   * @returns Pull result with summary
   */
  async pullFromSheet(
    sheetId: string,
    sheets: ('DuAn' | 'LayoutIDs')[],
    userId: string
  ): Promise<PullResult> {
    const results: SheetSyncResult[] = [];
    let overallSuccess = true;

    for (const sheetName of sheets) {
      try {
        // Read data from Google Sheet
        const sheetData = await this.googleSheetsService.readSheet(sheetId, sheetName);
        
        if (!sheetData || sheetData.length === 0) {
          const emptyResult: SheetSyncResult = {
            sheet: sheetName,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: [{
              row: 0,
              message: `Sheet "${sheetName}" is empty or not found`,
            }],
          };
          results.push(emptyResult);
          
          // Create log entry for empty sheet
          await this.createSyncLog({
            direction: 'pull',
            sheetId,
            sheetName,
            status: 'failed',
            created: 0,
            updated: 0,
            skipped: 0,
            errors: emptyResult.errors,
            syncedBy: userId,
          });
          
          overallSuccess = false;
          continue;
        }

        // Convert sheet data to SheetRow format
        const rows: SheetRow[] = sheetData.map((row, index) => ({
          rowNumber: index + 1,
          values: row,
        }));

        let syncResult: SheetSyncResult;

        if (sheetName === 'DuAn') {
          // Parse and sync DuAn data
          const { data, errors: parseErrors } = this.parseDuAnSheet(rows);
          
          if (parseErrors.length > 0 && data.length === 0) {
            // All rows failed parsing
            syncResult = {
              sheet: sheetName,
              created: 0,
              updated: 0,
              skipped: parseErrors.length,
              errors: parseErrors,
            };
          } else {
            // Sync valid data
            syncResult = await this.syncDuAnData(data);
            // Add parse errors to sync errors
            syncResult.errors = [...parseErrors, ...syncResult.errors];
            syncResult.skipped += parseErrors.length;
          }
        } else {
          // Parse and sync LayoutIDs data
          const { data, errors: parseErrors } = this.parseLayoutIDsSheet(rows);
          
          if (parseErrors.length > 0 && data.length === 0) {
            // All rows failed parsing
            syncResult = {
              sheet: sheetName,
              created: 0,
              updated: 0,
              skipped: parseErrors.length,
              errors: parseErrors,
            };
          } else {
            // Sync valid data
            syncResult = await this.syncLayoutData(data);
            // Add parse errors to sync errors
            syncResult.errors = [...parseErrors, ...syncResult.errors];
            syncResult.skipped += parseErrors.length;
          }
        }

        results.push(syncResult);

        // Determine status
        const status: SyncLogStatus = 
          syncResult.errors.length === 0 ? 'success' :
          syncResult.created > 0 || syncResult.updated > 0 ? 'partial' : 'failed';

        if (status === 'failed') {
          overallSuccess = false;
        }

        // Create log entry
        await this.createSyncLog({
          direction: 'pull',
          sheetId,
          sheetName,
          status,
          created: syncResult.created,
          updated: syncResult.updated,
          skipped: syncResult.skipped,
          errors: syncResult.errors,
          syncedBy: userId,
        });

        logger.info('Completed pull sync for sheet', {
          sheetName,
          created: syncResult.created,
          updated: syncResult.updated,
          skipped: syncResult.skipped,
          errorCount: syncResult.errors.length,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorResult: SheetSyncResult = {
          sheet: sheetName,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: [{
            row: 0,
            message: `Failed to read sheet: ${errorMessage}`,
          }],
        };
        results.push(errorResult);
        overallSuccess = false;

        // Create log entry for error
        await this.createSyncLog({
          direction: 'pull',
          sheetId,
          sheetName,
          status: 'failed',
          created: 0,
          updated: 0,
          skipped: 0,
          errors: errorResult.errors,
          syncedBy: userId,
        });

        logger.error('Failed to pull from sheet', {
          sheetName,
          error: errorMessage,
        });
      }
    }

    return {
      success: overallSuccess,
      results,
    };
  }

  // ============================================
  // PREVIEW METHODS
  // ============================================

  /**
   * Preview changes before syncing from Google Sheet
   * 
   * **Feature: interior-sheet-sync, Property 9: Preview change classification**
   * **Validates: Requirements 3.1, 3.2**
   * 
   * @param sheetId - Google Sheet ID
   * @param sheet - Sheet name to preview ('DuAn' or 'LayoutIDs')
   * @returns Preview result with headers, rows, and summary
   */
  async previewChanges(
    sheetId: string,
    sheet: 'DuAn' | 'LayoutIDs'
  ): Promise<PreviewResult> {
    // Read data from Google Sheet
    const sheetData = await this.googleSheetsService.readSheet(sheetId, sheet);
    
    if (!sheetData || sheetData.length === 0) {
      return {
        headers: sheet === 'DuAn' ? [...DUAN_SHEET_COLUMNS] : [...LAYOUTIDS_SHEET_COLUMNS],
        rows: [],
        summary: { add: 0, update: 0, unchanged: 0 },
      };
    }

    // Convert sheet data to SheetRow format
    const rows: SheetRow[] = sheetData.map((row, index) => ({
      rowNumber: index + 1,
      values: row,
    }));

    if (sheet === 'DuAn') {
      return this.previewDuAnChanges(rows);
    } else {
      return this.previewLayoutIDsChanges(rows);
    }
  }

  /**
   * Preview DuAn sheet changes
   */
  private async previewDuAnChanges(rows: SheetRow[]): Promise<PreviewResult> {
    const headers = [...DUAN_SHEET_COLUMNS];
    const previewRows: PreviewRow[] = [];
    let addCount = 0;
    let updateCount = 0;
    let unchangedCount = 0;

    // Parse the sheet data
    const { data, errors } = this.parseDuAnSheet(rows);

    // For each valid parsed row, compare with DB state
    for (const row of data) {
      const rowData: Record<string, string | number | null> = {
        ChuDauTu: row.chuDauTu,
        TenDuAn: row.tenDuAn,
        MaDuAn: row.maDuAn,
        TenToaNha: row.tenToaNha,
        MaToaNha: row.maToaNha,
        SoTangMax: row.soTangMax,
        SoTrucMax: row.soTrucMax,
      };

      // Check if building exists in DB
      const existingBuilding = await prisma.interiorBuilding.findFirst({
        where: {
          code: row.maToaNha,
          development: {
            code: row.maDuAn,
          },
        },
        include: {
          development: {
            include: {
              developer: true,
            },
          },
        },
      });

      if (!existingBuilding) {
        // New record - will be added
        previewRows.push({
          rowNumber: row.rowNumber,
          data: rowData,
          changeType: 'add',
        });
        addCount++;
      } else {
        // Check for changes
        const changes: string[] = [];

        if (existingBuilding.development.developer.name !== row.chuDauTu) {
          changes.push('ChuDauTu');
        }
        if (existingBuilding.development.name !== row.tenDuAn) {
          changes.push('TenDuAn');
        }
        if (existingBuilding.name !== row.tenToaNha) {
          changes.push('TenToaNha');
        }
        if (existingBuilding.totalFloors !== row.soTangMax) {
          changes.push('SoTangMax');
        }
        if (existingBuilding.unitsPerFloor !== row.soTrucMax) {
          changes.push('SoTrucMax');
        }

        if (changes.length > 0) {
          previewRows.push({
            rowNumber: row.rowNumber,
            data: rowData,
            changeType: 'update',
            changes,
          });
          updateCount++;
        } else {
          previewRows.push({
            rowNumber: row.rowNumber,
            data: rowData,
            changeType: 'unchanged',
          });
          unchangedCount++;
        }
      }
    }

    // Add error rows as 'add' with error indication
    for (const error of errors) {
      // Skip header row errors
      if (error.row === 1) continue;
      
      previewRows.push({
        rowNumber: error.row,
        data: { error: error.message },
        changeType: 'add', // Will fail during actual sync
      });
    }

    return {
      headers,
      rows: previewRows,
      summary: {
        add: addCount,
        update: updateCount,
        unchanged: unchangedCount,
      },
    };
  }

  /**
   * Preview LayoutIDs sheet changes
   */
  private async previewLayoutIDsChanges(rows: SheetRow[]): Promise<PreviewResult> {
    const headers = [...LAYOUTIDS_SHEET_COLUMNS];
    const previewRows: PreviewRow[] = [];
    let addCount = 0;
    let updateCount = 0;
    let unchangedCount = 0;

    // Parse the sheet data
    const { data, errors } = this.parseLayoutIDsSheet(rows);

    // For each valid parsed row, compare with DB state
    for (const row of data) {
      const rowData: Record<string, string | number | null> = {
        LayoutAxis: row.layoutAxis,
        MaToaNha: row.maToaNha,
        SoTruc: row.soTruc,
        ApartmentType: UNIT_TYPE_TO_SHEET[row.apartmentType] || row.apartmentType.toLowerCase(),
      };

      // Find the building first
      const building = await prisma.interiorBuilding.findFirst({
        where: { code: row.maToaNha },
      });

      if (!building) {
        // Building not found - will fail during sync, mark as add
        previewRows.push({
          rowNumber: row.rowNumber,
          data: rowData,
          changeType: 'add',
        });
        addCount++;
        continue;
      }

      // Check if building unit exists in DB
      const existingUnit = await prisma.interiorBuildingUnit.findUnique({
        where: {
          buildingId_axis: {
            buildingId: building.id,
            axis: row.soTruc,
          },
        },
      });

      if (!existingUnit) {
        // New record - will be added
        previewRows.push({
          rowNumber: row.rowNumber,
          data: rowData,
          changeType: 'add',
        });
        addCount++;
      } else {
        // Check for changes
        const changes: string[] = [];

        if (existingUnit.unitType !== row.apartmentType) {
          changes.push('ApartmentType');
        }

        if (changes.length > 0) {
          previewRows.push({
            rowNumber: row.rowNumber,
            data: rowData,
            changeType: 'update',
            changes,
          });
          updateCount++;
        } else {
          previewRows.push({
            rowNumber: row.rowNumber,
            data: rowData,
            changeType: 'unchanged',
          });
          unchangedCount++;
        }
      }
    }

    // Add error rows as 'add' with error indication
    for (const error of errors) {
      // Skip header row errors
      if (error.row === 1) continue;
      
      previewRows.push({
        rowNumber: error.row,
        data: { error: error.message },
        changeType: 'add', // Will fail during actual sync
      });
    }

    return {
      headers,
      rows: previewRows,
      summary: {
        add: addCount,
        update: updateCount,
        unchanged: unchangedCount,
      },
    };
  }

  /**
   * Push data from database to Google Sheet
   * 
   * **Feature: interior-sheet-sync**
   * **Validates: Requirements 2.1, 2.4, 4.1**
   * 
   * @param sheetId - Google Sheet ID
   * @param sheets - Array of sheet names to sync ('DuAn', 'LayoutIDs')
   * @param userId - User ID performing the sync
   * @returns Push result with summary
   */
  async pushToSheet(
    sheetId: string,
    sheets: ('DuAn' | 'LayoutIDs')[],
    userId: string
  ): Promise<PushResult> {
    const results: PushResult['results'] = [];
    let overallSuccess = true;

    for (const sheetName of sheets) {
      try {
        // Transform DB data to sheet format
        let sheetData: (string | number | null)[][];
        
        if (sheetName === 'DuAn') {
          sheetData = await this.transformToDuAnSheet();
        } else {
          sheetData = await this.transformToLayoutIDsSheet();
        }

        // Write to Google Sheet
        const rowsWritten = await this.googleSheetsService.writeSheet(
          sheetId,
          sheetName,
          sheetData
        );

        // Calculate synced count (excluding header row)
        const syncedCount = Math.max(0, rowsWritten - 1);

        results.push({
          sheet: sheetName,
          synced: syncedCount,
          errors: [],
        });

        // Create log entry
        await this.createSyncLog({
          direction: 'push',
          sheetId,
          sheetName,
          status: 'success',
          created: syncedCount,
          updated: 0,
          skipped: 0,
          errors: [],
          syncedBy: userId,
        });

        logger.info('Completed push sync for sheet', {
          sheetName,
          synced: syncedCount,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const syncError: SyncError = {
          row: 0,
          message: `Failed to write to sheet: ${errorMessage}`,
        };

        results.push({
          sheet: sheetName,
          synced: 0,
          errors: [syncError],
        });
        overallSuccess = false;

        // Create log entry for error
        await this.createSyncLog({
          direction: 'push',
          sheetId,
          sheetName,
          status: 'failed',
          created: 0,
          updated: 0,
          skipped: 0,
          errors: [syncError],
          syncedBy: userId,
        });

        logger.error('Failed to push to sheet', {
          sheetName,
          error: errorMessage,
        });
      }
    }

    return {
      success: overallSuccess,
      results,
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const interiorSyncService = new InteriorSyncService();

// ============================================
// EXPORTED FUNCTIONS (for consistency with other services)
// ============================================

/**
 * Get sync connection status
 */
export async function getStatus(): Promise<SyncStatus> {
  return interiorSyncService.getStatus();
}

/**
 * Get sync logs with pagination
 */
export async function getLogs(
  options?: ListOptions & {
    direction?: SyncDirection;
    status?: SyncLogStatus;
  }
): Promise<PaginatedResult<InteriorSyncLogEntry>> {
  return interiorSyncService.getLogs(options);
}

/**
 * Map apartment type from sheet value to UnitType
 */
export function mapApartmentType(sheetValue: string): UnitType | null {
  return interiorSyncService.mapApartmentType(sheetValue);
}

/**
 * Create a sync log entry
 */
export async function createSyncLog(data: {
  direction: SyncDirection;
  sheetId: string;
  sheetName: string;
  status: SyncLogStatus;
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[];
  syncedBy: string;
}): Promise<InteriorSyncLogEntry> {
  return interiorSyncService.createSyncLog(data);
}

/**
 * Parse DuAn sheet data
 */
export function parseDuAnSheet(rows: SheetRow[]): {
  data: ParsedDuAnData[];
  errors: SyncError[];
} {
  return interiorSyncService.parseDuAnSheet(rows);
}

/**
 * Parse LayoutIDs sheet data
 */
export function parseLayoutIDsSheet(rows: SheetRow[]): {
  data: ParsedLayoutData[];
  errors: SyncError[];
} {
  return interiorSyncService.parseLayoutIDsSheet(rows);
}

/**
 * Sync DuAn data to database
 */
export async function syncDuAnData(data: ParsedDuAnData[]): Promise<SheetSyncResult> {
  return interiorSyncService.syncDuAnData(data);
}

/**
 * Sync LayoutIDs data to database
 */
export async function syncLayoutData(data: ParsedLayoutData[]): Promise<SheetSyncResult> {
  return interiorSyncService.syncLayoutData(data);
}

/**
 * Pull data from Google Sheet into database
 */
export async function pullFromSheet(
  sheetId: string,
  sheets: ('DuAn' | 'LayoutIDs')[],
  userId: string
): Promise<PullResult> {
  return interiorSyncService.pullFromSheet(sheetId, sheets, userId);
}

/**
 * Push data from database to Google Sheet
 */
export async function pushToSheet(
  sheetId: string,
  sheets: ('DuAn' | 'LayoutIDs')[],
  userId: string
): Promise<PushResult> {
  return interiorSyncService.pushToSheet(sheetId, sheets, userId);
}

/**
 * Transform database data to DuAn sheet format
 */
export async function transformToDuAnSheet(): Promise<(string | number | null)[][]> {
  return interiorSyncService.transformToDuAnSheet();
}

/**
 * Transform database data to LayoutIDs sheet format
 */
export async function transformToLayoutIDsSheet(): Promise<(string | number | null)[][]> {
  return interiorSyncService.transformToLayoutIDsSheet();
}

/**
 * Preview changes before syncing from Google Sheet
 */
export async function previewChanges(
  sheetId: string,
  sheet: 'DuAn' | 'LayoutIDs'
): Promise<PreviewResult> {
  return interiorSyncService.previewChanges(sheetId, sheet);
}
