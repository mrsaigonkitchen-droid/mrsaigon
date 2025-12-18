---
inclusion: always
---

# 📚 ANH THỢ XÂY - Steering Guide

## 🎯 MỤC TIÊU
Đảm bảo code nhất quán, tránh trùng lặp, dễ maintain khi vibe-code lâu dài.

## 🔑 QUICK REFERENCE

### Roles (theo thứ tự quyền)
```
ADMIN > MANAGER > WORKER > USER
```

### Apps & Ports
```
landing/  → Port 4200 (Public website)
admin/    → Port 4201 (Admin dashboard)
api/      → Port 4202 (Backend API)
```

### Commands
```bash
pnpm dev:api          # Start API
pnpm dev:landing      # Start Landing
pnpm dev:admin        # Start Admin
pnpm db:generate      # Generate Prisma
pnpm db:push          # Push schema
```

### ⚠️ KIỂM TRA CODE (BẮT BUỘC chạy đủ 3)
```bash
pnpm nx run-many --target=lint --all      # ESLint
pnpm nx run-many --target=typecheck --all # TypeScript
pnpm nx run-many --target=test --all      # Unit tests
```

### Import paths
```typescript
import { tokens, API_URL, resolveMediaUrl } from '@app/shared';
// KHÔNG import cross-app!
```

## 🚫 KHÔNG BAO GIỜ

- Tạo file mới nếu đã có file tương tự
- Hardcode strings/numbers, URLs
- Dùng `any` trong TypeScript
- Comment code cũ thay vì xóa
- Suppress warnings bằng eslint-disable mà không có lý do
- **TỰ Ý push/rollback** - CHỈ khi user yêu cầu
- **🔐 Tạo API endpoint admin/manager mà KHÔNG có auth middleware**
- **🔐 Bypass auth hoặc hardcode user ID**

## ✅ LUÔN LÀM

- Kiểm tra code hiện tại trước khi tạo mới
- Follow patterns hiện có
- Validate input với Zod
- Fix errors/warnings ngay khi phát hiện
- **🔐 Kiểm tra auth khi tạo/sửa API endpoint**
- **🔐 Cập nhật Protected Routes Registry khi thêm route mới**

## 📋 CHECKLIST

### Trước khi code:
- [ ] Kiểm tra file/function tương tự đã có chưa
- [ ] Nếu API → xem `security-checklist.md`

### Sau khi code:
- [ ] Chạy lint + typecheck → 0 errors, 0 warnings
- [ ] Nếu API mới → đã thêm auth?
- [ ] Nếu form → đã có rate limiting?

## 📖 STEERING FILES

### LUÔN ĐỌC
| File | Nội dung |
|------|----------|
| `security-checklist.md` | Auth, roles, rate limiting, Protected Routes Registry |
| `ath-business-logic.md` | Business logic, công thức tính giá, roles |

### ĐỌC THEO CONTEXT (fileMatch)
| File | Trigger |
|------|---------|
| `react-patterns.md` | Files trong `landing/`, `admin/` |
| `api-patterns.md` | Files trong `api/` |
| `prisma-patterns.md` | Files trong `infra/prisma/` |

## ⚠️ CRITICAL RULES

### TYPE & PRISMA
- Prisma là nguồn sự thật cho enum/model. **CẤM** tạo enum/type trùng nghĩa
- JSON Prisma: dùng `Prisma.InputJsonValue` (ghi) / `Prisma.JsonValue` (đọc)

### IMPORT ORDER
```
1. External libraries (react, hono, etc)
2. Internal absolute imports (@app/shared, @app/ui)
3. Relative imports (./Component)
4. Types (import type ...)
```

### NAMING CONVENTIONS
- Files: PascalCase cho components, camelCase cho utils
- Components/Types: PascalCase
- Functions/Variables: camelCase
- Constants: UPPER_SNAKE_CASE

## 🔄 SPEC ↔ STEERING SYNC

Sau khi hoàn thành feature, cập nhật steering nếu có:
- API routes mới → `security-checklist.md`
- Role/permission mới → `ath-business-logic.md`
- Pattern mới → file pattern tương ứng
