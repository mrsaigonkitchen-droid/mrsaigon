/**
 * Interior Sync Routes Module
 *
 * Handles bidirectional sync between Google Sheets and Database
 * for Interior Quote Module data (DuAn, LayoutIDs sheets).
 *
 * **Feature: interior-sheet-sync**
 * **Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.2, 5.1, 5.2, 8.1**
 *
 * @route /api/admin/interior/sync - Admin sync management routes
 */

import { Hono } from 'hono';
import { PrismaClient, User } from '@prisma/client';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { validate, validateQuery, getValidatedBody, getValidatedQuery } from '../middleware/validation';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response';
import { interiorSyncService } from '../services/interior/sync.service';
import {
  PullRequestSchema,
  PushRequestSchema,
  PreviewQuerySchema,
  LogsQuerySchema,
} from '../schemas/interior-sync.schema';
import type {
  PullRequestInput,
  PushRequestInput,
  PreviewQueryInput,
  LogsQueryInput,
} from '../schemas/interior-sync.schema';
import type { SyncDirection, SyncLogStatus } from '../services/interior/sync.types';

// ============================================
// RATE LIMITER FOR SYNC OPERATIONS
// ============================================

/**
 * Simple in-memory rate limiter for sync operations
 * Max 1 request per minute per user
 * 
 * **Validates: Requirements 8.1**
 */
const syncRateLimiter = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const lastRequest = syncRateLimiter.get(userId);
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    return false; // Rate limited
  }
  
  syncRateLimiter.set(userId, now);
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of syncRateLimiter.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      syncRateLimiter.delete(userId);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// ============================================
// ADMIN INTERIOR SYNC ROUTES FACTORY
// ============================================

/**
 * Create admin interior sync routes with dependency injection
 * @param prisma - Prisma client instance
 * @returns Hono app with admin interior sync routes
 */
export function createAdminInteriorSyncRoutes(prisma: PrismaClient) {
  const app = new Hono<{ Variables: { user?: User } }>();
  const { authenticate, requireRole } = createAuthMiddleware(prisma);

  // Apply auth middleware to all admin routes - ADMIN only
  app.use('*', authenticate(), requireRole('ADMIN'));

  // ============================================
  // STATUS ENDPOINT
  // ============================================

  /**
   * @route GET /api/admin/interior/sync/status
   * @description Get sync connection status
   * @access ADMIN only
   * 
   * **Validates: Requirements 5.1, 5.2**
   */
  app.get('/status', async (c) => {
    try {
      const status = await interiorSyncService.getStatus();
      return successResponse(c, status);
    } catch (error) {
      console.error('Get sync status error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get sync status', 500);
    }
  });

  // ============================================
  // LOGS ENDPOINT
  // ============================================

  /**
   * @route GET /api/admin/interior/sync/logs
   * @description Get sync logs with pagination
   * @access ADMIN only
   * 
   * **Validates: Requirements 4.2**
   */
  app.get('/logs', validateQuery(LogsQuerySchema), async (c) => {
    try {
      const query = getValidatedQuery<LogsQueryInput>(c);
      
      const result = await interiorSyncService.getLogs({
        page: query.page,
        limit: query.limit,
        direction: query.direction as SyncDirection | undefined,
        status: query.status as SyncLogStatus | undefined,
      });
      
      return paginatedResponse(c, result.items, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      console.error('Get sync logs error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get sync logs', 500);
    }
  });

  // ============================================
  // PREVIEW ENDPOINT
  // ============================================

  /**
   * @route GET /api/admin/interior/sync/preview
   * @description Preview changes before syncing from Google Sheet
   * @access ADMIN only
   * 
   * **Validates: Requirements 3.1, 3.2**
   */
  app.get('/preview', validateQuery(PreviewQuerySchema), async (c) => {
    try {
      const query = getValidatedQuery<PreviewQueryInput>(c);
      
      const preview = await interiorSyncService.previewChanges(
        query.sheetId,
        query.sheet
      );
      
      return successResponse(c, preview);
    } catch (error) {
      console.error('Preview sync error:', error);
      
      if (error instanceof Error && error.message.includes('not connected')) {
        return errorResponse(c, 'NOT_CONNECTED', 'Google Sheets chưa được kết nối', 400);
      }
      
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to preview changes', 500);
    }
  });

  // ============================================
  // PULL ENDPOINT
  // ============================================

  /**
   * @route POST /api/admin/interior/sync/pull
   * @description Pull data from Google Sheet into database
   * @access ADMIN only
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 8.1**
   */
  app.post('/pull', validate(PullRequestSchema), async (c) => {
    try {
      const user = c.get('user');
      const userId = user?.id;
      
      if (!userId) {
        return errorResponse(c, 'UNAUTHORIZED', 'User not authenticated', 401);
      }
      
      // Check rate limit
      if (!checkRateLimit(userId)) {
        return errorResponse(
          c, 
          'RATE_LIMITED', 
          'Vui lòng đợi 1 phút trước khi thực hiện đồng bộ tiếp theo', 
          429
        );
      }
      
      const data = getValidatedBody<PullRequestInput>(c);
      
      const result = await interiorSyncService.pullFromSheet(
        data.sheetId,
        data.sheets,
        userId
      );
      
      return successResponse(c, result);
    } catch (error) {
      console.error('Pull sync error:', error);
      
      if (error instanceof Error && error.message.includes('not connected')) {
        return errorResponse(c, 'NOT_CONNECTED', 'Google Sheets chưa được kết nối', 400);
      }
      
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to pull from sheet', 500);
    }
  });

  // ============================================
  // PUSH ENDPOINT
  // ============================================

  /**
   * @route POST /api/admin/interior/sync/push
   * @description Push data from database to Google Sheet
   * @access ADMIN only
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 8.1**
   */
  app.post('/push', validate(PushRequestSchema), async (c) => {
    try {
      const user = c.get('user');
      const userId = user?.id;
      
      if (!userId) {
        return errorResponse(c, 'UNAUTHORIZED', 'User not authenticated', 401);
      }
      
      // Check rate limit
      if (!checkRateLimit(userId)) {
        return errorResponse(
          c, 
          'RATE_LIMITED', 
          'Vui lòng đợi 1 phút trước khi thực hiện đồng bộ tiếp theo', 
          429
        );
      }
      
      const data = getValidatedBody<PushRequestInput>(c);
      
      const result = await interiorSyncService.pushToSheet(
        data.sheetId,
        data.sheets,
        userId
      );
      
      return successResponse(c, result);
    } catch (error) {
      console.error('Push sync error:', error);
      
      if (error instanceof Error && error.message.includes('not connected')) {
        return errorResponse(c, 'NOT_CONNECTED', 'Google Sheets chưa được kết nối', 400);
      }
      
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to push to sheet', 500);
    }
  });

  return app;
}

// ============================================
// EXPORTED FOR TESTING
// ============================================

export { checkRateLimit, syncRateLimiter, RATE_LIMIT_WINDOW_MS };
