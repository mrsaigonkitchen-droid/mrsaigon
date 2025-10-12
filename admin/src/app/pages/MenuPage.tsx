import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { tokens } from '@app/shared';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { menuApi, menuCategoriesApi } from '../api';
import { MenuItem, MenuCategory } from '../types';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { CategoryManagementModal } from '../components/CategoryManagementModal';
import { OptimizedImage } from '../components/OptimizedImage';

export function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    tags: [] as string[],
    isVegetarian: false,
    isSpicy: false,
    popular: false,
    available: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        menuApi.list(),
        menuCategoriesApi.list()
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const data = await menuApi.list();
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
      };

      if (editingItem) {
        await menuApi.update((editingItem as any).id, payload);
      } else {
        await menuApi.create(payload);
      }
      await loadMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa món ăn này?')) return;
    try {
      await menuApi.delete(id);
      await loadMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Xóa ${selectedItems.size} món đã chọn?`)) return;
    
    try {
      await Promise.all(Array.from(selectedItems).map(id => menuApi.delete(id)));
      await loadMenuItems();
      setSelectedItems(new Set());
      alert('Đã xóa thành công!');
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      alert('Bulk delete failed');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await menuApi.update((item as any).id, {
        available: !item.available,
      });
      setMenuItems((prev) =>
        prev.map((i) =>
          (i as any).id === (item as any).id ? { ...i, available: !item.available } : i
        )
      );
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Failed to update availability');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price?.toString() || '',
      imageUrl: item.imageUrl,
      categoryId: item.categoryId || '',
      tags: item.tags || [],
      isVegetarian: item.isVegetarian || false,
      isSpicy: item.isSpicy || false,
      popular: item.popular || false,
      available: item.available !== undefined ? item.available : true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: '',
      tags: [],
      isVegetarian: false,
      isSpicy: false,
      popular: false,
      available: true,
    });
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData({ ...formData, imageUrl });
    setShowImagePicker(false);
  };

  const handleReorder = async (newOrder: MenuItem[]) => {
    setMenuItems(newOrder);
    
    // Update order in backend
    try {
      const updates = newOrder.map((item, index) => ({
        id: (item as any).id,
        order: index,
      }));
      
      await fetch('http://localhost:4202/menu-bulk/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: updates }),
      });
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((i) => (i as any).id)));
    }
  };

  const categoryFilters = ['all', ...categories.map(c => c.id)];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategory);

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
      {/* Header */}
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
            <i className="ri-restaurant-2-line" />
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
              Menu Management
            </h1>
            <p style={{ color: tokens.color.muted, fontSize: 15, margin: '4px 0 0 0' }}>
              {menuItems.length} món • {selectedItems.size} đã chọn
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {selectedItems.size > 0 && (
            <Button onClick={handleBulkDelete} variant="secondary" icon="ri-delete-bin-line">
              Xóa ({selectedItems.size})
            </Button>
          )}
          <Button onClick={() => setShowCategoryModal(true)} variant="secondary" icon="ri-folder-line">
            Danh Mục
          </Button>
          <Button onClick={() => setShowModal(true)} icon="ri-add-line" size="large">
            Thêm Món
          </Button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
          <motion.button
            key="all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '10px 20px',
              background: selectedCategory === 'all' 
                ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`
                : 'rgba(255,255,255,0.05)',
              border: selectedCategory === 'all' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: selectedCategory === 'all' ? '#0b0c0f' : tokens.color.text,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Tất cả ({menuItems.length})
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 20px',
                background: selectedCategory === cat.id 
                  ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`
                  : 'rgba(255,255,255,0.05)',
                border: selectedCategory === cat.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: selectedCategory === cat.id ? '#0b0c0f' : tokens.color.text,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {cat.icon && <i className={cat.icon} style={{ marginRight: 6 }} />}
              {cat.name} ({cat._count?.items || menuItems.filter(i => i.categoryId === cat.id).length})
            </motion.button>
          ))}
        </div>

        {/* Select All */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={selectAll}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: tokens.color.text,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className={selectedItems.size === filteredItems.length ? 'ri-checkbox-line' : 'ri-checkbox-blank-line'} />
          {selectedItems.size === filteredItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </motion.button>

        {/* Drag Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDragging(!isDragging)}
          style={{
            padding: '10px 20px',
            background: isDragging ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})` : 'rgba(255,255,255,0.05)',
            border: isDragging ? 'none' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: isDragging ? '#0b0c0f' : tokens.color.text,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="ri-drag-move-2-line" />
          {isDragging ? 'Kéo để sắp xếp' : 'Sắp xếp'}
        </motion.button>
      </div>

      {/* Menu Grid */}
      {isDragging ? (
        <Reorder.Group
          axis="y"
          values={filteredItems}
          onReorder={handleReorder}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {filteredItems.map((item) => (
            <Reorder.Item
              key={(item as any).id}
              value={item}
              style={{
                background: 'rgba(12,12,16,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                cursor: 'grab',
              }}
            >
              <i className="ri-drag-move-line" style={{ fontSize: 24, color: tokens.color.muted }} />
              {item.imageUrl && (
                <img 
                  src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:4202${item.imageUrl}`} 
                  alt={item.name} 
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} 
                />
              )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: tokens.color.text, margin: 0 }}>{item.name}</h3>
                  <p style={{ fontSize: 14, color: tokens.color.muted, margin: '4px 0 0 0' }}>{item.category?.name || 'No category'}</p>
                </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: tokens.color.primary }}>
                {item.price ? `${parseFloat(item.price.toString()).toLocaleString('vi-VN')}đ` : 'N/A'}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={(item as any).id || index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(12,12,16,0.7)',
                backdropFilter: 'blur(20px)',
                border: selectedItems.has((item as any).id)
                  ? '2px solid rgba(245,211,147,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                opacity: item.available !== false ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(245,211,147,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedItems.has((item as any).id)
                  ? 'rgba(245,211,147,0.5)'
                  : 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
              }}
            >
              {/* Checkbox */}
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                <input
                  type="checkbox"
                  checked={selectedItems.has((item as any).id)}
                  onChange={() => toggleSelect((item as any).id)}
                  style={{
                    width: 20,
                    height: 20,
                    accentColor: tokens.color.primary,
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Badges */}
              <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!item.available && (
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(100,100,120,0.9), rgba(80,80,100,0.9))',
                    borderRadius: '10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                    SOLD OUT
                  </div>
                )}
                {item.popular && (
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))',
                    borderRadius: '10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <i className="ri-fire-line" /> Popular
                  </div>
                )}
                {item.isVegetarian && (
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
                    borderRadius: '10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <i className="ri-leaf-line" /> Veg
                  </div>
                )}
                {item.isSpicy && (
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))',
                    borderRadius: '10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <i className="ri-fire-fill" /> Spicy
                  </div>
                )}
              </div>

              {/* Image */}
              {item.imageUrl && (
                <div style={{ height: 220, background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))', overflow: 'hidden', position: 'relative' }}>
                  <OptimizedImage
                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:4202${item.imageUrl}`}
                    alt={item.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  }} />
                </div>
              )}

              {/* Content */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: tokens.color.text, marginBottom: 8 }}>
                      {item.name}
                    </h3>
                    {item.category && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: item.category.color ? `${item.category.color}20` : 'rgba(245,211,147,0.1)',
                        borderRadius: '8px',
                        fontSize: 12,
                        color: item.category.color || tokens.color.primary,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}>
                        {item.category.icon && <i className={item.category.icon} style={{ marginRight: 4, fontSize: 14 }} />}
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: 28, 
                    fontWeight: 900, 
                    background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    whiteSpace: 'nowrap',
                    marginLeft: 12,
                  }}>
                    {item.price ? `${parseFloat(item.price.toString()).toLocaleString('vi-VN')}đ` : 'N/A'}
                  </div>
                </div>

                <p style={{ fontSize: 14, color: tokens.color.muted, lineHeight: 1.6, marginBottom: 20 }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleAvailability(item)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: item.available !== false ? 'rgba(16,185,129,0.1)' : 'rgba(100,100,120,0.1)',
                      border: item.available !== false ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(100,100,120,0.2)',
                      borderRadius: '10px',
                      color: item.available !== false ? '#10b981' : tokens.color.muted,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <i className={item.available !== false ? 'ri-check-line' : 'ri-close-line'} />
                    {item.available !== false ? 'Có sẵn' : 'Hết hàng'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(item)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(245,211,147,0.1)',
                      border: '1px solid rgba(245,211,147,0.2)',
                      borderRadius: '10px',
                      color: tokens.color.primary,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <i className="ri-edit-line" /> Sửa
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete((item as any).id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '10px',
                      color: tokens.color.error,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <i className="ri-delete-bin-line" /> Xóa
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
              <i className="ri-restaurant-2-line" style={{ fontSize: 64, color: tokens.color.border, marginBottom: 16, display: 'block' }} />
              <p style={{ color: tokens.color.muted, marginBottom: 20, fontSize: 15 }}>Chưa có món ăn nào</p>
              <Button onClick={() => setShowModal(true)} icon="ri-add-line" variant="secondary">
                Thêm Món Đầu Tiên
              </Button>
            </div>
          )}
        </div>
      )}

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
                width: 'min(700px, 100%)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(20,21,26,0.98)',
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.color.border}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div style={{ padding: 24, borderBottom: `1px solid ${tokens.color.border}`, position: 'sticky', top: 0, background: 'rgba(20,21,26,0.98)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
                    {editingItem ? 'Sửa Món Ăn' : 'Thêm Món Mới'}
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
                  label="Tên món"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="Ví dụ: Phở Bò Đặc Biệt"
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
                    placeholder="Mô tả chi tiết về món ăn..."
                    rows={3}
                    required
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <Input
                    label="Giá (VNĐ)"
                    type="number"
                    value={formData.price}
                    onChange={(value) => setFormData({ ...formData, price: value })}
                    placeholder="50000"
                    required
                    fullWidth
                  />

                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                      Danh mục
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${tokens.color.border}`,
                          borderRadius: tokens.radius.md,
                          color: tokens.color.text,
                          fontSize: 14,
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      >
                        <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a', color: '#fff' }}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCategoryModal(true)}
                        style={{
                          padding: '0 16px',
                          background: 'rgba(245,211,147,0.1)',
                          border: '1px solid rgba(245,211,147,0.2)',
                          borderRadius: tokens.radius.md,
                          color: tokens.color.primary,
                          cursor: 'pointer',
                          fontSize: 18,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        title="Quản lý danh mục"
                      >
                        <i className="ri-add-line" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Tags
                    <span style={{ fontSize: 12, fontWeight: 400, color: tokens.color.muted, marginLeft: 8 }}>
                      (Nhập tags, cách nhau bởi dấu phẩy. Ví dụ: Healthy, Spicy, New)
                    </span>
                  </label>
                  <input
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setFormData({ ...formData, tags });
                    }}
                    placeholder="Healthy, Spicy, New..."
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tokens.color.border}`,
                      borderRadius: tokens.radius.md,
                      color: tokens.color.text,
                      fontSize: 14,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  {formData.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {formData.tags.map((tag, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '4px 12px',
                            background: 'rgba(245,211,147,0.15)',
                            borderRadius: '8px',
                            fontSize: 12,
                            color: tokens.color.primary,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <i className="ri-price-tag-3-line" style={{ fontSize: 14 }} />
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Đặc điểm
                  </label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[
                      { key: 'available', label: 'Có sẵn', icon: 'ri-check-line' },
                      { key: 'popular', label: 'Popular', icon: 'ri-fire-line' },
                      { key: 'isVegetarian', label: 'Vegetarian', icon: 'ri-leaf-line' },
                      { key: 'isSpicy', label: 'Spicy', icon: 'ri-fire-fill' },
                    ].map((opt) => (
                      <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData[opt.key as keyof typeof formData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.checked })}
                          style={{
                            width: 18,
                            height: 18,
                            accentColor: tokens.color.primary,
                            cursor: 'pointer',
                          }}
                        />
                        <i className={opt.icon} style={{ color: tokens.color.primary }} />
                        <span style={{ color: tokens.color.text, fontSize: 14 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Hình ảnh
                  </label>
                  {formData.imageUrl && (
                    <div style={{ marginBottom: 12 }}>
                      <img
                        src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:4202${formData.imageUrl}`}
                        alt="Preview"
                        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: tokens.radius.md }}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowImagePicker(true)}
                    fullWidth
                  >
                    <i className="ri-image-line" style={{ marginRight: 8 }} />
                    {formData.imageUrl ? 'Đổi hình ảnh' : 'Chọn hình ảnh'}
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                  <Button type="submit" fullWidth>
                    <i className={editingItem ? 'ri-save-line' : 'ri-add-line'} style={{ marginRight: 8 }} />
                    {editingItem ? 'Cập nhật' : 'Thêm món'}
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

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal
          onClose={() => setShowCategoryModal(false)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
