// Edit Media Modal Component
import { motion } from 'framer-motion';
import { tokens, resolveMediaUrl } from '@app/shared';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { OptimizedImage } from '../../components/OptimizedImage';
import type { EditMediaModalProps } from './types';

export function EditMediaModal({ file, formData, onFormChange, onSave, onClose }: EditMediaModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          style={{
            width: 'min(700px, 100%)',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: tokens.color.surface,
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.color.border}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: 24, 
            borderBottom: `1px solid ${tokens.color.border}`, 
            position: 'sticky', 
            top: 0, 
            background: tokens.color.surface, 
            zIndex: 10 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
                Edit Media Metadata
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tokens.color.muted,
                  cursor: 'pointer',
                  fontSize: 24,
                }}
              >
                <i className="ri-close-line" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {/* Preview */}
            <div style={{ marginBottom: 20 }}>
              <OptimizedImage
                src={resolveMediaUrl(file.url)}
                alt={file.alt || 'Media'}
                loading="eager"
                style={{ 
                  width: '100%', 
                  maxHeight: 300, 
                  objectFit: 'contain', 
                  borderRadius: tokens.radius.md, 
                  background: '#000' 
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* SEO Info */}
              <div style={{ 
                padding: '12px 16px', 
                background: `${tokens.color.primary}10`, 
                border: `1px solid ${tokens.color.primary}30`,
                borderRadius: tokens.radius.md, 
                fontSize: 13, 
                color: tokens.color.muted,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <i className="ri-seo-line" style={{ fontSize: 18, color: tokens.color.primary, marginTop: 2 }} />
                <div>
                  <strong style={{ color: tokens.color.text }}>SEO Tips:</strong> Alt text giúp Google hiểu nội dung ảnh. 
                  Mô tả ngắn gọn, chính xác những gì có trong ảnh.
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                  Alt Text (Mô tả ảnh) *
                </label>
                <textarea
                  value={formData.alt}
                  onChange={(e) => onFormChange({ ...formData, alt: e.target.value })}
                  placeholder="Ví dụ: Logo công ty Anh Thợ Xây với hình ảnh thợ xây và bánh răng"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                <p style={{ fontSize: 11, color: tokens.color.muted, marginTop: 4, marginBottom: 0 }}>
                  Quan trọng cho SEO và accessibility.
                </p>
              </div>

              {/* Tags */}
              <Input
                label="Tags (từ khóa tìm kiếm)"
                value={formData.tags}
                onChange={(value) => onFormChange({ ...formData, tags: value })}
                placeholder="logo, xây dựng, cải tạo nhà..."
                fullWidth
              />

              {/* File Info */}
              <div style={{ 
                padding: '12px 16px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: tokens.radius.md, 
                fontSize: 12, 
                color: tokens.color.muted 
              }}>
                <div><strong>URL:</strong> {file.url}</div>
                <div><strong>Size:</strong> {file.width} × {file.height} • {file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown'}</div>
                <div><strong>Uploaded:</strong> {new Date(file.createdAt).toLocaleString('vi-VN')}</div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button onClick={onSave} fullWidth icon="ri-save-line">
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={onClose} fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
