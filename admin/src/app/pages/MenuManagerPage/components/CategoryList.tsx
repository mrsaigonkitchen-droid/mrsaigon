/**
 * CategoryList Component
 * Danh sách danh mục món ăn
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import type { MenuCategory } from '../types';

interface Props {
  categories: MenuCategory[];
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
  onEdit: (category: MenuCategory) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const CategoryList = memo(function CategoryList({
  categories,
  selectedCategory,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: Props) {
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
        <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.color.text }}>
          Danh mục
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          style={{
            padding: '6px 12px',
            background: tokens.color.primary,
            color: '#111',
            border: 'none',
            borderRadius: tokens.radius.sm,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <i className="ri-add-line" />
          Thêm
        </motion.button>
      </div>

      {/* All items option */}
      <motion.div
        whileHover={{ background: tokens.color.surfaceHover }}
        onClick={() => onSelect(null)}
        style={{
          padding: '12px 20px',
          cursor: 'pointer',
          background: selectedCategory === null ? tokens.color.surfaceHover : 'transparent',
          borderBottom: `1px solid ${tokens.color.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <i className="ri-restaurant-line" style={{ color: tokens.color.primary, fontSize: 18 }} />
        <span style={{ color: tokens.color.text, fontWeight: selectedCategory === null ? 600 : 400 }}>
          Tất cả món
        </span>
      </motion.div>

      {/* Category list */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ background: tokens.color.surfaceHover }}
            onClick={() => onSelect(category.id)}
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              background: selectedCategory === category.id ? tokens.color.surfaceHover : 'transparent',
              borderBottom: `1px solid ${tokens.color.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="ri-folder-line" style={{ color: tokens.color.muted, fontSize: 18 }} />
              <div>
                <div style={{ color: tokens.color.text, fontWeight: selectedCategory === category.id ? 600 : 400 }}>
                  {category.name}
                </div>
                {category.description && (
                  <div style={{ color: tokens.color.muted, fontSize: 12, marginTop: 2 }}>
                    {category.description}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div
              style={{ display: 'flex', gap: 4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ opacity: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(category)}
                style={{
                  padding: 6,
                  background: 'transparent',
                  border: 'none',
                  color: tokens.color.muted,
                  cursor: 'pointer',
                  borderRadius: tokens.radius.sm,
                }}
              >
                <i className="ri-edit-line" />
              </motion.button>
              <motion.button
                whileHover={{ opacity: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(category.id)}
                style={{
                  padding: 6,
                  background: 'transparent',
                  border: 'none',
                  color: tokens.color.error,
                  cursor: 'pointer',
                  borderRadius: tokens.radius.sm,
                }}
              >
                <i className="ri-delete-bin-line" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: tokens.color.muted }}>
          <i className="ri-folder-add-line" style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
          Chưa có danh mục nào
        </div>
      )}
    </div>
  );
});
