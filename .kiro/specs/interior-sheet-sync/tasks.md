# Implementation Plan

## Phase 1: Database Schema & Types

- [x] 1. Set up database and types for Interior Sync
  - [x] 1.1 Add InteriorSyncLog model to Prisma schema
    - Add model with fields: id, direction, sheetId, sheetName, status, created, updated, skipped, errors, syncedBy, syncedAt
    - Add indexes on syncedAt, direction, status
    - Run `pnpm db:generate` and `pnpm db:push`
    - _Requirements: 4.1_
  - [x] 1.2 Create sync types and interfaces
    - Create `api/src/services/interior/sync.types.ts`
    - Define SyncError, SyncResult, PullResult, PushResult, PreviewResult interfaces
    - Define ParsedDuAnData, ParsedLayoutData types
    - Define APARTMENT_TYPE_MAP constant
    - _Requirements: 1.1, 6.1_
  - [x] 1.3 Create Zod validation schemas
    - Create `api/src/schemas/interior-sync.schema.ts`
    - Define PullRequestSchema, PushRequestSchema, PreviewQuerySchema, LogsQuerySchema
    - _Requirements: 1.7_

## Phase 2: Core Sync Service

- [x] 2. Create InteriorSyncService base





  - [x] 2.1 Create InteriorSyncService base structure


    - Create `api/src/services/interior/sync.service.ts`
    - Implement constructor with GoogleSheetsService dependency
    - Implement getStatus() method
    - Implement getLogs() method with pagination
    - _Requirements: 5.1, 4.2_
  - [x] 2.2 Implement apartment type mapping


    - Implement mapApartmentType() method
    - Handle known types: 1pn, 2pn, 3pn, 1pn+, studio, penthouse, duplex
    - Return null for unknown types with warning log
    - _Requirements: 6.1, 6.2_
  - [x] 2.3 Write property test for apartment type mapping


    - **Property 12: Apartment type mapping**
    - **Validates: Requirements 6.1**
  - [x] 2.4 Write property test for unknown type handling


    - **Property 13: Unknown type handling**
    - **Validates: Requirements 6.2**

- [x] 3. Implement sheet parsing





  - [x] 3.1 Implement DuAn sheet parsing


    - Implement parseDuAnSheet() method
    - Parse columns: ChuDauTu, TenDuAn, MaDuAn, TenToaNha, MaToaNha, SoTangMax, SoTrucMax
    - Validate required fields, skip invalid rows with error logging
    - _Requirements: 1.1, 1.4_
  - [x] 3.2 Write property test for DuAn parsing


    - **Property 1: Pull parsing produces valid structures**
    - **Property 4: Invalid rows are skipped with errors**
    - **Validates: Requirements 1.1, 1.4**
  - [x] 3.3 Implement LayoutIDs sheet parsing


    - Implement parseLayoutIDsSheet() method
    - Parse columns: LayoutAxis, MaToaNha, SoTruc, ApartmentType
    - Validate required fields, map apartment types
    - _Requirements: 1.1, 1.4, 6.1_

## Phase 3: Pull Operations



- [x] 4. Implement Pull sync logic







  - [x] 4.1 Implement DuAn sync logic


    - Implement syncDuAnData() method
    - Upsert Developer by name
    - Upsert Development by code
    - Upsert Building by developmentId + code
    - Execute in transaction
    - _Requirements: 1.2, 7.1_
  - [x] 4.2 Write property test for DuAn upsert


    - **Property 2: DuAn upsert correctness**
    - **Validates: Requirements 1.2**
  - [x] 4.3 Implement LayoutIDs sync logic


    - Implement syncLayoutData() method
    - Lookup building by code
    - Upsert BuildingUnit by buildingId + axis
    - Execute in transaction
    - _Requirements: 1.3, 7.1_
  - [x] 4.4 Write property test for LayoutIDs upsert




    - **Property 3: LayoutIDs upsert correctness**
    - **Validates: Requirements 1.3**
  - [x] 4.5 Implement pullFromSheet() method


    - Read data from Google Sheet using GoogleSheetsService
    - Call appropriate parse and sync methods
    - Create sync log entry
    - Return summary with counts
    - _Requirements: 1.1, 1.5, 4.1_
  - [x] 4.6 Write property test for pull summary counts




    - **Property 5: Pull summary counts are accurate**
    - **Validates: Requirements 1.5**

- [x] 5. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Push Operations

- [x] 6. Implement Push sync logic





  - [x] 6.1 Implement DB to DuAn sheet transformation


    - Implement transformToDuAnSheet() method
    - Query Developers, Developments, Buildings
    - Transform to sheet format with columns: ChuDauTu, TenDuAn, MaDuAn, TenToaNha, MaToaNha, SoTangMax, SoTrucMax
    - _Requirements: 2.1, 2.2_
  - [x] 6.2 Write property test for DuAn output format


    - **Property 7: Push output contains required columns**
    - **Validates: Requirements 2.2**
  - [x] 6.3 Implement DB to LayoutIDs sheet transformation


    - Implement transformToLayoutIDsSheet() method
    - Query BuildingUnits with Building relations
    - Transform to sheet format with columns: LayoutAxis, MaToaNha, SoTruc, ApartmentType
    - _Requirements: 2.1, 2.3_
  - [x] 6.4 Write property test for LayoutIDs output format


    - **Property 8: Push LayoutIDs output format**
    - **Validates: Requirements 2.3**
  - [x] 6.5 Implement pushToSheet() method


    - Transform DB data to sheet format
    - Write to Google Sheet using GoogleSheetsService
    - Create sync log entry
    - Return summary
    - _Requirements: 2.1, 2.4, 4.1_

