/**
 * Menu API Client - Mr.SaiGon Admin Dashboard
 * Handles menu categories and items CRUD operations
 */

import { apiFetch } from './client';

// ============================================
// TYPES
// ============================================

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isSpecial: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  category?: MenuCategory;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable?: boolean;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  order?: number;
}

export interface UpdateMenuItemInput {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  order?: number;
}

// ============================================
// API CLIENT
// ============================================

export const menuApi = {
  // Categories
  getCategories: () => apiFetch<MenuCategory[]>('/menu/admin/categories'),

  createCategory: (data: CreateCategoryInput) =>
    apiFetch<MenuCategory>('/menu/admin/categories', {
      method: 'POST',
      body: data,
    }),

  updateCategory: (id: string, data: UpdateCategoryInput) =>
    apiFetch<MenuCategory>(`/menu/admin/categories/${id}`, {
      method: 'PUT',
      body: data,
    }),

  deleteCategory: (id: string) =>
    apiFetch<{ message: string }>(`/menu/admin/categories/${id}`, {
      method: 'DELETE',
    }),

  // Items
  getItems: () => apiFetch<MenuItem[]>('/menu/admin/items'),

  createItem: (data: CreateMenuItemInput) =>
    apiFetch<MenuItem>('/menu/admin/items', {
      method: 'POST',
      body: data,
    }),

  updateItem: (id: string, data: UpdateMenuItemInput) =>
    apiFetch<MenuItem>(`/menu/admin/items/${id}`, {
      method: 'PUT',
      body: data,
    }),

  deleteItem: (id: string) =>
    apiFetch<{ message: string }>(`/menu/admin/items/${id}`, {
      method: 'DELETE',
    }),
};
