# 🔄 Interior Google Sheet Sync - Specification

## 📋 Tổng quan

Tính năng đồng bộ 2 chiều giữa Google Sheet và Database cho module Cấu hình nội thất.

### Mục tiêu
- **Sheet → DB**: Import/cập nhật dữ liệu từ Sheet vào hệ thống (nút "Lấy dữ liệu")
- **DB → Sheet**: Export dữ liệu từ hệ thống ra Sheet (nút "Đồng bộ lên Sheet")
- Hỗ trợ workflow: Thao tác bulk trên Sheet, sau đó sync vào hệ thống

---

## 📊 Cấu trúc Google Sheet

### Sheet 1: `DuAn` (Dự án & Tòa nhà)
| Cột | Field DB | Mô tả | Bắt buộc |
|-----|----------|-------|----------|
| ChuDauTu | InteriorDeveloper.name | Tên chủ đầu tư | ✅ |
| TenDuAn | InteriorDevelopment.name | Tên dự án | ✅ |
| MaDuAn | InteriorDevelopment.code | Mã dự án (unique) | ✅ |
| TenToaNha | InteriorBuilding.name | Tên tòa nhà | ✅ |
| MaToaNha | InteriorBuilding.code | Mã tòa nhà (unique trong dự án) | ✅ |
| SoTangMax | InteriorBuilding.totalFloors | Số tầng tối đa | ✅ |
| SoTrucMax | InteriorBuilding.unitsPerFloor | Số trục căn hộ/tầng | ✅ |

**Logic xử lý:**
- Tự động tạo/cập nhật Developer nếu chưa tồn tại
- Tự động tạo/cập nhật Development nếu chưa tồn tại
- Tự động tạo/cập nhật Building
- Key để match: `MaDuAn` + `MaToaNha`

### Sheet 2: `LayoutIDs` (Mapping trục → loại căn hộ)
| Cột | Field DB | Mô tả | Bắt buộc |
|-----|----------|-------|----------|
| LayoutAxis | InteriorBuildingUnit.id (generated) | ID duy nhất = MaToaNha_SoTruc | ✅ |
| MaToaNha | InteriorBuilding.code | Mã tòa nhà | ✅ |
| SoTruc | InteriorBuildingUnit.axis | Số thứ tự trục (0, 1, 2...) | ✅ |
| ApartmentType | InteriorBuildingUnit.unitType | Loại căn hộ (1pn, 2pn, 3pn, 1pn+) | ✅ |

**Logic xử lý:**
- Mỗi row = 1 BuildingUnit template (áp dụng cho tất cả tầng)
- `LayoutAxis` = `{MaToaNha}_{SoTruc}` (VD: LBV A_00)
- Map `ApartmentType` sang enum: 1pn→STUDIO/1PN, 2pn→2PN, 3pn→3PN, 1pn+→1PN

### Sheet 3: `ApartmentType` (Danh mục loại căn hộ) - Tương lai
| Cột | Field DB | Mô tả |
|-----|----------|-------|
| Code | UnitType enum | Mã loại (1pn, 2pn, 3pn, 1pn+, penthouse) |
| Name | Display name | Tên hiển thị |
| Bedrooms | number | Số phòng ngủ |
| Bathrooms | number | Số phòng tắm |

### Sheet 4: `MarketCap` - Tương lai
Có thể dùng cho: Giá thị trường, giá gói nội thất theo loại căn hộ...

---

## 🔧 Thiết kế kỹ thuật

### 1. API Endpoints

```
POST /api/admin/interior/sync/pull
- Lấy dữ liệu từ Sheet → DB
- Body: { sheetId: string, sheets: ['DuAn', 'LayoutIDs'] }
- Response: { created: number, updated: number, errors: string[] }

POST /api/admin/interior/sync/push  
- Đẩy dữ liệu từ DB → Sheet
- Body: { sheetId: string, sheets: ['DuAn', 'LayoutIDs'] }
- Response: { synced: number, errors: string[] }

GET /api/admin/interior/sync/status
- Kiểm tra trạng thái kết nối Sheet
- Response: { connected: boolean, lastSync: string, sheetId: string }

GET /api/admin/interior/sync/preview
- Preview dữ liệu trước khi sync
- Query: { sheetId: string, sheet: string }
- Response: { headers: string[], rows: object[], changes: { add, update, delete } }
```

### 2. Database Changes

Thêm bảng `InteriorSyncLog`:
```prisma
model InteriorSyncLog {
  id          String   @id @default(cuid())
  direction   String   // 'pull' | 'push'
  sheetId     String
  sheetName   String
  status      String   // 'success' | 'partial' | 'failed'
  created     Int      @default(0)
  updated     Int      @default(0)
  deleted     Int      @default(0)
  errors      String?  // JSON array of errors
  syncedBy    String
  syncedAt    DateTime @default(now())
}
```

Thêm fields vào các model Interior:
```prisma
// Thêm vào InteriorDeveloper, InteriorDevelopment, InteriorBuilding, InteriorBuildingUnit
sheetRowId    String?   // Row number trong Sheet để track
lastSyncedAt  DateTime? // Lần sync cuối
```

### 3. Service Layer

```typescript
// api/src/services/interior/sync.service.ts

class InteriorSyncService {
  // Pull: Sheet → DB
  async pullFromSheet(sheetId: string, sheets: string[]): Promise<SyncResult>
  
  // Push: DB → Sheet
  async pushToSheet(sheetId: string, sheets: string[]): Promise<SyncResult>
  
  // Preview changes before sync
  async previewChanges(sheetId: string, sheet: string): Promise<PreviewResult>
  
  // Parse sheet data
  private parseSheetDuAn(rows: any[]): ParsedDuAnData[]
  private parseSheetLayoutIDs(rows: any[]): ParsedLayoutData[]
  
  // Sync logic
  private syncDevelopers(data: ParsedDuAnData[]): Promise<void>
  private syncDevelopments(data: ParsedDuAnData[]): Promise<void>
  private syncBuildings(data: ParsedDuAnData[]): Promise<void>
  private syncBuildingUnits(data: ParsedLayoutData[]): Promise<void>
}
```

