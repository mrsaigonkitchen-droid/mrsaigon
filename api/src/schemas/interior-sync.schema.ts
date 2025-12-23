/**
 * Interior Sync Validation Schemas
 * 
 * Zod schemas for validating sync API requests.
 * 
 * **Feature: interior-sheet-sync**
 * **Validates: Requirements 1.7**
 */

import { z } from 'zod';

// ============================================
// SHEET TYPE ENUM
// ============================================

export const SheetTypeEnum = z.enum(['DuAn', 'LayoutIDs']);
export type SheetType = z.infer<typeof SheetTypeEnum>;

// ============================================
// PULL REQUEST SCHEMA
// ============================================

export const PullRequestSchema = z.object({
  sheetId: z.string().min(1, 'Sheet ID không được để trống'),
  sheets: z.array(SheetTypeEnum).min(1, 'Phải chọn ít nhất 1 sheet'),
});

export type PullRequestInput = z.infer<typeof PullRequestSchema>;

// ============================================
// PUSH REQUEST SCHEMA
// ============================================

export const PushRequestSchema = z.object({
  sheetId: z.string().min(1, 'Sheet ID không được để trống'),
  sheets: z.array(SheetTypeEnum).min(1, 'Phải chọn ít nhất 1 sheet'),
});

export type PushRequestInput = z.infer<typeof PushRequestSchema>;

// ============================================
// PREVIEW QUERY SCHEMA
// ============================================

export const PreviewQuerySchema = z.object({
  sheetId: z.string().min(1, 'Sheet ID không được để trống'),
  sheet: SheetTypeEnum,
});

export type PreviewQueryInput = z.infer<typeof PreviewQuerySchema>;

// ============================================
// LOGS QUERY SCHEMA
// ============================================

export const LogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  direction: z.enum(['pull', 'push']).optional(),
  status: z.enum(['success', 'partial', 'failed']).optional(),
});

export type LogsQueryInput = z.infer<typeof LogsQuerySchema>;

// ============================================
// SYNC RESULT SCHEMAS (for response validation)
// ============================================

export const SyncErrorSchema = z.object({
  row: z.number(),
  field: z.string().optional(),
  message: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const SheetSyncResultSchema = z.object({
  sheet: z.string(),
  created: z.number(),
  updated: z.number(),
  skipped: z.number(),
  errors: z.array(SyncErrorSchema),
});

export const PullResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(SheetSyncResultSchema),
});

export const PushResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(z.object({
    sheet: z.string(),
    synced: z.number(),
    errors: z.array(SyncErrorSchema),
  })),
});

export const PreviewRowSchema = z.object({
  rowNumber: z.number(),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
  changeType: z.enum(['add', 'update', 'unchanged']),
  changes: z.array(z.string()).optional(),
});

export const PreviewResponseSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(PreviewRowSchema),
  summary: z.object({
    add: z.number(),
    update: z.number(),
    unchanged: z.number(),
  }),
});

export const StatusResponseSchema = z.object({
  connected: z.boolean(),
  sheetId: z.string().nullable(),
  lastSync: z.string().nullable(),
});

export const SyncLogSchema = z.object({
  id: z.string(),
  direction: z.enum(['pull', 'push']),
  sheetId: z.string(),
  sheetName: z.string(),
  status: z.enum(['success', 'partial', 'failed']),
  created: z.number(),
  updated: z.number(),
  skipped: z.number(),
  errors: z.array(SyncErrorSchema).nullable(),
  syncedBy: z.string(),
  syncedAt: z.date(),
});

export const LogsResponseSchema = z.object({
  items: z.array(SyncLogSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
