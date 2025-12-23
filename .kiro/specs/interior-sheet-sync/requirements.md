# Requirements Document

## Introduction

Tính năng đồng bộ 2 chiều giữa Google Sheet và Database cho module Cấu hình nội thất (Interior Quote Module). Cho phép Admin import/export dữ liệu Dự án, Tòa nhà, và Căn hộ giữa Google Sheet và hệ thống, hỗ trợ workflow thao tác bulk trên Sheet rồi sync vào DB.

## Glossary

- **Interior_Sync_System**: Hệ thống đồng bộ dữ liệu nội thất giữa Google Sheet và Database
- **Pull**: Hành động lấy dữ liệu từ Google Sheet vào Database
- **Push**: Hành động đẩy dữ liệu từ Database ra Google Sheet
- **DuAn Sheet**: Sheet chứa thông tin Chủ đầu tư, Dự án, Tòa nhà
- **LayoutIDs Sheet**: Sheet chứa mapping trục căn hộ với loại căn hộ
- **Sync Log**: Bản ghi lịch sử các lần đồng bộ
- **Sheet ID**: Mã định danh duy nhất của Google Spreadsheet

## Requirements

### Requirement 1

**User Story:** As an Admin, I want to pull data from Google Sheet into the database, so that I can bulk import/update interior data efficiently.

#### Acceptance Criteria

1. WHEN an Admin initiates a pull operation with valid Sheet ID THEN the Interior_Sync_System SHALL read data from specified sheets and parse each row according to column mapping
2. WHEN parsing DuAn sheet data THEN the Interior_Sync_System SHALL create or update InteriorDeveloper, InteriorDevelopment, and InteriorBuilding records based on matching keys (MaDuAn + MaToaNha)
3. WHEN parsing LayoutIDs sheet data THEN the Interior_Sync_System SHALL create or update InteriorBuildingUnit records by matching buildingId and axis
4. WHEN a row contains missing required fields THEN the Interior_Sync_System SHALL skip that row and log the validation error
5. WHEN pull operation completes THEN the Interior_Sync_System SHALL return a summary containing counts of created, updated, and error records
6. WHEN serializing sync results THEN the Interior_Sync_System SHALL encode them using JSON format
7. WHEN parsing sync results THEN the Interior_Sync_System SHALL validate them against the defined response schema

### Requirement 2

**User Story:** As an Admin, I want to push data from database to Google Sheet, so that I can export current interior data for external editing.

#### Acceptance Criteria

1. WHEN an Admin initiates a push operation with valid Sheet ID THEN the Interior_Sync_System SHALL read data from database and transform to sheet format
2. WHEN writing to DuAn sheet THEN the Interior_Sync_System SHALL include columns ChuDauTu, TenDuAn, MaDuAn, TenToaNha, MaToaNha, SoTangMax, SoTrucMax
3. WHEN writing to LayoutIDs sheet THEN the Interior_Sync_System SHALL include columns LayoutAxis, MaToaNha, SoTruc, ApartmentType
4. WHEN push operation completes THEN the Interior_Sync_System SHALL return a summary containing count of synced records and any errors

### Requirement 3

**User Story:** As an Admin, I want to preview changes before syncing, so that I can verify data before committing changes.

#### Acceptance Criteria

1. WHEN an Admin requests preview for a sheet THEN the Interior_Sync_System SHALL return parsed data with change indicators (add, update, unchanged)
2. WHEN displaying preview THEN the Interior_Sync_System SHALL show headers, row data, and summary of changes (add count, update count, delete count)

### Requirement 4

**User Story:** As an Admin, I want to view sync history, so that I can track past sync operations and troubleshoot issues.

#### Acceptance Criteria

1. WHEN a sync operation completes THEN the Interior_Sync_System SHALL create a log record with direction, sheetId, sheetName, status, counts, errors, syncedBy, and timestamp
2. WHEN an Admin views sync history THEN the Interior_Sync_System SHALL display logs sorted by timestamp descending with pagination

### Requirement 5

**User Story:** As an Admin, I want to check sync connection status, so that I can verify Google Sheet integration is working.

#### Acceptance Criteria

1. WHEN an Admin requests sync status THEN the Interior_Sync_System SHALL return connection status, configured Sheet ID, and last sync timestamp
2. WHEN Google Sheet is not connected THEN the Interior_Sync_System SHALL indicate disconnected status with appropriate message

### Requirement 6

**User Story:** As an Admin, I want to map apartment types from sheet values to database enums, so that data is correctly transformed during sync.

#### Acceptance Criteria

1. WHEN parsing ApartmentType column THEN the Interior_Sync_System SHALL map sheet values (1pn, 2pn, 3pn, 1pn+, studio, penthouse, duplex) to corresponding UnitType enum values
2. WHEN an unknown apartment type is encountered THEN the Interior_Sync_System SHALL log a warning and use a default value or skip the row

### Requirement 7

**User Story:** As an Admin, I want sync operations to be atomic, so that partial failures do not leave data in inconsistent state.

#### Acceptance Criteria

1. WHEN processing a sheet sync THEN the Interior_Sync_System SHALL execute all database operations within a single transaction
2. IF any operation fails during sync THEN the Interior_Sync_System SHALL rollback all changes and return error details

### Requirement 8

**User Story:** As an Admin, I want rate limiting on sync operations, so that the system is protected from excessive API calls.

#### Acceptance Criteria

1. WHEN an Admin attempts to sync more than once per minute THEN the Interior_Sync_System SHALL reject the request with a rate limit error message
