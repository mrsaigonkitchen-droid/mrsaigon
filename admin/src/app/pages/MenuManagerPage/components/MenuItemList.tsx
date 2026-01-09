/**
 * MenuItemList Component
 * Danh sách món ăn
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import type { MenuItem, MenuCategory } from '../types';

interface Props {
  items: MenuItem[];
  categories: MenuCategory[];
  selectedCategory: string | null;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onToggleAvailable: (id: string) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const MenuItemList = memo(function MenuItemList({
  items,
  categories,
  selectedCategory,
  onEdit,
  onDelete,
  onAdd,
  onToggleAvailable,
}: Props) {
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Không xác định';
  };

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : 'Tất cả món';

  return (
    <div
      style={{
        background: tokens.color.surface,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${tokens.color.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.color.text }}>
            {selectedCategoryName}
          </h3>
          <p style={{ color: tokens.color.muted, fontSize: 13, marginTop: 2 }}>
            {items.length} món
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          style={{
            padding: '8px 16px',
            background: tokens.color.primary,
            color: '#111',
            border: 'none',
            borderRadius: tokens.radius.md,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <i className="ri-add-line" />
          Thêm món
        </motion.button>
      </div>

      {/* Items grid */}
      {items.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            padding: 20,
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              style={{
                background: tokens.color.background,
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                overflow: 'hidden',
              }}
            >
              {/* Image */}
              <div
                style={{
                  height: 160,
                  background: tokens.color.surfaceHover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <i className="ri-image-line" style={{ fontSize: 40, color: tokens.color.muted }} />
                )}

                {/* Badges */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                  {item.isBestSeller && (
                    <span
                      style={{
                        padding: '2px 8px',
                        background: tokens.color.warning,
                        color: '#111',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: tokens.radius.sm,
                      }}
                    >
                      Best Seller
                    </span>
                  )}
                  {item.isSpecial && (
                    <span
                      style={{
                        padding: '2px 8px',
                        background: tokens.color.primary,
                        color: '#111',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: tokens.radius.sm,
                      }}
                    >
                      Đặc biệt
                    </span>
                  )}
                </div>

                {/* Availability toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleAvailable(item.id)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    padding: 6,
                    background: item.isAvailable ? tokens.color.success : tokens.color.error,
                    color: '#fff',
                    border: 'none',
                    borderRadius: tokens.radius.sm,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                  title={item.isAvailable ? 'Đang bán' : 'Hết hàng'}
                >
                  <i className={item.isAvailable ? 'ri-check-line' : 'ri-close-line'} />
                </motion.button>
              </div>

              {/* Content */}
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: tokens.color.text, marginBottom: 4 }}>
                    {item.name}
                  </h4>
                  {!selectedCategory && (
                    <span style={{ fontSize: 12, color: tokens.color.muted }}>
                      {getCategoryName(item.categoryId)}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: tokens.color.muted,
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: tokens.color.primary }}>
                    {formatPrice(item.price)}
                  </span>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <motion.button
                      whileHover={{ opacity: 0.8 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(item)}
                      style={{
                        padding: 8,
                        background: tokens.color.surfaceHover,
                        border: `1px solid ${tokens.color.border}`,
                        color: tokens.color.text,
                        cursor: 'pointer',
                        borderRadius: tokens.radius.sm,
                      }}
                    >
                      <i className="ri-edit-line" />
                    </motion.button>
                    <motion.button
                      whileHover={{ opacity: 0.8 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete(item.id)}
                      style={{
                        padding: 8,
                        background: tokens.color.surfaceHover,
                        border: `1px solid ${tokens.color.border}`,
                        color: tokens.color.error,
                        cursor: 'pointer',
                        borderRadius: tokens.radius.sm,
                      }}
                    >
                      <i className="ri-delete-bin-line" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.color.muted }}>
          <i className="ri-restaurant-line" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
          <p style={{ marginBottom: 16 }}>Chưa có món ăn nào</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            style={{
              padding: '10px 20px',
              background: tokens.color.primary,
              color: '#111',
              border: 'none',
              borderRadius: tokens.radius.md,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Thêm món đầu tiên
          </motion.button>
        </div>
      )}
    </div>
  );
});
