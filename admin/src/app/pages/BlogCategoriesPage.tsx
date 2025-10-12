import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { blogCategoriesApi } from '../api';
import { BlogCategory } from '../types';

export function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await blogCategoriesApi.list();
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
      if (editingCategory) {
        await blogCategoriesApi.update(editingCategory.id, formData);
      } else {
        await blogCategoriesApi.create(formData);
      }
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa category này? Tất cả posts trong category sẽ không thể truy cập!')) return;
    try {
      await blogCategoriesApi.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3b82f6',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48, display: 'block', marginBottom: 16, color: tokens.color.primary }}
        />
        <p style={{ color: tokens.color.muted }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
      {/* Modern Header với Glass */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          background: 'rgba(12,12,16,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#0b0c0f',
              boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
            }}
          >
            <i className="ri-price-tag-3-line" />
          </motion.div>
          <div>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: tokens.color.text,
                margin: 0,
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Blog Categories
            </h1>
            <p style={{ color: tokens.color.muted, fontSize: 15, margin: '4px 0 0 0' }}>
              Quản lý danh mục bài viết blog
            </p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} icon="ri-add-line" size="large">
          Tạo Category
        </Button>
      </motion.div>

      {/* Modern Categories Grid với Glass */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            style={{
              background: 'rgba(12,12,16,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: 24,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(245,211,147,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
          >
            {/* Color Accent Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${category.color || tokens.color.primary}, transparent)`,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${category.color || tokens.color.primary}, ${tokens.color.accent})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: '#0b0c0f',
                    boxShadow: `0 4px 16px ${category.color || tokens.color.primary}40`,
                  }}
                >
                  <i className="ri-price-tag-3-line" />
                </motion.div>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: category.color || tokens.color.primary,
                    boxShadow: `0 0 0 4px ${category.color || tokens.color.primary}20, 0 0 20px ${category.color || tokens.color.primary}30`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(category)}
                  style={{
                    padding: 10,
                    background: 'rgba(245,211,147,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(245,211,147,0.2)',
                    borderRadius: '10px',
                    color: tokens.color.primary,
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  <i className="ri-edit-line" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(category.id)}
                  style={{
                    padding: 10,
                    background: 'rgba(239,68,68,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px',
                    color: tokens.color.error,
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  <i className="ri-delete-bin-line" />
                </motion.button>
              </div>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, color: tokens.color.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
              {category.name}
            </h3>
            <p style={{ fontSize: 13, color: tokens.color.muted, marginBottom: 12, fontFamily: tokens.font.mono }}>
              /{category.slug}
            </p>
            {category.description && (
              <p style={{ fontSize: 14, color: tokens.color.muted, lineHeight: 1.6, marginBottom: 20 }}>
                {category.description}
              </p>
            )}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              fontSize: 13, 
              color: tokens.color.muted,
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <i className="ri-article-line" />
                {category._count?.posts || 0} posts
              </span>
              <span>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
            <i className="ri-price-tag-3-line" style={{ fontSize: 64, color: tokens.color.border, marginBottom: 16, display: 'block' }} />
            <p style={{ color: tokens.color.muted, marginBottom: 20, fontSize: 15 }}>Chưa có category nào</p>
            <Button onClick={() => setShowModal(true)} icon="ri-add-line" variant="secondary">
              Tạo Category Đầu Tiên
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
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
                width: 'min(600px, 100%)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(20,21,26,0.98)',
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.color.border}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
            <div style={{ padding: 24, borderBottom: `1px solid ${tokens.color.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
                  {editingCategory ? 'Sửa Category' : 'Tạo Category Mới'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
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

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Input
                label="Tên Category"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ví dụ: Tin Tức, Công Thức, Mẹo Nấu Ăn"
                required
                fullWidth
              />

              <Input
                label="Slug (URL)"
                value={formData.slug}
                onChange={(value) => setFormData({ ...formData, slug: value })}
                placeholder="tin-tuc"
                required
                fullWidth
              />

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về category này..."
                  rows={3}
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
                  Màu sắc
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      width: 60,
                      height: 48,
                      borderRadius: tokens.radius.md,
                      border: `1px solid ${tokens.color.border}`,
                      background: 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                    }}
                  />
                  <Input
                    value={formData.color}
                    onChange={(value) => setFormData({ ...formData, color: value })}
                    placeholder="#3b82f6"
                    fullWidth
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <Button type="submit" fullWidth>
                  <i className={editingCategory ? 'ri-save-line' : 'ri-add-line'} style={{ marginRight: 8 }} />
                  {editingCategory ? 'Cập nhật' : 'Tạo Category'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseModal} fullWidth>
                  <i className="ri-close-line" style={{ marginRight: 8 }} />
                  Hủy
                </Button>
              </div>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
