/**
 * Menu Manager Types
 */

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isSpecial: boolean;
  order: number;
}
