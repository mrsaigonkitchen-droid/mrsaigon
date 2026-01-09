/**
 * RestaurantMenuPreview Component
 * Preview cho section thực đơn nhà hàng
 */

import { tokens } from '../../../../theme';

interface Props {
  data: Record<string, unknown>;
}

export function RestaurantMenuPreview({ data }: Props) {
  const title = (data.title as string) || 'Thực Đơn';
  const subtitle = (data.subtitle as string) || '';
  const layout = (data.layout as string) || 'grid';
  const showPrice = data.showPrice !== false;
  const ctaText = (data.ctaText as string) || '';

  // Mock menu items for preview
  const mockItems = [
    { name: 'Phở bò tái', price: 75000, category: 'Món chính' },
    { name: 'Gỏi cuốn tôm thịt', price: 45000, category: 'Khai vị' },
    { name: 'Bún chả Hà Nội', price: 85000, category: 'Món chính' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: tokens.color.text, marginBottom: 8 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: tokens.color.muted, fontSize: 14 }}>{subtitle}</p>
        )}
      </div>

      {/* Layout indicator */}
      <div
        style={{
          padding: '8px 12px',
          background: tokens.color.infoBg,
          borderRadius: tokens.radius.sm,
          marginBottom: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <i className="ri-layout-grid-line" style={{ color: tokens.color.info }} />
        <span style={{ fontSize: 12, color: tokens.color.info }}>
          Layout: {layout === 'grid' ? 'Lưới' : layout === 'list' ? 'Danh sách' : 'Tabs'}
        </span>
      </div>

      {/* Mock items */}
      <div
        style={{
          display: layout === 'list' ? 'flex' : 'grid',
          flexDirection: layout === 'list' ? 'column' : undefined,
          gridTemplateColumns: layout === 'grid' ? 'repeat(3, 1fr)' : undefined,
          gap: 12,
        }}
      >
        {mockItems.map((item, index) => (
          <div
            key={index}
            style={{
              padding: 16,
              background: tokens.color.surfaceAlt,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.color.border}`,
            }}
          >
            <div
              style={{
                width: '100%',
                height: layout === 'list' ? 60 : 80,
                background: tokens.color.border,
                borderRadius: tokens.radius.sm,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="ri-image-line" style={{ fontSize: 24, color: tokens.color.muted }} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 4 }}>
              {item.name}
            </h4>
            <span style={{ fontSize: 11, color: tokens.color.muted }}>{item.category}</span>
            {showPrice && (
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: tokens.color.primaryDark }}>
                {formatPrice(item.price)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      {ctaText && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span
            style={{
              padding: '10px 24px',
              background: tokens.color.primary,
              color: '#111',
              borderRadius: tokens.radius.md,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {ctaText}
          </span>
        </div>
      )}

      {/* Info note */}
      <div
        style={{
          marginTop: 24,
          padding: 12,
          background: tokens.color.warningBg,
          borderRadius: tokens.radius.sm,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <i className="ri-information-line" style={{ color: tokens.color.warning }} />
        <span style={{ fontSize: 12, color: tokens.color.warning }}>
          Dữ liệu thực sẽ được lấy từ trang Quản lý Thực đơn
        </span>
      </div>
    </div>
  );
}
