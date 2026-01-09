/**
 * CategoryModal Component
 * Modal tạo/sửa danh mục
 */

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../../../theme';
import type { MenuCategory } from '../types';

interface Props {
  data?: MenuCategory;
  onClose: () => void;
  onSave: (data: Partial<MenuCategory>) => void;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const CategoryModal = memo(function CategoryModal({ data, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: data?.name || '',
    slug: data?.slug || '',
    description: data?.description || '',
  });
  const [autoSlug, setAutoSlug] = useState(!data?.id);

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm(prev => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, autoSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(450px, 90vw)',
          background: tokens.color.surface,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.color.border}`,
          zIndex: 9999,
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
            {data?.id ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h3>
          <motion.button
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              color: tokens.color.muted,
              cursor: 'pointer',
            }}
          >
            <i className="ri-close-line" style={{ fontSize: 20 }} />
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
              Tên danh mục *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Khai vị, Món chính..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                background: tokens.color.background,
                color: tokens.color.text,
                fontSize: 14,
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
              Slug (URL)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setForm(prev => ({ ...prev, slug: e.target.value }));
                }}
                placeholder="khai-vi"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.color.border}`,
                  background: tokens.color.background,
                  color: tokens.color.text,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <motion.button
                type="button"
                whileHover={{ opacity: 0.8 }}
                onClick={() => {
                  setAutoSlug(true);
                  setForm(prev => ({ ...prev, slug: generateSlug(form.name) }));
                }}
                style={{
                  padding: '10px 12px',
                  background: tokens.color.surfaceHover,
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                  color: tokens.color.text,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Tự động
              </motion.button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
              Mô tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về danh mục..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                background: tokens.color.background,
                color: tokens.color.text,
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <motion.button
              type="button"
              whileHover={{ opacity: 0.8 }}
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: tokens.color.surfaceHover,
                border: `1px solid ${tokens.color.border}`,
                borderRadius: tokens.radius.md,
                color: tokens.color.text,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Hủy
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
              disabled={!form.name.trim()}
              style={{
                padding: '10px 20px',
                background: tokens.color.primary,
                border: 'none',
                borderRadius: tokens.radius.md,
                color: '#111',
                cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 500,
                opacity: form.name.trim() ? 1 : 0.5,
              }}
            >
              {data?.id ? 'Cập nhật' : 'Tạo mới'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </>
  );
});
