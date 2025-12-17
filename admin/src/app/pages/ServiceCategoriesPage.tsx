import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { IconPicker } from '../components/IconPicker';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:4202';

interface MaterialCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  coefficient: number;
  materialCategoryIds: string[];
  allowMaterials: boolean;
  formulaId: string | null;
  order: number;
  isActive: boolean;
}

interface Formula {
  id: string;
  name: string;
}

export function ServiceCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '',
    coefficient: 1,
    materialCategoryIds: [] as string[],
    formulaId: '',
    order: 0,
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [catRes, formulaRes, matCatRes] = await Promise.all([
        fetch(`${API_URL}/service-categories`, { credentials: 'include' }),
        fetch(`${API_URL}/formulas`, { credentials: 'include' }),
        fetch(`${API_URL}/material-categories`, { credentials: 'include' }),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (formulaRes.ok) setFormulas(await formulaRes.json());
      if (matCatRes.ok) setMaterialCategories(await matCatRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ name: '', description: '', icon: '', coefficient: 1, materialCategoryIds: [], formulaId: '', order: 0, isActive: true });
    setEditingCategory(null);
    setIsCreating(false);
  };

  const handleEdit = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      coefficient: cat.coefficient,
      materialCategoryIds: cat.materialCategoryIds || [],
      formulaId: cat.formulaId || '',
      order: cat.order,
      isActive: cat.isActive,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên hạng mục');
      return;
    }
    try {
      const url = editingCategory 
        ? `${API_URL}/service-categories/${editingCategory.id}`
        : `${API_URL}/service-categories`;
      
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          formulaId: form.formulaId || null,
          icon: form.icon || null,
        }),
      });

      if (res.ok) {
        toast.success(editingCategory ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        fetchData();
        resetForm();
      } else {
        toast.error('Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hạng mục này?')) return;
    try {
      const res = await fetch(`${API_URL}/service-categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Đã xóa');
        fetchData();
      }
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message);
    }
  };

  const toggleMaterialCategory = (catId: string) => {
    setForm(prev => ({
      ...prev,
      materialCategoryIds: prev.materialCategoryIds.includes(catId)
        ? prev.materialCategoryIds.filter(id => id !== catId)
        : [...prev.materialCategoryIds, catId],
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: tokens.color.primary,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: tokens.color.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Hạng mục dịch vụ</h1>
          <p style={{ color: tokens.color.muted, margin: '8px 0 0' }}>Quản lý các hạng mục cải tạo nhà</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreating(true); }}>
          <i className="ri-add-line" /> Thêm hạng mục
        </Button>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
        {categories.map(cat => (
          <Card key={cat.id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {cat.icon && <i className={cat.icon} style={{ fontSize: 24, color: tokens.color.primary, marginTop: 2 }} />}
                <div>
                  <h3 style={{ color: tokens.color.text, margin: 0, fontSize: 18 }}>{cat.name}</h3>
                  {cat.description && (
                    <p style={{ color: tokens.color.muted, margin: '8px 0 0', fontSize: 14 }}>{cat.description}</p>
                  )}
                </div>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: 6,
                background: cat.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                color: cat.isActive ? '#10b981' : '#ef4444',
                fontSize: 12,
              }}>
                {cat.isActive ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
            
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: tokens.color.muted, fontSize: 12 }}>Hệ số</div>
                <div style={{ color: tokens.color.primary, fontSize: 20, fontWeight: 600 }}>×{cat.coefficient}</div>
              </div>
              <div>
                <div style={{ color: tokens.color.muted, fontSize: 12 }}>Danh mục vật dụng</div>
                <div style={{ color: tokens.color.text, fontSize: 14 }}>
                  {cat.materialCategoryIds?.length > 0 
                    ? `${cat.materialCategoryIds.length} danh mục`
                    : 'Không có'}
                </div>
              </div>
            </div>

            {/* Show material category names */}
            {cat.materialCategoryIds?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.materialCategoryIds.map(mcId => {
                  const mc = materialCategories.find(m => m.id === mcId);
                  return mc ? (
                    <span key={mcId} style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      color: tokens.color.muted,
                      fontSize: 11,
                    }}>
                      {mc.icon && <i className={mc.icon} style={{ marginRight: 4 }} />}
                      {mc.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Button variant="outline" size="small" onClick={() => handleEdit(cat)}>
                <i className="ri-edit-line" /> Sửa
              </Button>
              <Button variant="outline" size="small" onClick={() => handleDelete(cat.id)} style={{ color: '#ef4444' }}>
                <i className="ri-delete-bin-line" /> Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: tokens.color.surface, borderRadius: 16, padding: 32,
                width: '100%', maxWidth: 550, maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              <h2 style={{ color: tokens.color.text, margin: '0 0 24px' }}>
                {editingCategory ? 'Sửa hạng mục' : 'Thêm hạng mục mới'}
              </h2>

              <div style={{ display: 'grid', gap: 16 }}>
                <Input
                  label="Tên hạng mục"
                  value={form.name}
                  onChange={val => setForm({ ...form, name: val })}
                  placeholder="VD: Sơn tường"
                />
                <Input
                  label="Mô tả"
                  value={form.description}
                  onChange={val => setForm({ ...form, description: val })}
                  placeholder="Mô tả ngắn về hạng mục"
                />
                <IconPicker
                  label="Icon"
                  value={form.icon}
                  onChange={val => setForm({ ...form, icon: val })}
                  placeholder="Chọn icon cho hạng mục"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input
                    label="Hệ số"
                    type="number"
                    value={form.coefficient}
                    onChange={val => setForm({ ...form, coefficient: parseFloat(val) || 1 })}
                  />
                  <Input
                    label="Thứ tự"
                    type="number"
                    value={form.order}
                    onChange={val => setForm({ ...form, order: parseInt(val) || 0 })}
                  />
                </div>
                <Select
                  label="Công thức"
                  value={form.formulaId}
                  onChange={(val) => setForm({ ...form, formulaId: val })}
                  options={[
                    { value: '', label: '-- Chọn công thức --' },
                    ...formulas.map(f => ({ value: f.id, label: f.name }))
                  ]}
                />

                {/* Material Categories Multi-Select */}
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13, marginBottom: 8, display: 'block' }}>
                    Danh mục vật dụng cho phép
                  </label>
                  <div style={{
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: 8,
                    padding: 12,
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    {materialCategories.length === 0 ? (
                      <p style={{ color: tokens.color.muted, fontSize: 13, margin: 0 }}>
                        Chưa có danh mục vật dụng. Vui lòng tạo trong mục Vật dụng.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {materialCategories.map(mc => {
                          const isSelected = form.materialCategoryIds.includes(mc.id);
                          return (
                            <motion.button
                              key={mc.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleMaterialCategory(mc.id)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: `1px solid ${isSelected ? tokens.color.primary : tokens.color.border}`,
                                background: isSelected ? `${tokens.color.primary}20` : 'transparent',
                                color: isSelected ? tokens.color.primary : tokens.color.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 13,
                              }}
                            >
                              {mc.icon && <i className={mc.icon} />}
                              {mc.name}
                              {isSelected && <i className="ri-check-line" style={{ marginLeft: 4 }} />}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p style={{ color: tokens.color.muted, fontSize: 11, margin: '8px 0 0' }}>
                    Chọn các danh mục vật dụng mà khách hàng có thể chọn khi báo giá hạng mục này
                  </p>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span style={{ color: tokens.color.text }}>Hoạt động</span>
                </label>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={resetForm}>Hủy</Button>
                <Button onClick={handleSave}>
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
