/**
 * Menu Service
 * Business logic for MenuCategory and MenuItem
 */

import { PrismaClient } from '@prisma/client';

export class MenuService {
  constructor(private prisma: PrismaClient) {}

  // ============================================
  // CATEGORIES
  // ============================================

  async getAllCategories(includeInactive = false) {
    return this.prisma.menuCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { items: true } },
      },
    });
  }

  async getCategoryById(id: string) {
    return this.prisma.menuCategory.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }) {
    return this.prisma.menuCategory.create({ data });
  }

  async updateCategory(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    order: number;
    isActive: boolean;
  }>) {
    return this.prisma.menuCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    // Check if category has items
    const itemCount = await this.prisma.menuItem.count({ where: { categoryId: id } });
    if (itemCount > 0) {
      throw new Error('Không thể xóa danh mục có món ăn');
    }
    return this.prisma.menuCategory.delete({ where: { id } });
  }

  // ============================================
  // MENU ITEMS
  // ============================================

  async getAllItems(filters?: {
    categoryId?: string;
    isAvailable?: boolean;
    isBestSeller?: boolean;
    isSpecial?: boolean;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};
    
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
    if (filters?.isBestSeller !== undefined) where.isBestSeller = filters.isBestSeller;
    if (filters?.isSpecial !== undefined) where.isSpecial = filters.isSpecial;

    return this.prisma.menuItem.findMany({
      where,
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
      include: { category: true },
      take: filters?.limit,
    });
  }

  async getItemById(id: string) {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async createItem(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
    isAvailable?: boolean;
    isBestSeller?: boolean;
    isSpecial?: boolean;
    order?: number;
  }) {
    return this.prisma.menuItem.create({
      data,
      include: { category: true },
    });
  }

  async updateItem(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryId: string;
    isAvailable: boolean;
    isBestSeller: boolean;
    isSpecial: boolean;
    order: number;
  }>) {
    return this.prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteItem(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }

  // ============================================
  // PUBLIC API (for Landing)
  // ============================================

  async getPublicMenu() {
    const categories = await this.prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    return categories;
  }
}
