/**
 * Interior Sync Types
 * 
 * Types and interfaces for Google Sheet sync functionality.
 * 
 * **Feature: interior-sheet-sync**
 * **Validates: Requirements 1.1, 6.1**
 */

import type { UnitType } from './types';

// ============================================
// SYNC ERROR TYPES
// ============================================

export interface SyncError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

export type SyncErrorCode =
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_APARTMENT_TYPE'
  | 'BUILDING_NOT_FOUND'
  | 'DUPLICATE_KEY'
  | 'SHEET_READ_ERROR'
  | 'SHEET_WRITE_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NOT_CONNECTED'
  | 'TRANSACTION_ROLLBACK';

// ============================================
// SYNC RESULT TYPES
// ============================================

export interface SheetSyncResult {
  sheet: string;
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[];
}

export interface PullResult {
  success: boolean;
  results: SheetSyncResult[];
}

export interface PushResult {
  success: boolean;
  results: {
    sheet: string;
    synced: number;
    errors: SyncError[];
  }[];
}

// ============================================
// PREVIEW TYPES
// ============================================

export type ChangeType = 'add' | 'update' | 'unchanged';

export interface PreviewRow {
  rowNumber: number;
  data: Record<string, string | number | null>;
  changeType: ChangeType;
  changes?: string[]; // Fields that changed (for 'update' type)
}

export interface PreviewResult {
  headers: string[];
  rows: PreviewRow[];
  summary: {
    add: number;
    update: number;
    unchanged: number;
  };
}

// ============================================
// SYNC STATUS TYPES
// ============================================

export interface SyncStatus {
  connected: boolean;
  sheetId: string | null;
  lastSync: string | null;
}

// ============================================
// SYNC LOG TYPES
// ============================================

export type SyncDirection = 'pull' | 'push';
export type SyncLogStatus = 'success' | 'partial' | 'failed';

export interface InteriorSyncLogEntry {
  id: string;
  direction: SyncDirection;
  sheetId: string;
  sheetName: string;
  status: SyncLogStatus;
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[] | null;
  syncedBy: string;
  syncedAt: Date;
}

// ============================================
// PARSED DATA TYPES
// ============================================

/**
 * Parsed data from DuAn sheet
 * Represents a row with Developer, Development, and Building info
 */
export interface ParsedDuAnData {
  rowNumber: number;
  // Developer
  chuDauTu: string;
  // Development
  tenDuAn: string;
  maDuAn: string;
  // Building
  tenToaNha: string;
  maToaNha: string;
  soTangMax: number;
  soTrucMax: number;
}

/**
 * Parsed data from LayoutIDs sheet
 * Represents a row with Building Unit mapping
 */
export interface ParsedLayoutData {
  rowNumber: number;
  layoutAxis: string;
  maToaNha: string;
  soTruc: string;
  apartmentType: UnitType;
}

// ============================================
// SHEET ROW TYPES
// ============================================

export interface SheetRow {
  rowNumber: number;
  values: (string | number | null)[];
}

// ============================================
// APARTMENT TYPE MAPPING
// ============================================

/**
 * Maps sheet apartment type values to database UnitType enum
 * 
 * **Validates: Requirements 6.1**
 */
export const APARTMENT_TYPE_MAP: Record<string, UnitType> = {
  '1pn': '1PN',
  '1pn+': '1PN',
  '2pn': '2PN',
  '3pn': '3PN',
  '4pn': '4PN',
  'studio': 'STUDIO',
  'penthouse': 'PENTHOUSE',
  'duplex': 'DUPLEX',
  'shophouse': 'SHOPHOUSE',
};

/**
 * Reverse mapping from UnitType to sheet value
 * Used when pushing data to sheet
 */
export const UNIT_TYPE_TO_SHEET: Record<UnitType, string> = {
  '1PN': '1pn',
  '2PN': '2pn',
  '3PN': '3pn',
  '4PN': '4pn',
  'STUDIO': 'studio',
  'PENTHOUSE': 'penthouse',
  'DUPLEX': 'duplex',
  'SHOPHOUSE': 'shophouse',
};

// ============================================
// SHEET COLUMN DEFINITIONS
// ============================================

export const DUAN_SHEET_COLUMNS = [
  'ChuDauTu',
  'TenDuAn',
  'MaDuAn',
  'TenToaNha',
  'MaToaNha',
  'SoTangMax',
  'SoTrucMax',
] as const;

export const LAYOUTIDS_SHEET_COLUMNS = [
  'LayoutAxis',
  'MaToaNha',
  'SoTruc',
  'ApartmentType',
] as const;

export type DuAnSheetColumn = typeof DUAN_SHEET_COLUMNS[number];
export type LayoutIDsSheetColumn = typeof LAYOUTIDS_SHEET_COLUMNS[number];
