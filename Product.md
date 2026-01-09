# 🍽️ MrSaiGon - Nhà hàng hẹn hò sang trọng

## 🌐 Domain
- Production: https://mrsaigon.vn/

## 0. Mục tiêu cốt lõi
WebApp cho nhà hàng MrSaiGon - Trải nghiệm ẩm thực sang trọng và lãng mạn.

1. **Khách hàng**:
   - Đặt bàn online
   - Xem menu & giá
   - Trải nghiệm không gian sang trọng qua hình ảnh/video

2. **Chủ nhà hàng**:
   - Quản lý đặt bàn
   - Quản lý menu, giá cả
   - Quản lý khuyến mãi
   - Không cần code

3. **Sẵn sàng mở rộng**:
   - Tích hợp thanh toán online
   - Loyalty program
   - SEO & Marketing automation

## I. Cấu trúc tổng thể

### 1. Landing Page (Client-facing)
Các trang:
1. **Trang chủ** - Hero, giới thiệu nhà hàng, không gian
2. **Menu** - Thực đơn với hình ảnh đẹp
3. **Đặt bàn** ⭐ (TÍNH NĂNG TRUNG TÂM)
4. **Về chúng tôi** - Câu chuyện thương hiệu
5. **Blog** - Bài viết về ẩm thực, sự kiện
6. **Liên hệ** - Thông tin liên hệ, bản đồ

### 2. Admin Panel
- Dashboard thống kê
- Quản lý đặt bàn
- Quản lý menu
- Quản lý blog
- Cài đặt hệ thống

## II. Tính năng chính

### Đặt bàn Online ⭐
- Chọn ngày/giờ
- Chọn số người
- Chọn loại bàn (thường/VIP/riêng tư)
- Ghi chú đặc biệt (sinh nhật, kỷ niệm, cầu hôn...)
- Xác nhận qua email/SMS

### Menu
- Phân loại món ăn
- Hình ảnh chất lượng cao
- Mô tả chi tiết
- Giá cả rõ ràng
- Đánh dấu món đặc biệt/best seller

## III. Phân quyền

| Role | Quyền |
|------|-------|
| **ADMIN** | Toàn quyền |
| **MANAGER** | Quản lý đặt bàn, blog, xem thống kê |

## IV. Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Hono (lightweight web framework)
- **Database**: PostgreSQL + Prisma ORM
- **Monorepo**: Nx
- **Styling**: CSS-in-JS với design tokens
