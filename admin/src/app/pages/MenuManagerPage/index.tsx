/**
 * MenuManagerPage
 * Quản lý thực đơn nhà hàng MrSaiGon
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { useToast } from '../../components/Toast';
import { CategoryList } from './components/CategoryList';
import { MenuItemList } from './components/MenuItemList';
import { CategoryModal } from './components/CategoryModal';
import { MenuItemModal } from './components/MenuItemModal';
import type { MenuCategory, MenuItem } from './types';

export const MenuManagerPage = memo(function MenuManagerPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; data?: MenuCategory }>({ open: false });
  const [menuItemModal, setMenuItemModal] = useState<{ open: boolean; data?: MenuItem }>({ open: false });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // For now, use mock data
      setCategories([
        { id: '1', name: 'Khai vị', slug: 'khai-vi', description: 'Các món khai vị', order: 1, isActive: true },
        { id: '2', name: 'Món chính', slug: 'mon-chinh', description: 'Các món chính', order: 2, isActive: true },
        { id: '3', name: 'Tráng miệng', slug: 'trang-mieng', description: 'Các món tráng miệng', order: 3, isActive: true },
        { id: '4', name: 'Đồ uống', slug: 'do-uong', description: 'Các loại đồ uống', order: 4, isActive: true },
      ]);
      setMenuItems([]);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Filter items by category
  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems;

  // Category handlers
  const handleSaveCategory = useCallback(async (data: Partial<MenuCategory>) => {
    try {
      if (categoryModal.data?.id) {
        // Update
        setCategories(prev => prev.map(c => c.id === categoryModal.data?.id ? { ...c, ...data } : c));
        toast.success('Đã cập nhật danh mục');
      } else {
        // Create
        const newCategory: MenuCategory = {
          id: Date.now().toString(),
          name: data.name || '',
          slug: data.slug || '',
          description: data.description,
          order: categories.length + 1,
          isActive: true,
        };
        setCategories(prev => [...prev, newCategory]);
        toast.success('Đã tạo danh mục mới');
      }
      setCategoryModal({ open: false });
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  }, [categoryModal.data, categories.length, toast]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedCategory === id) setSelectedCategory(null);
      toast.success('Đã xóa danh mục');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  }, [selectedCategory, toast]);

  // Menu item handlers
  const handleSaveMenuItem = useCallback(async (data: Partial<MenuItem>) => {
    try {
      if (menuItemModal.data?.id) {
        // Update
        setMenuItems(prev => prev.map(m => m.id === menuItemModal.data?.id ? { ...m, ...data } : m));
        toast.success('Đã cập nhật món ăn');
      } else {
        // Create
        const newItem: MenuItem = {
          id: Date.now().toString(),
          name: data.name || '',
          description: data.description,
          price: data.price || 0,
          categoryId: data.categoryId || selectedCategory || '',
          imageUrl: data.imageUrl,
          isAvailable: true,
          isBestSeller: false,
          isSpecial: false,
          order: filteredItems.length + 1,
        };
        setMenuItems(prev => [...prev, newItem]);
        toast.success('Đã thêm món ăn mới');
      }
      setMenuItemModal({ open: false });
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  }, [menuItemModal.data, selectedCategory, filteredItems.length, toast]);

  const handleDeleteMenuItem = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa món ăn này?')) return;
    try {
      setMenuItems(prev => prev.filter(m => m.id !== id));
      toast.success('Đã xóa món ăn');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  }, [toast]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: `3px solid ${tokens.color.border}`,
            borderTopColor: tokens.color.primary,
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 24 }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: tokens.color.text, marginBottom: 8 }}>
          Quản lý Thực đơn
        </h1>
        <p style={{ color: tokens.color.muted, fontSize: 14 }}>
          Quản lý danh mục và món ăn của nhà hàng
        </p>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Categories sidebar */}
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          onEdit={(cat: MenuCategory) => setCategoryModal({ open: true, data: cat })}
          onDelete={handleDeleteCategory}
          onAdd={() => setCategoryModal({ open: true })}
        />

        {/* Menu items */}
        <MenuItemList
          items={filteredItems}
          categories={categories}
          selectedCategory={selectedCategory}
          onEdit={(item: MenuItem) => setMenuItemModal({ open: true, data: item })}
          onDelete={handleDeleteMenuItem}
          onAdd={() => setMenuItemModal({ open: true })}
          onToggleAvailable={(id: string) => {
            setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
          }}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {categoryModal.open && (
          <CategoryModal
            data={categoryModal.data}
            onClose={() => setCategoryModal({ open: false })}
            onSave={handleSaveCategory}
          />
        )}
        {menuItemModal.open && (
          <MenuItemModal
            data={menuItemModal.data}
            categories={categories}
            defaultCategoryId={selectedCategory}
            onClose={() => setMenuItemModal({ open: false })}
            onSave={handleSaveMenuItem}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default MenuManagerPage;
