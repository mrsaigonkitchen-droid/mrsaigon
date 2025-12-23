// Interior Sync APIs - ANH THỢ XÂY Admin Dashboard
// Google Sheet sync for Interior Quote Module
// **Feature: interior-sheet-sync**
import { apiFetch } from './client';

// ========== TYPES ==========

export interface SyncError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface SheetSyncResult {
  sheet: string;
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[];
}

export interface PullResult {
  success: boolean;
  results: SheetSyncResult[];
}

export interface PushResult {
  success: boolean;
  results: {
    sheet: string;
    synced: number;
    errors: SyncError[];
  }[];
}

export type ChangeType = 'add' | 'update' | 'unchanged';

export interface PreviewRow {
  rowNumber: number;
  data: Record<string, string | number | null>;
  changeType: ChangeType;
  changes?: string[];
}

export interface PreviewResult {
  headers: string[];
  rows: PreviewRow[];
  summary: {
    add: number;
    update: number;
    unchanged: number;
  };
}

export interface SyncStatus {
  connected: boolean;
  sheetId: string | null;
  lastSync: string | null;
}

export type SyncDirection = 'pull' | 'push';
export type SyncLogStatus = 'success' | 'partial' | 'failed';

export interface SyncLogEntry {
  id: string;
  direction: SyncDirection;
  sheetId: string;
  sheetName: string;
  status: SyncLogStatus;
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[] | null;
  syncedBy: string;
  syncedAt: string;
}

export interface SyncLogsResponse {
  data: SyncLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SheetType = 'DuAn' | 'LayoutIDs';

// ========== API ==========

export const interiorSyncApi = {
  // Get sync connection status
  getStatus: () =>
    apiFetch<SyncStatus>('/api/admin/interior/sync/status'),

  // Get sync logs with pagination
  getLogs: (params?: { page?: number; limit?: number; direction?: SyncDirection; status?: SyncLogStatus }) =>
    apiFetch<SyncLogsResponse>(
      `/api/admin/interior/sync/logs?${new URLSearchParams({
        ...(params?.page && { page: String(params.page) }),
        ...(params?.limit && { limit: String(params.limit) }),
        ...(params?.direction && { direction: params.direction }),
        ...(params?.status && { status: params.status }),
      }).toString()}`
    ),

  // Preview changes before pulling
  getPreview: (sheetId: string, sheet: SheetType) =>
    apiFetch<PreviewResult>(`/api/admin/interior/sync/preview?sheetId=${encodeURIComponent(sheetId)}&sheet=${sheet}`),

  // Pull data from Google Sheet to database
  pull: (sheetId: string, sheets: SheetType[]) =>
    apiFetch<PullResult>('/api/admin/interior/sync/pull', {
      method: 'POST',
      body: { sheetId, sheets },
    }),

  // Push data from database to Google Sheet
  push: (sheetId: string, sheets: SheetType[]) =>
    apiFetch<PushResult>('/api/admin/interior/sync/push', {
      method: 'POST',
      body: { sheetId, sheets },
    }),
};
