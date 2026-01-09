/**
 * Menu Validation Schemas
 * Zod schemas for MenuCategory and MenuItem
 */

import { z } from 'zod';

// ============================================
// MENU CATEGORY SCHEMAS
// ============================================

export const CreateMenuCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được trống'),
  slug: z.string().min(1, 'Slug không được trống'),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateMenuCategorySchema = CreateMenuCategorySchema.partial();

// ============================================
// MENU ITEM SCHEMAS
// ============================================

export const CreateMenuItemSchema = z.object({
  name: z.string().min(1, 'Tên món không được trống'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá phải >= 0'),
  imageUrl: z.string().optional().transform(val => val === '' ? undefined : val),
  categoryId: z.string().min(1, 'Danh mục không được trống'),
  isAvailable: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isSpecial: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

// ============================================
// QUERY SCHEMAS
// ============================================

export const MenuQuerySchema = z.object({
  categoryId: z.string().optional(),
  isAvailable: z.enum(['true', 'false']).optional(),
  isBestSeller: z.enum(['true', 'false']).optional(),
  isSpecial: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});


// ============================================
// TYPE EXPORTS
// ============================================

export type CreateMenuCategoryInput = z.infer<typeof CreateMenuCategorySchema>;
export type UpdateMenuCategoryInput = z.infer<typeof UpdateMenuCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof UpdateMenuItemSchema>;
export type MenuQueryInput = z.infer<typeof MenuQuerySchema>;
