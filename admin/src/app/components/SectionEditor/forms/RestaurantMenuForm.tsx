/**
 * Restaurant Menu Section Form
 * Hiển thị thực đơn nhà hàng từ database
 */

import { tokens } from '../../../../theme';
import { FormSection, InfoBanner } from './shared';

interface RestaurantMenuFormProps {
  data: Record<string, unknown>;
  updateField: (path: string, value: unknown) => void;
}

// Simple FormField component
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: tokens.color.text,
        }}
      >
        {label}
        {required && <span style={{ color: tokens.color.error, marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function RestaurantMenuForm({ data, updateField }: RestaurantMenuFormProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <InfoBanner
        icon="ri-restaurant-2-line"
        color={tokens.color.primary}
        title="Thực đơn nhà hàng"
        description="Section này sẽ tự động hiển thị các món ăn từ trang Quản lý Thực đơn. Bạn có thể tùy chỉnh tiêu đề và cách hiển thị."
      />

      <FormSection title="Nội dung" icon="ri-text">
        <FormField label="Tiêu đề" required>
          <input
            type="text"
            value={(data.title as string) || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Thực Đơn"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
            }}
          />
        </FormField>

        <FormField label="Mô tả ngắn">
          <textarea
            value={(data.subtitle as string) || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Khám phá hương vị đặc trưng của MrSaiGon"
            rows={2}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </FormField>
      </FormSection>

      <FormSection title="Hiển thị" icon="ri-layout-grid-line">
        <FormField label="Layout">
          <select
            value={(data.layout as string) || 'grid'}
            onChange={(e) => updateField('layout', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
            }}
          >
            <option value="grid">Grid - Lưới ảnh</option>
            <option value="list">List - Danh sách</option>
            <option value="tabs">Tabs - Tab theo danh mục</option>
          </select>
        </FormField>

        <FormField label="Hiển thị giá">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(data.showPrice as boolean) !== false}
              onChange={(e) => updateField('showPrice', e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ color: tokens.color.text, fontSize: 14 }}>
              Hiển thị giá món ăn
            </span>
          </label>
        </FormField>

        <FormField label="Hiển thị mô tả">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(data.showDescription as boolean) !== false}
              onChange={(e) => updateField('showDescription', e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ color: tokens.color.text, fontSize: 14 }}>
              Hiển thị mô tả món ăn
            </span>
          </label>
        </FormField>

        <FormField label="Chỉ hiển thị Best Seller">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(data.onlyBestSeller as boolean) || false}
              onChange={(e) => updateField('onlyBestSeller', e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ color: tokens.color.text, fontSize: 14 }}>
              Chỉ hiển thị món Best Seller
            </span>
          </label>
        </FormField>

        <FormField label="Chỉ hiển thị món đặc biệt">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(data.onlySpecial as boolean) || false}
              onChange={(e) => updateField('onlySpecial', e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ color: tokens.color.text, fontSize: 14 }}>
              Chỉ hiển thị món đặc biệt
            </span>
          </label>
        </FormField>

        <FormField label="Số món tối đa (0 = tất cả)">
          <input
            type="number"
            min={0}
            value={(data.limit as number) || 0}
            onChange={(e) => updateField('limit', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
            }}
          />
        </FormField>
      </FormSection>

      <FormSection title="Nút CTA" icon="ri-cursor-line">
        <FormField label="Text nút xem thêm">
          <input
            type="text"
            value={(data.ctaText as string) || ''}
            onChange={(e) => updateField('ctaText', e.target.value)}
            placeholder="Xem toàn bộ thực đơn"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
            }}
          />
        </FormField>

        <FormField label="Link nút">
          <input
            type="text"
            value={(data.ctaLink as string) || ''}
            onChange={(e) => updateField('ctaLink', e.target.value)}
            placeholder="/menu"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
            }}
          />
        </FormField>
      </FormSection>
    </div>
  );
}
