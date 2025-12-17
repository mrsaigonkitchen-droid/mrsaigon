import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { blogCategoriesApi } from '../../api';
import { BlogCategory } from '../../types';
import { useToast } from '../../components/Toast';

const INITIAL_FORM = {
  name: '',
  slug: '',
  description: '',
  color: '#3b82f6',
};

export function CategoriesTab() {
  const toast = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogCategoriesApi.list();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData(INITIAL_FORM);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await blogCategoriesApi.update(editingCategory.id, formData);
        toast.success('Category đã được cập nhật!');
      } else {
        await blogCategoriesApi.create(formData);
        toast.success('Category mới đã được tạo!');
      }
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Lưu category thất bại');
    }
  }, [editingCategory, formData, loadCategories, handleCloseModal, toast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Xóa category này? Tất cả posts trong category sẽ không thể truy cập!')) return;
    try {
      await blogCategoriesApi.delete(id);
      await loadCategories();
      toast.success('Category đã được xóa!');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Xóa category thất bại');
    }
  }, [loadCategories, toast]);

  const handleEdit = useCallback((category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3b82f6',
    });
    setShowModal(true);
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  }, [editingCategory]);

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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Button onClick={() => setShowModal(true)} icon="ri-add-line">
          Tạo Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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
        <CategoryModal
          editingCategory={editingCategory}
          formData={formData}
          onNameChange={handleNameChange}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}


// Sub-components
interface CategoryCardProps {
  category: BlogCategory;
  index: number;
  onEdit: (category: BlogCategory) => void;
  onDelete: (id: string) => void;
}

function CategoryCard({ category, index, onEdit, onDelete }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: 'rgba(12,12,16,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Color Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: category.color || tokens.color.primary,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: `${category.color || tokens.color.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: category.color || tokens.color.primary,
            }}
          >
            <i className="ri-price-tag-3-line" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(category)}
            style={{
              padding: 8,
              background: 'rgba(245,211,147,0.1)',
              border: '1px solid rgba(245,211,147,0.2)',
              borderRadius: '8px',
              color: tokens.color.primary,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            <i className="ri-edit-line" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(category.id)}
            style={{
              padding: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: tokens.color.error,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            <i className="ri-delete-bin-line" />
          </motion.button>
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, color: tokens.color.text, marginBottom: 4 }}>
        {category.name}
      </h3>
      <p style={{ fontSize: 12, color: tokens.color.muted, marginBottom: 8, fontFamily: tokens.font.mono }}>
        /{category.slug}
      </p>
      {category.description && (
        <p style={{ fontSize: 13, color: tokens.color.muted, lineHeight: 1.5, marginBottom: 12 }}>
          {category.description}
        </p>
      )}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        fontSize: 12, 
        color: tokens.color.muted,
        paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ri-article-line" />
          {category._count?.posts || 0} posts
        </span>
        <span>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
    </motion.div>
  );
}

interface CategoryModalProps {
  editingCategory: BlogCategory | null;
  formData: { name: string; slug: string; description: string; color: string };
  onNameChange: (name: string) => void;
  onFormChange: React.Dispatch<React.SetStateAction<{ name: string; slug: string; description: string; color: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function CategoryModal({ editingCategory, formData, onNameChange, onFormChange, onSubmit, onClose }: CategoryModalProps) {
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
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: 'min(500px, 100%)',
            background: 'rgba(20,21,26,0.98)',
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.color.border}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ padding: 20, borderBottom: `1px solid ${tokens.color.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
              {editingCategory ? 'Sửa Category' : 'Tạo Category Mới'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: tokens.color.muted, cursor: 'pointer', fontSize: 22 }}
            >
              <i className="ri-close-line" />
            </motion.button>
          </div>

          <form onSubmit={onSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Tên Category"
              value={formData.name}
              onChange={onNameChange}
              placeholder="Ví dụ: Tin Tức, Mẹo Hay"
              required
              fullWidth
            />
            <Input
              label="Slug (URL)"
              value={formData.slug}
              onChange={(value) => onFormChange(prev => ({ ...prev, slug: value }))}
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
                onChange={(e) => onFormChange(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn về category..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
                  onChange={(e) => onFormChange(prev => ({ ...prev, color: e.target.value }))}
                  style={{
                    width: 50,
                    height: 40,
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.color.border}`,
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                  }}
                />
                <Input
                  value={formData.color}
                  onChange={(value) => onFormChange(prev => ({ ...prev, color: value }))}
                  placeholder="#3b82f6"
                  fullWidth
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 12 }}>
              <Button type="submit" fullWidth icon={editingCategory ? 'ri-save-line' : 'ri-add-line'}>
                {editingCategory ? 'Cập nhật' : 'Tạo Category'}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                Hủy
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