## Phase 5: Preview & Utilities

- [x] 7. Implement Preview and utility methods
  - [x] 7.1 Implement previewChanges() method
    - Read sheet data
    - Compare with DB state
    - Classify each row as add/update/unchanged
    - Return preview with headers, rows, summary
    - _Requirements: 3.1, 3.2_
  - [x] 7.2 Write property test for change classification
    - **Property 9: Preview change classification**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 7.3 Write property test for sync result round-trip
    - **Property 6: Sync result round-trip**
    - **Validates: Requirements 1.6, 1.7**
  - [x] 7.4 Write property test for log sorting
    - **Property 11: Logs sorted by timestamp**
    - **Validates: Requirements 4.2**
  - [x] 7.5 Write property test for sync log creation
    - **Property 10: Sync log creation**
    - **Validates: Requirements 4.1**

## Phase 6: API Routes

- [x] 8. Create API routes for sync
  - [x] 8.1 Create interior-sync routes file
    - Create `api/src/routes/interior-sync.routes.ts`
    - Set up Hono app with auth middleware (ADMIN only)
    - _Requirements: All_
  - [x] 8.2 Implement POST /sync/pull endpoint
    - Validate request with PullRequestSchema
    - Call syncService.pullFromSheet()
    - Return PullResponse
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [x] 8.3 Implement POST /sync/push endpoint
    - Validate request with PushRequestSchema
    - Call syncService.pushToSheet()
    - Return PushResponse
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 8.4 Implement GET /sync/preview endpoint
    - Validate query with PreviewQuerySchema
    - Call syncService.previewChanges()
    - Return PreviewResponse
    - _Requirements: 3.1, 3.2_
  - [x] 8.5 Implement GET /sync/status endpoint
    - Call syncService.getStatus()
    - Return StatusResponse
    - _Requirements: 5.1, 5.2_
  - [x] 8.6 Implement GET /sync/logs endpoint
    - Validate query with LogsQuerySchema
    - Call syncService.getLogs()
    - Return paginated LogsResponse
    - _Requirements: 4.2_
  - [x] 8.7 Add rate limiting middleware
    - Add rate limiter to pull and push endpoints
    - Max 1 request per minute per user
    - _Requirements: 8.1_
  - [x] 8.8 Write property test for rate limiting
    - **Property 15: Rate limiting enforcement**
    - **Validates: Requirements 8.1**
  - [x] 8.9 Register routes in main.ts
    - Import createInteriorSyncRoutes
    - Mount at /api/admin/interior/sync
    - _Requirements: All_

## Phase 7: Transaction & Error Handling

- [x] 9. Implement transaction and error handling






  - [x] 9.1 Implement transaction rollback

    - Wrap sync operations in Prisma transaction
    - Rollback on any error
    - Return detailed error information
    - _Requirements: 7.1, 7.2_

  - [x] 9.2 Write property test for transaction rollback

    - **Property 14: Transaction rollback on failure**
    - **Validates: Requirements 7.2**

- [x] 10. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Admin UI

- [x] 11. Create Admin UI for sync
  - [x] 11.1 Create SyncTab component
    - Create `admin/src/app/pages/InteriorPage/SyncTab.tsx`
    - Add Sheet ID input with "Open Sheet" link
    - Display connection status and last sync time
    - _Requirements: 5.1, 5.2_
  - [x] 11.2 Implement Pull/Push buttons
    - Add "Lấy dữ liệu" (Pull) button
    - Add "Đồng bộ lên Sheet" (Push) button
    - Add sheet selection checkboxes (DuAn, LayoutIDs)
    - Show loading state during operations
    - _Requirements: 1.1, 2.1_
  - [x] 11.3 Implement sync history table
    - Display sync logs with pagination
    - Show: timestamp, direction, sheet, status, counts
    - Add "View details" for error logs
    - _Requirements: 4.2_
  - [x] 11.4 Add SyncTab to InteriorPage
    - Add 'sync' to TabType
    - Add tab config with icon ri-refresh-line
    - Render SyncTab component
    - _Requirements: All_
  - [x] 11.5 Create API client functions
    - Add syncPull, syncPush, getSyncStatus, getSyncLogs, getSyncPreview to admin API
    - _Requirements: All_

## Phase 9: Final Integration

- [x] 12. Final integration






  - [x] 12.1 Update interior services index

    - Export syncService from `api/src/services/interior/index.ts`
    - _Requirements: All_

- [x] 13. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
