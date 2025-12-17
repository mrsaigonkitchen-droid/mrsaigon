---
inclusion: always
---

# CURSOR AI RULES - Dự án ANH THỢ XÂY

## 🎯 MỤC TIÊU
Đảm bảo code nhất quán, tránh trùng lặp, dễ maintain khi vibe-code lâu dài.

## 🎨 BRANDING (BẮT BUỘC)
- LUÔN follow BRANDING_GUIDE.md khi code UI
- LUÔN dùng constants từ @app/shared
- LUÔN dùng Logo component, Button component từ @app/ui
- KHÔNG hardcode màu sắc
- KHÔNG dùng gradient loè loẹt
- CTA luôn màu cam (Orange)

## ⚠️ QUY TẮC BẮT BUỘC

### 0. ERROR / WARNING / TYPE ENFORCEMENT (ƯU TIÊN CAO NHẤT)
- **BẮT BUỘC** pass: `pnpm nx run-many --target=typecheck --all` → 0 errors, 0 warnings.
- Warning = bug tiềm ẩn, phải fix, không suppress bằng config/eslint-disable (trừ bất khả kháng, phải ghi lý do).
- Khi fix warnings: **KHÔNG** phá cấu trúc/logic hiện có, ưu tiên sửa types/imports/naming.
- Thiếu thông tin → **HỎI**, không viết code "tạm đúng".

### 0.1 TYPE & PRISMA (CƯỠNG CHẾ)
- Prisma là nguồn sự thật cho enum/model. **CẤM** tạo enum/type trùng nghĩa.
- Import bắt buộc: `import { Prisma, $Enums } from '@prisma/client'` hoặc enum Prisma trực tiếp.
- JSON Prisma: dùng **Prisma.InputJsonValue** (ghi) / Prisma.JsonValue (đọc). **CẤM** `any | unknown | {} | Record<string, any>`.
- Không ép kiểu "dập lỗi" với Prisma. Chỉ dùng `as Type` khi có comment giải thích.

### 0.2 KIỂM TRA TRƯỚC KHI TẠO MỚI
- LUÔN kiểm tra file/function/component/type tương tự; nếu có → dùng lại/mở rộng, KHÔNG tạo mới.
- Hỏi user: "Đã có file tương tự, có muốn dùng lại không?"

### 1. CẤU TRÚC THƯ MỤC
- **Landing**: landing/src/app/sections/, landing/src/app/pages/, landing/src/app/components/
- **Admin**: admin/src/app/pages/, admin/src/app/components/, admin/src/app/forms/
- **API**: api/src/ (main.ts, middleware.ts, schemas.ts)
- **Shared**: packages/shared/src/, packages/ui/src/
- **Infra**: infra/prisma/ (schema.prisma, seed.ts)
- Mỗi file chỉ làm 1 việc, tên file mô tả rõ chức năng

### 2. NAMING CONVENTIONS
- Files: PascalCase cho components (HangMucSelector.tsx), camelCase cho utils (formatPrice.ts)
- Components: PascalCase (HangMucSelector)
- Functions/Variables: camelCase, mô tả rõ (calculateDuToan, not calc)
- Constants: UPPER_SNAKE_CASE (MAX_DIEN_TICH, LEAD_STATUS)
- Types/Interfaces: PascalCase (HangMuc, DuToanResult)

### 3. IMPORT ORDER (BẮT BUỘC)
```
1. External libraries (react, hono, etc)
2. Internal absolute imports (@app/shared, @app/ui)
3. Relative imports (./Component)
4. Types (import type ...)
5. Styles (./styles.css)
```

### 4. CODE STRUCTURE
- **Components**: State → Effects → Functions → Early returns → Render
- **Services**: Pure functions, không có side effects không cần thiết
- **Hono Routes** (API):
  - Handler: async (c: Context) => { ... }
  - Params: c.req.param('id')
  - Body: await c.req.json()
  - Response: c.json(data) hoặc c.text(), c.html()
  - Status: c.json(data, 200) hoặc c.notFound()
- **Middleware**: Hono middleware pattern (c, next) => { ... }
- Mỗi function chỉ làm 1 việc

### 5. TRÁNH CODE RÁC
- KHÔNG comment code cũ, XÓA luôn
- KHÔNG tạo utility trùng lặp
- KHÔNG hardcode strings/numbers, dùng constants
- KHÔNG tạo type trùng lặp

### 6. ERROR HANDLING
- LUÔN có try-catch cho async operations
- LUÔN validate input trước khi xử lý (Zod schemas)
- LUÔN có error messages rõ ràng

### 7. TYPESCRIPT
- LUÔN dùng types, tránh any
- Dùng interface cho objects, type cho unions/intersections
- Import types từ Prisma khi có thể

### 8. KHI USER YÊU CẦU FEATURE MỚI
1. Đọc code hiện tại liên quan
2. Kiểm tra file/function tương tự
3. Follow cấu trúc và pattern hiện có
4. Tách logic ra service/utils nếu phức tạp
5. Follow import order
6. Thêm error handling

### 9. MONOREPO NX STRUCTURE
- **Apps**: landing/, admin/, api/ - Mỗi app độc lập
- **Packages**: packages/shared/, packages/ui/ - Shared code
- **Import paths**:
  - Trong app: Relative imports (./Component)
  - Cross-app: Không import trực tiếp, dùng shared packages
  - Shared: @app/shared, @app/ui
- **Scripts**:
  - pnpm dev:api, pnpm dev:landing, pnpm dev:admin
  - pnpm db:generate, pnpm db:push, pnpm db:seed

## 📋 CHECKLIST TRƯỚC KHI TẠO CODE
- [ ] Source of truth? (Prisma enum/model hay domain type có sẵn)
- [ ] Đã tìm file/type tương tự để tái dùng/mở rộng?
- [ ] Có vi phạm "CẤM enum/type trùng Prisma" không?
- [ ] JSON field dùng Prisma.InputJsonValue chưa?
- [ ] Chắc chắn pass typecheck? Nếu không chắc → HỎI.
- [ ] Frontend: tuân design tokens từ @app/shared?
- [ ] Backend: controller/middleware mọi nhánh return/next rõ ràng?

## 🚫 KHÔNG BAO GIỜ
- Tạo file mới nếu đã có file tương tự
- Tạo function trùng lặp
- Hardcode strings/numbers
- Dùng any trong TypeScript
- Comment code cũ thay vì xóa
- Tạo utility rác trong component
- Suppress warnings bằng eslint-disable mà không có lý do

## ✅ LUÔN LÀM
- Kiểm tra code hiện tại trước
- Dùng lại code có sẵn
- Follow patterns hiện có
- Tách logic phức tạp
- Đặt tên rõ ràng, tự giải thích
- Thêm error handling
- Validate input với Zod
- Fix errors/warnings ngay khi phát hiện
