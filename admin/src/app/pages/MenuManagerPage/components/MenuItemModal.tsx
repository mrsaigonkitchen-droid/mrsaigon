/**
 * MenuItemModal Component
 * Modal tạo/sửa món ăn với tính năng upload ảnh
 */

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '@app/shared';
import { tokens } from '../../../../theme';
import { ImageDropzone } from '../../../components/ImageDropzone';
import type { MenuItem, MenuCategory } from '../types';

interface Props {
  data?: MenuItem;
  categories: MenuCategory[];
  defaultCategoryId?: string | null;
  onClose: () => void;
  onSave: (data: Partial<MenuItem>) => void;
}

export const MenuItemModal = memo(function MenuItemModal({
  data,
  categories,
  defaultCategoryId,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    name: data?.name || '',
    description: data?.description || '',
    price: data?.price || 0,
    categoryId: data?.categoryId || defaultCategoryId || categories[0]?.id || '',
    imageUrl: data?.imageUrl || '',
    isBestSeller: data?.isBestSeller || false,
    isSpecial: data?.isSpecial || false,
  });
  const [useUrlInput, setUseUrlInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    onSave(form);
  };

  return (
    <>
      {/* Overlay + Centering Container */}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          overflowY: 'auto',
        }}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 550,
            maxHeight: 'calc(100vh - 32px)',
            background: tokens.color.surface,
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.color.border}`,
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            margin: 'auto',
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
            {data?.id ? 'Sửa món ăn' : 'Thêm món ăn'}
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
        <form onSubmit={handleSubmit} style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
              Tên món *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Phở bò, Bún chả..."
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

          {/* Category & Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
                Danh mục *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
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
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
                Giá (VNĐ) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
                min={0}
                step={1000}
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
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: tokens.color.muted }}>
              Mô tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về món ăn..."
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

          {/* Image Upload */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: tokens.color.muted }}>
                Hình ảnh
              </label>
              <button
                type="button"
                onClick={() => setUseUrlInput(!useUrlInput)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tokens.color.primary,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <i className={useUrlInput ? 'ri-upload-cloud-line' : 'ri-link'} style={{ fontSize: 14 }} />
                {useUrlInput ? 'Upload ảnh' : 'Nhập URL'}
              </button>
            </div>
            
            {useUrlInput ? (
              <>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
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
                />
                {form.imageUrl && (
                  <div style={{ marginTop: 8, borderRadius: tokens.radius.md, overflow: 'hidden', maxWidth: 200 }}>
                    <img src={resolveMediaUrl(form.imageUrl)} alt="Preview" style={{ width: '100%', height: 'auto' }} />
                  </div>
                )}
              </>
            ) : (
              <ImageDropzone
                value={form.imageUrl}
                onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
                onRemove={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                height={150}
                useGalleryUpload
              />
            )}
          </div>

          {/* Badges */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: tokens.color.muted }}>
              Nhãn đặc biệt
            </label>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.isBestSeller}
                  onChange={(e) => setForm(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: tokens.color.primary }}
                />
                <span style={{ color: tokens.color.text, fontSize: 14 }}>Best Seller</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.isSpecial}
                  onChange={(e) => setForm(prev => ({ ...prev, isSpecial: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: tokens.color.primary }}
                />
                <span style={{ color: tokens.color.text, fontSize: 14 }}>Món đặc biệt</span>
              </label>
            </div>
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
              disabled={!form.name.trim() || !form.categoryId}
              style={{
                padding: '10px 20px',
                background: tokens.color.primary,
                border: 'none',
                borderRadius: tokens.radius.md,
                color: '#111',
                cursor: form.name.trim() && form.categoryId ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 500,
                opacity: form.name.trim() && form.categoryId ? 1 : 0.5,
              }}
            >
              {data?.id ? 'Cập nhật' : 'Thêm món'}
            </motion.button>
          </div>
        </form>
        </motion.div>
      </motion.div>
    </>
  );
});
