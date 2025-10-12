import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Button } from './Button';
import { Input } from './Input';
import { menuCategoriesApi } from '../api';
import { MenuCategory } from '../types';

interface CategoryManagementModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

export function CategoryManagementModal({ onClose, onUpdate }: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#F5D393',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await menuCategoriesApi.list();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      };

      if (editingCat) {
        await menuCategoriesApi.update(editingCat.id, payload);
      } else {
        await menuCategoriesApi.create(payload);
      }
      
      await loadCategories();
      onUpdate();
      resetForm();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (cat: MenuCategory) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      color: cat.color || '#F5D393',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa danh mục này? Các món ăn trong danh mục sẽ không bị xóa.')) return;
    try {
      await menuCategoriesApi.delete(id);
      await loadCategories();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#F5D393',
    });
  };

  // Common RemixIcon classes for menu categories
  const iconSuggestions = [
    'ri-restaurant-line',
    'ri-restaurant-2-line',
    'ri-bowl-line',
    'ri-cup-line',
    'ri-cake-3-line',
    'ri-goblet-line',
    'ri-knife-line',
    'ri-star-smile-line',
    'ri-fire-line',
    'ri-leaf-line',
  ];

  const colorPresets = [
    '#F5D393', // Gold
    '#f97316', // Orange
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ef4444', // Red
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: 'min(900px, 100%)',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(20,21,26,0.98)',
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
            background: 'rgba(20,21,26,0.98)',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
                <i className="ri-folder-line" style={{ marginRight: 8 }} />
                Quản Lý Danh Mục
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24 }}>
            {/* Form Column */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.color.text, marginBottom: 16 }}>
                {editingCat ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Tên danh mục"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="Ví dụ: Món chính"
                  required
                  fullWidth
                />

                <Input
                  label="Slug (URL-friendly)"
                  value={formData.slug}
                  onChange={(value) => setFormData({ ...formData, slug: value })}
                  placeholder="mon-chinh"
                  fullWidth
                />

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả ngắn về danh mục..."
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Icon (RemixIcon class)
                  </label>
                  <Input
                    value={formData.icon}
                    onChange={(value) => setFormData({ ...formData, icon: value })}
                    placeholder="ri-restaurant-line"
                    fullWidth
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {iconSuggestions.map((icon) => (
                      <motion.button
                        key={icon}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData({ ...formData, icon })}
                        style={{
                          width: 40,
                          height: 40,
                          background: formData.icon === icon ? 'rgba(245,211,147,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${formData.icon === icon ? 'rgba(245,211,147,0.4)' : tokens.color.border}`,
                          borderRadius: 8,
                          color: formData.icon === icon ? tokens.color.primary : tokens.color.muted,
                          cursor: 'pointer',
                          fontSize: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className={icon} />
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Màu sắc
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{
                        width: 60,
                        height: 40,
                        borderRadius: 8,
                        border: `1px solid ${tokens.color.border}`,
                        cursor: 'pointer',
                      }}
                    />
                    <Input
                      value={formData.color}
                      onChange={(value) => setFormData({ ...formData, color: value })}
                      placeholder="#F5D393"
                      fullWidth
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {colorPresets.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData({ ...formData, color })}
                        style={{
                          width: 32,
                          height: 32,
                          background: color,
                          border: formData.color === color ? '3px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                  <Button type="submit" fullWidth>
                    <i className={editingCat ? 'ri-save-line' : 'ri-add-line'} style={{ marginRight: 8 }} />
                    {editingCat ? 'Cập nhật' : 'Thêm'}
                  </Button>
                  {editingCat && (
                    <Button type="button" variant="secondary" onClick={resetForm} fullWidth>
                      <i className="ri-close-line" style={{ marginRight: 8 }} />
                      Hủy
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Categories List Column */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.color.text, marginBottom: 16 }}>
                Danh Sách Danh Mục ({categories.length})
              </h3>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: tokens.color.muted }}>
                  <motion.i
                    className="ri-loader-4-line"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ fontSize: 32, display: 'block', marginBottom: 8 }}
                  />
                  <p style={{ fontSize: 14 }}>Đang tải...</p>
                </div>
              ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: tokens.color.muted }}>
                  <i className="ri-folder-open-line" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.3 }} />
                  <p style={{ fontSize: 14 }}>Chưa có danh mục nào</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
                  <AnimatePresence>
                    {categories.map((cat, idx) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          padding: 16,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${tokens.color.border}`,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        {/* Icon & Color */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            background: `${cat.color}20`,
                            border: `2px solid ${cat.color}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            color: cat.color || tokens.color.primary,
                            flexShrink: 0,
                          }}
                        >
                          {cat.icon ? <i className={cat.icon} /> : <i className="ri-folder-line" />}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ 
                            fontSize: 15, 
                            fontWeight: 600, 
                            color: tokens.color.text, 
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {cat.name}
                          </h4>
                          {cat.description && (
                            <p style={{ 
                              fontSize: 12, 
                              color: tokens.color.muted, 
                              margin: '4px 0 0 0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {cat.description}
                            </p>
                          )}
                          <p style={{ fontSize: 11, color: tokens.color.muted, margin: '4px 0 0 0' }}>
                            {cat._count?.items || 0} món
                          </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(cat)}
                            style={{
                              width: 32,
                              height: 32,
                              background: 'rgba(245,211,147,0.1)',
                              border: '1px solid rgba(245,211,147,0.2)',
                              borderRadius: 8,
                              color: tokens.color.primary,
                              cursor: 'pointer',
                              fontSize: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <i className="ri-edit-line" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(cat.id)}
                            style={{
                              width: 32,
                              height: 32,
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: 8,
                              color: tokens.color.error,
                              cursor: 'pointer',
                              fontSize: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <i className="ri-delete-bin-line" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

