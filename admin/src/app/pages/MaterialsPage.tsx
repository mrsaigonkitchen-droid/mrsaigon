import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { IconPicker } from '../components/IconPicker';
import { mediaApi } from '../api';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:4202';

interface MaterialCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
  _count?: { materials: number };
}

interface Material {
  id: string;
  name: string;
  categoryId: string;
  category: MaterialCategory;
  imageUrl: string | null;
  price: number;
  unit: string | null;
  description: string | null;
  isActive: boolean;
}

type TabType = 'materials' | 'categories';

export function MaterialsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  
  // Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Material | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    imageUrl: '',
    price: 0,
    unit: '',
    description: '',
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category management state
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    description: '',
    order: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const [matRes, catRes] = await Promise.all([
        fetch(`${API_URL}/materials`, { credentials: 'include' }),
        fetch(`${API_URL}/material-categories`, { credentials: 'include' }),
      ]);
      if (matRes.ok) setMaterials(await matRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Material handlers
  const resetForm = () => {
    setForm({ name: '', categoryId: categories[0]?.id || '', imageUrl: '', price: 0, unit: '', description: '', isActive: true });
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleEdit = (item: Material) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      price: item.price,
      unit: item.unit || '',
      description: item.description || '',
      isActive: item.isActive,
    });
    setIsCreating(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await mediaApi.upload(file);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_URL}${result.url}`;
      setForm(prev => ({ ...prev, imageUrl: fullUrl }));
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      toast.error('Upload thất bại: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.categoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }
    try {
      const url = editingItem ? `${API_URL}/materials/${editingItem.id}` : `${API_URL}/materials`;
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null, unit: form.unit || null }),
      });
      if (res.ok) {
        toast.success(editingItem ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
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
    if (!confirm('Bạn có chắc muốn xóa vật dụng này?')) return;
    try {
      const res = await fetch(`${API_URL}/materials/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        toast.success('Đã xóa');
        fetchData();
      }
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message);
    }
  };

  // Category handlers
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', icon: '', description: '', order: 0 });
    setEditingCategory(null);
    setIsCreatingCategory(false);
  };

  const handleEditCategory = (cat: MaterialCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      icon: cat.icon || '',
      description: cat.description || '',
      order: cat.order,
    });
    setIsCreatingCategory(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      const url = editingCategory ? `${API_URL}/material-categories/${editingCategory.id}` : `${API_URL}/material-categories`;
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        toast.success(editingCategory ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        fetchData();
        resetCategoryForm();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`${API_URL}/material-categories/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        toast.success('Đã xóa');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Không thể xóa');
      }
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const filteredItems = filterCategory === 'ALL' 
    ? materials 
    : materials.filter(m => m.categoryId === filterCategory);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: tokens.color.primary }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header with Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: tokens.color.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Vật dụng</h1>
          <p style={{ color: tokens.color.muted, margin: '8px 0 0' }}>Quản lý vật dụng và danh mục cho báo giá</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant={activeTab === 'materials' ? 'primary' : 'outline'} onClick={() => setActiveTab('materials')}>
            <i className="ri-box-3-line" /> Vật dụng
          </Button>
          <Button variant={activeTab === 'categories' ? 'primary' : 'outline'} onClick={() => setActiveTab('categories')}>
            <i className="ri-folder-line" /> Danh mục
          </Button>
        </div>
      </div>

      {activeTab === 'materials' ? (
        <>
          {/* Filter & Add */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <Button variant={filterCategory === 'ALL' ? 'primary' : 'outline'} size="small" onClick={() => setFilterCategory('ALL')}>
              Tất cả
            </Button>
            {categories.map(cat => (
              <Button key={cat.id} variant={filterCategory === cat.id ? 'primary' : 'outline'} size="small" onClick={() => setFilterCategory(cat.id)}>
                {cat.icon && <i className={cat.icon} style={{ marginRight: 4 }} />}
                {cat.name}
              </Button>
            ))}
            <Button onClick={() => { resetForm(); setForm(prev => ({ ...prev, categoryId: categories[0]?.id || '' })); setIsCreating(true); }}>
              <i className="ri-add-line" /> Thêm vật dụng
            </Button>
          </div>

          {/* Materials Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filteredItems.map(item => (
              <Card key={item.id} style={{ padding: 0, overflow: 'hidden' }}>
                {item.imageUrl ? (
                  <div style={{ height: 160, background: `url(${item.imageUrl}) center/cover`, position: 'relative' }}>
                    <span style={{
                      position: 'absolute', top: 8, right: 8, padding: '4px 8px', borderRadius: 6,
                      background: item.isActive ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                      color: '#fff', fontSize: 11, fontWeight: 500,
                    }}>
                      {item.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </div>
                ) : (
                  <div style={{ height: 160, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <i className="ri-image-line" style={{ fontSize: 48, color: tokens.color.muted }} />
                    <span style={{
                      position: 'absolute', top: 8, right: 8, padding: '4px 8px', borderRadius: 6,
                      background: item.isActive ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                      color: '#fff', fontSize: 11, fontWeight: 500,
                    }}>
                      {item.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ color: tokens.color.text, margin: 0, fontSize: 16 }}>{item.name}</h3>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: tokens.color.muted, fontSize: 11 }}>
                      {item.category?.name || 'N/A'}
                    </span>
                  </div>
                  {item.description && (
                    <p style={{ color: tokens.color.muted, margin: '0 0 12px', fontSize: 13, lineHeight: 1.4 }}>{item.description}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 18 }}>{formatPrice(item.price)}</span>
                      {item.unit && <span style={{ color: tokens.color.muted, fontSize: 12, marginLeft: 4 }}>/{item.unit}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="outline" size="small" onClick={() => handleEdit(item)}><i className="ri-edit-line" /></Button>
                      <Button variant="outline" size="small" onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }}><i className="ri-delete-bin-line" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Categories Management */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <Button onClick={() => { resetCategoryForm(); setIsCreatingCategory(true); }}>
              <i className="ri-add-line" /> Thêm danh mục
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {categories.map(cat => (
              <Card key={cat.id} style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {cat.icon && <i className={cat.icon} style={{ fontSize: 24, color: tokens.color.primary }} />}
                    <div>
                      <h3 style={{ color: tokens.color.text, margin: 0, fontSize: 16 }}>{cat.name}</h3>
                      {cat.description && <p style={{ color: tokens.color.muted, margin: '4px 0 0', fontSize: 13 }}>{cat.description}</p>}
                    </div>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: tokens.color.muted, fontSize: 12 }}>
                    {cat._count?.materials || 0} vật dụng
                  </span>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <Button variant="outline" size="small" onClick={() => handleEditCategory(cat)}>
                    <i className="ri-edit-line" /> Sửa
                  </Button>
                  <Button variant="outline" size="small" onClick={() => handleDeleteCategory(cat.id)} style={{ color: '#ef4444' }}>
                    <i className="ri-delete-bin-line" /> Xóa
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Material Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetForm}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: tokens.color.surface, borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 style={{ color: tokens.color.text, margin: '0 0 24px' }}>{editingItem ? 'Sửa vật dụng' : 'Thêm vật dụng mới'}</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <Input label="Tên vật dụng" value={form.name} onChange={val => setForm({ ...form, name: val })} placeholder="VD: Sơn Dulux" />
                <Select
                  label="Danh mục"
                  value={form.categoryId}
                  onChange={(val) => setForm({ ...form, categoryId: val })}
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                />
                
                {/* Image Upload */}
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13, marginBottom: 8, display: 'block' }}>Hình ảnh</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} style={{ display: 'none' }} />
                  {form.imageUrl ? (
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${tokens.color.border}` }}>
                      <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
                          style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.9)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                          <i className="ri-refresh-line" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleRemoveImage}
                          style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                          <i className="ri-delete-bin-line" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <motion.div whileHover={{ borderColor: tokens.color.primary }} onClick={() => !uploading && fileInputRef.current?.click()}
                      style={{ height: 180, border: `2px dashed ${tokens.color.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: uploading ? 'wait' : 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                      {uploading ? (
                        <>
                          <motion.i className="ri-loader-4-line" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 32, color: tokens.color.primary }} />
                          <span style={{ color: tokens.color.muted, fontSize: 13 }}>Đang tải lên...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-upload-cloud-2-line" style={{ fontSize: 40, color: tokens.color.muted }} />
                          <span style={{ color: tokens.color.muted, fontSize: 13 }}>Click để tải ảnh lên</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input label="Giá (VNĐ)" type="number" value={form.price} onChange={val => setForm({ ...form, price: parseInt(val) || 0 })} />
                  <Input label="Đơn vị" value={form.unit} onChange={val => setForm({ ...form, unit: val })} placeholder="VD: thùng, m², cái" />
                </div>
                <Input label="Mô tả" value={form.description} onChange={val => setForm({ ...form, description: val })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  <span style={{ color: tokens.color.text }}>Hoạt động</span>
                </label>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={resetForm}>Hủy</Button>
                <Button onClick={handleSave}>{editingItem ? 'Cập nhật' : 'Tạo mới'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {isCreatingCategory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetCategoryForm}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: tokens.color.surface, borderRadius: 16, padding: 32, width: '100%', maxWidth: 450 }}
            >
              <h2 style={{ color: tokens.color.text, margin: '0 0 24px' }}>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <Input label="Tên danh mục" value={categoryForm.name} onChange={val => setCategoryForm({ ...categoryForm, name: val })} placeholder="VD: Sơn, Gạch" />
                <IconPicker label="Icon" value={categoryForm.icon} onChange={val => setCategoryForm({ ...categoryForm, icon: val })} placeholder="Chọn icon cho danh mục" />
                <Input label="Mô tả" value={categoryForm.description} onChange={val => setCategoryForm({ ...categoryForm, description: val })} />
                <Input label="Thứ tự" type="number" value={categoryForm.order} onChange={val => setCategoryForm({ ...categoryForm, order: parseInt(val) || 0 })} />
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={resetCategoryForm}>Hủy</Button>
                <Button onClick={handleSaveCategory}>{editingCategory ? 'Cập nhật' : 'Tạo mới'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
