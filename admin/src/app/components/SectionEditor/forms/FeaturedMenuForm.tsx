/**
 * FeaturedMenuForm - Form for FEATURED_MENU section
 */

import { memo } from 'react';
import { tokens } from '../../../../theme';

interface FeaturedMenuData {
  title?: string;
  subtitle?: string;
  showBestSellers?: boolean;
  showSpecials?: boolean;
  limit?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface Props {
  data: FeaturedMenuData;
  onChange: (data: FeaturedMenuData) => void;
}

export const FeaturedMenuForm = memo(function FeaturedMenuForm({ data, onChange }: Props) {
  const updateField = <K extends keyof FeaturedMenuData>(field: K, value: FeaturedMenuData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
          Tiêu đề
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Thực đơn nổi bật"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.border}`,
            background: tokens.color.background,
            color: tokens.color.text,
            fontSize: 14,
          }}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
          Mô tả
        </label>
        <input
          type="text"
          value={data.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          placeholder="Khám phá những món ăn đặc sắc của nhà hàng"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.border}`,
            background: tokens.color.background,
            color: tokens.color.text,
            fontSize: 14,
          }}
        />
      </div>

      {/* Checkboxes */}
      <div style={{ display: 'flex', gap: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.showBestSellers !== false}
            onChange={(e) => updateField('showBestSellers', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: tokens.color.primary }}
          />
          <span style={{ fontSize: 14, color: tokens.color.text }}>Hiển thị Best Sellers</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.showSpecials !== false}
            onChange={(e) => updateField('showSpecials', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: tokens.color.primary }}
          />
          <span style={{ fontSize: 14, color: tokens.color.text }}>Hiển thị món đặc biệt</span>
        </label>
      </div>

      {/* Limit */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
          Số món hiển thị (Featured)
        </label>
        <input
          type="number"
          value={data.limit || 8}
          onChange={(e) => updateField('limit', parseInt(e.target.value) || 8)}
          min={1}
          max={20}
          style={{
            width: 100,
            padding: '10px 12px',
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.border}`,
            background: tokens.color.background,
            color: tokens.color.text,
            fontSize: 14,
          }}
        />
      </div>

      {/* Auto Play */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.autoPlay !== false}
            onChange={(e) => updateField('autoPlay', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: tokens.color.primary }}
          />
          <span style={{ fontSize: 14, color: tokens.color.text }}>Tự động chuyển slide</span>
        </label>

        {data.autoPlay !== false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: tokens.color.muted }}>Mỗi</span>
            <input
              type="number"
              value={(data.autoPlayInterval || 5000) / 1000}
              onChange={(e) => updateField('autoPlayInterval', (parseInt(e.target.value) || 5) * 1000)}
              min={2}
              max={30}
              style={{
                width: 60,
                padding: '6px 10px',
                borderRadius: tokens.radius.sm,
                border: `1px solid ${tokens.color.border}`,
                background: tokens.color.background,
                color: tokens.color.text,
                fontSize: 14,
              }}
            />
            <span style={{ fontSize: 13, color: tokens.color.muted }}>giây</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: 12,
          background: `${tokens.color.info}15`,
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.color.info}30`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <i className="ri-information-line" style={{ color: tokens.color.info }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: tokens.color.info }}>Lưu ý</span>
        </div>
        <p style={{ fontSize: 12, color: tokens.color.muted, margin: 0, lineHeight: 1.5 }}>
          Section này sẽ tự động lấy dữ liệu từ Menu Manager. Đánh dấu món ăn là "Best Seller" hoặc "Đặc biệt" trong Menu Manager để hiển thị ở đây.
        </p>
      </div>
    </div>
  );
});

export default FeaturedMenuForm;
