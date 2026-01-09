/**
 * MenuManagerPage
 * Quản lý thực đơn nhà hàng MrSaiGon
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../../theme';
import { useToast } from '../../components/Toast';
import { menuApi } from '../../api/menu';
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

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getItems(),
      ]);
      
      setCategories(categoriesRes.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
        order: c.order,
        isActive: c.isActive,
      })));
      
      setMenuItems(itemsRes.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        price: item.price,
        categoryId: item.categoryId,
        imageUrl: item.imageUrl || undefined,
        isAvailable: item.isAvailable,
        isBestSeller: item.isBestSeller,
        isSpecial: item.isSpecial,
        order: item.order,
      })));
    } catch (err) {
      console.error('Failed to load menu data:', err);
      toast.error('Không thể tải dữ liệu thực đơn');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter items by category
  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems;

  // Category handlers
  const handleSaveCategory = useCallback(async (data: Partial<MenuCategory>) => {
    try {
      if (categoryModal.data?.id) {
        // Update
        await menuApi.updateCategory(categoryModal.data.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          order: data.order,
          isActive: data.isActive,
        });
        toast.success('Đã cập nhật danh mục');
      } else {
        // Create
        await menuApi.createCategory({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description,
          order: data.order ?? categories.length + 1,
          isActive: data.isActive ?? true,
        });
        toast.success('Đã tạo danh mục mới');
      }
      setCategoryModal({ open: false });
      loadData(); // Reload data
    } catch (err) {
      console.error('Failed to save category:', err);
      toast.error('Có lỗi xảy ra khi lưu danh mục');
    }
  }, [categoryModal.data, categories.length, toast, loadData]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await menuApi.deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      toast.success('Đã xóa danh mục');
      loadData();
    } catch (err) {
      console.error('Failed to delete category:', err);
      toast.error('Không thể xóa danh mục (có thể còn món ăn)');
    }
  }, [selectedCategory, toast, loadData]);

  // Menu item handlers
  const handleSaveMenuItem = useCallback(async (data: Partial<MenuItem>) => {
    try {
      if (menuItemModal.data?.id) {
        // Update
        await menuApi.updateItem(menuItemModal.data.id, {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable,
          isBestSeller: data.isBestSeller,
          isSpecial: data.isSpecial,
          order: data.order,
        });
        toast.success('Đã cập nhật món ăn');
      } else {
        // Create
        await menuApi.createItem({
          name: data.name || '',
          description: data.description,
          price: data.price || 0,
          categoryId: data.categoryId || selectedCategory || '',
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable ?? true,
          isBestSeller: data.isBestSeller ?? false,
          isSpecial: data.isSpecial ?? false,
          order: data.order ?? filteredItems.length + 1,
        });
        toast.success('Đã thêm món ăn mới');
      }
      setMenuItemModal({ open: false });
      loadData();
    } catch (err) {
      console.error('Failed to save menu item:', err);
      toast.error('Có lỗi xảy ra khi lưu món ăn');
    }
  }, [menuItemModal.data, selectedCategory, filteredItems.length, toast, loadData]);

  const handleDeleteMenuItem = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa món ăn này?')) return;
    try {
      await menuApi.deleteItem(id);
      toast.success('Đã xóa món ăn');
      loadData();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      toast.error('Có lỗi xảy ra khi xóa món ăn');
    }
  }, [toast, loadData]);

  const handleToggleAvailable = useCallback(async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    try {
      await menuApi.updateItem(id, { isAvailable: !item.isAvailable });
      loadData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      toast.error('Có lỗi xảy ra');
    }
  }, [menuItems, loadData, toast]);

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 300px) 1fr',
          gap: 24,
        }}
        className="menu-manager-grid"
      >
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
          onToggleAvailable={handleToggleAvailable}
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