### 4. Admin UI

**Vị trí**: Tab mới trong InteriorPage hoặc trong QuoteSettingsTab

**Components:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Đồng bộ Google Sheet                                 │
├─────────────────────────────────────────────────────────┤
│ Sheet ID: [________________________] [🔗 Mở Sheet]      │
│                                                         │
│ Trạng thái: ✅ Đã kết nối | Sync lần cuối: 23/12 15:30 │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐                       │
│ │ 📥 Lấy dữ   │  │ 📤 Đồng bộ  │                       │
│ │    liệu     │  │   lên Sheet │                       │
│ └─────────────┘  └─────────────┘                       │
├─────────────────────────────────────────────────────────┤
│ Chọn sheets để sync:                                    │
│ ☑ DuAn (Dự án & Tòa nhà)                               │
│ ☑ LayoutIDs (Mapping trục căn hộ)                      │
│ ☐ ApartmentType (Chưa hỗ trợ)                          │
├─────────────────────────────────────────────────────────┤
│ 📋 Lịch sử đồng bộ                                      │
│ ┌──────────┬────────┬─────────┬─────────┬────────────┐ │
│ │ Thời gian│ Chiều  │ Sheet   │ Kết quả │ Chi tiết   │ │
│ ├──────────┼────────┼─────────┼─────────┼────────────┤ │
│ │ 15:30    │ Pull   │ DuAn    │ +5 ~2   │ [Xem]      │ │
│ │ 14:00    │ Push   │ All     │ ✅ 50   │ [Xem]      │ │
│ └──────────┴────────┴─────────┴─────────┴────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Sync Logic Chi tiết

### Pull (Sheet → DB)

```
1. Đọc dữ liệu từ Sheet (Google Sheets API)
2. Parse và validate từng row
3. So sánh với DB hiện tại:
   - Nếu chưa có (theo key) → CREATE
   - Nếu đã có và khác → UPDATE
   - Nếu có trong DB nhưng không có trong Sheet → SKIP (không xóa tự động)
4. Thực hiện trong transaction
5. Log kết quả
```

**Key để match:**
- Developer: `name` (tên chủ đầu tư)
- Development: `code` (mã dự án)
- Building: `developmentId` + `code` (mã tòa trong dự án)
- BuildingUnit: `buildingId` + `axis` (trục trong tòa)

### Push (DB → Sheet)

```
1. Lấy dữ liệu từ DB
2. Transform sang format Sheet
3. Clear sheet cũ (hoặc update từng row)
4. Ghi dữ liệu mới
5. Log kết quả
```

### Conflict Resolution

Khi có conflict (cả 2 bên đều thay đổi):
- **Mặc định**: Sheet wins (vì user chủ động pull)
- **Option**: Hiển thị preview để user chọn

---

## 📝 Mapping ApartmentType

| Sheet Value | DB UnitType | Bedrooms | Bathrooms |
|-------------|-------------|----------|-----------|
| 1pn | 1PN | 1 | 1 |
| 1pn+ | 1PN | 1 | 1 |
| 2pn | 2PN | 2 | 2 |
| 3pn | 3PN | 3 | 2 |
| studio | STUDIO | 0 | 1 |
| penthouse | PENTHOUSE | 3+ | 2+ |
| duplex | DUPLEX | 2+ | 2+ |

---

## 🔐 Security & Permissions

- Chỉ ADMIN mới có quyền sync
- Sheet ID được lưu trong Settings (encrypted)
- Sử dụng Service Account hoặc OAuth (đã có sẵn trong integrations)
- Rate limit: Max 1 sync/phút

---

## 📅 Implementation Plan

### Phase 1: Pull (Sheet → DB)
1. Tạo SyncService với logic pull
2. Tạo API endpoint `/sync/pull`
3. Tạo UI tab với nút "Lấy dữ liệu"
4. Xử lý sheet `DuAn`
5. Xử lý sheet `LayoutIDs`

### Phase 2: Push (DB → Sheet)
1. Thêm logic push vào SyncService
2. Tạo API endpoint `/sync/push`
3. Thêm nút "Đồng bộ lên Sheet" vào UI

### Phase 3: Preview & History
1. Tạo preview modal trước khi sync
2. Tạo bảng SyncLog
3. Hiển thị lịch sử sync

### Phase 4: Advanced (Tương lai)
1. Hỗ trợ thêm sheets (ApartmentType, MarketCap)
2. Auto-sync scheduled
3. Webhook khi Sheet thay đổi

---

## ⚠️ Lưu ý quan trọng

1. **Không xóa tự động**: Khi pull, nếu row bị xóa trong Sheet, DB không tự động xóa (tránh mất data)

2. **Backup trước sync**: Khuyến khích export DB trước khi pull lớn

3. **Validate chặt**: Reject row nếu thiếu field bắt buộc, log error

4. **Idempotent**: Chạy sync nhiều lần cho kết quả giống nhau

5. **Transaction**: Mỗi sheet sync trong 1 transaction, rollback nếu lỗi

---

## 🔗 Dependencies

- Google Sheets API (đã có trong `google-sheets.service.ts`)
- Prisma Client
- Existing Interior services (developer, development, building, buildingUnit)

---

## 📎 Tham khảo

- Google Sheet ID: Lấy từ URL `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- Existing integration: `api/src/services/google-sheets.service.ts`
- Interior routes: `api/src/routes/interior.routes.ts`
