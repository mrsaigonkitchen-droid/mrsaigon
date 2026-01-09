/**
 * Menu Routes - API endpoints for MenuCategory and MenuItem
 */

import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { validate, validateQuery, getValidatedBody, getValidatedQuery } from '../middleware/validation';
import { MenuService } from '../services/menu.service';
import {
  CreateMenuCategorySchema,
  UpdateMenuCategorySchema,
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
  MenuQuerySchema,
  type CreateMenuCategoryInput,
  type UpdateMenuCategoryInput,
  type CreateMenuItemInput,
  type UpdateMenuItemInput,
  type MenuQueryInput,
} from '../schemas/menu.schema';
import { successResponse, errorResponse } from '../utils/response';

export function createMenuRoutes(prisma: PrismaClient) {
  const app = new Hono();
  const menuService = new MenuService(prisma);
  const { authenticate, requireRole } = createAuthMiddleware(prisma);

  // PUBLIC ROUTES
  app.get('/', async (c) => {
    const menu = await menuService.getPublicMenu();
    return successResponse(c, menu);
  });

  app.get('/items', validateQuery(MenuQuerySchema), async (c) => {
    const query = getValidatedQuery<MenuQueryInput>(c);
    const items = await menuService.getAllItems({
      categoryId: query.categoryId,
      isAvailable: query.isAvailable === 'true' ? true : query.isAvailable === 'false' ? false : undefined,
      isBestSeller: query.isBestSeller === 'true' ? true : undefined,
      isSpecial: query.isSpecial === 'true' ? true : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
    return successResponse(c, items);
  });

  // ADMIN - CATEGORIES
  app.get('/admin/categories', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    const categories = await menuService.getAllCategories(true);
    return successResponse(c, categories);
  });

  app.post('/admin/categories', authenticate(), requireRole('ADMIN', 'MANAGER'), validate(CreateMenuCategorySchema), async (c) => {
    const data = getValidatedBody<CreateMenuCategoryInput>(c);
    const category = await menuService.createCategory(data);
    return successResponse(c, category, 201);
  });

  app.put('/admin/categories/:id', authenticate(), requireRole('ADMIN', 'MANAGER'), validate(UpdateMenuCategorySchema), async (c) => {
    const id = c.req.param('id');
    const data = getValidatedBody<UpdateMenuCategoryInput>(c);
    try {
      const category = await menuService.updateCategory(id, data);
      return successResponse(c, category);
    } catch {
      return errorResponse(c, 'NOT_FOUND', 'Danh muc khong ton tai', 404);
    }
  });

  app.delete('/admin/categories/:id', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    const id = c.req.param('id');
    try {
      await menuService.deleteCategory(id);
      return successResponse(c, { message: 'Da xoa danh muc' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Khong the xoa danh muc';
      return errorResponse(c, 'DELETE_FAILED', message, 400);
    }
  });

  // ADMIN - ITEMS
  app.get('/admin/items', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    const items = await menuService.getAllItems();
    return successResponse(c, items);
  });

  app.post('/admin/items', authenticate(), requireRole('ADMIN', 'MANAGER'), validate(CreateMenuItemSchema), async (c) => {
    const data = getValidatedBody<CreateMenuItemInput>(c);
    const item = await menuService.createItem({
      ...data,
      imageUrl: data.imageUrl || undefined,
    });
    return successResponse(c, item, 201);
  });

  app.put('/admin/items/:id', authenticate(), requireRole('ADMIN', 'MANAGER'), validate(UpdateMenuItemSchema), async (c) => {
    const id = c.req.param('id');
    const data = getValidatedBody<UpdateMenuItemInput>(c);
    try {
      const item = await menuService.updateItem(id, data);
      return successResponse(c, item);
    } catch {
      return errorResponse(c, 'NOT_FOUND', 'Mon an khong ton tai', 404);
    }
  });

  app.delete('/admin/items/:id', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    const id = c.req.param('id');
    try {
      await menuService.deleteItem(id);
      return successResponse(c, { message: 'Da xoa mon an' });
    } catch {
      return errorResponse(c, 'NOT_FOUND', 'Mon an khong ton tai', 404);
    }
  });

  return app;
}
