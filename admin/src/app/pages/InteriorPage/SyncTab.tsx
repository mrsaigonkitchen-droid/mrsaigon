/**
 * SyncTab - Google Sheet Sync Management
 *
 * Provides UI for syncing interior data between Google Sheets and database.
 * Features: Pull/Push operations, sync history, connection status.
 *
 * **Feature: interior-sheet-sync**
 * **Requirements: 1.1, 2.1, 4.2, 5.1, 5.2**
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import {
  interiorSyncApi,
  type SyncStatus,
  type SyncLogEntry,
  type SheetType,
  type SyncError,
} from '../../api';

// ============================================
// STATUS BADGE COMPONENT
// ============================================

function StatusBadge({ status }: { status: 'success' | 'partial' | 'failed' }) {
  const colors = {
    success: tokens.color.success,
    partial: tokens.color.warning,
    failed: tokens.color.error,
  };
  const labels = {
    success: 'Thành công',
    partial: 'Một phần',
    failed: 'Thất bại',
  };

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: tokens.radius.sm,
        background: `${colors[status]}20`,
        color: colors[status],
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {labels[status]}
    </span>
  );
}

// ============================================
// ERROR DETAILS MODAL
// ============================================

function ErrorDetailsModal({
  errors,
  onClose,
}: {
  errors: SyncError[];
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9998,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(600px, 90vw)',
          maxHeight: '80vh',
          background: tokens.color.surface,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.color.border}`,
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom: `1px solid ${tokens.color.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, color: tokens.color.text, fontSize: 16 }}>
            Chi tiết lỗi ({errors.length})
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: tokens.color.muted,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <i className="ri-close-line" style={{ fontSize: 20 }} />
          </motion.button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(80vh - 70px)' }}>
          {errors.map((error, idx) => (
            <div
              key={idx}
              style={{
                padding: 12,
                marginBottom: 8,
                background: `${tokens.color.error}10`,
                borderRadius: tokens.radius.sm,
                border: `1px solid ${tokens.color.error}30`,
              }}
            >
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ color: tokens.color.muted, fontSize: 12 }}>Dòng {error.row}</span>
                {error.field && (
                  <span style={{ color: tokens.color.warning, fontSize: 12 }}>
                    Trường: {error.field}
                  </span>
                )}
              </div>
              <div style={{ color: tokens.color.error, fontSize: 13 }}>{error.message}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ============================================
// MAIN SYNC TAB COMPONENT
// ============================================

export function SyncTab() {
  // State
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sheetId, setSheetId] = useState('');
  const [selectedSheets, setSelectedSheets] = useState<SheetType[]>(['DuAn', 'LayoutIDs']);
  const [errorDetails, setErrorDetails] = useState<SyncError[] | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const LOGS_LIMIT = 10;

  // Load status and logs
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, logsRes] = await Promise.all([
        interiorSyncApi.getStatus(),
        interiorSyncApi.getLogs({ page: logsPage, limit: LOGS_LIMIT }),
      ]);
      setStatus(statusRes);
      setLogs(logsRes.data);
      setLogsTotal(logsRes.total);
      if (statusRes.sheetId) {
        setSheetId(statusRes.sheetId);
      }
    } catch (err) {
      console.error('Failed to load sync data:', err);
      setMessage({ type: 'error', text: 'Không thể tải dữ liệu đồng bộ' });
    } finally {
      setLoading(false);
    }
  }, [logsPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Pull
  const handlePull = async () => {
    if (!sheetId.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Sheet ID' });
      return;
    }
    if (selectedSheets.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một sheet' });
      return;
    }

    try {
      setSyncing(true);
      setMessage(null);
      const result = await interiorSyncApi.pull(sheetId.trim(), selectedSheets);

      if (result.success) {
        const totalCreated = result.results.reduce((sum, r) => sum + r.created, 0);
        const totalUpdated = result.results.reduce((sum, r) => sum + r.updated, 0);
        const totalErrors = result.results.reduce((sum, r) => sum + r.errors.length, 0);

        if (totalErrors > 0) {
          setMessage({
            type: 'error',
            text: `Đồng bộ hoàn tất với ${totalErrors} lỗi. Tạo: ${totalCreated}, Cập nhật: ${totalUpdated}`,
          });
        } else {
          setMessage({
            type: 'success',
            text: `Đồng bộ thành công! Tạo: ${totalCreated}, Cập nhật: ${totalUpdated}`,
          });
        }
      }
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đồng bộ thất bại';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSyncing(false);
    }
  };

  // Handle Push
  const handlePush = async () => {
    if (!sheetId.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Sheet ID' });
      return;
    }
    if (selectedSheets.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một sheet' });
      return;
    }

    try {
      setSyncing(true);
      setMessage(null);
      const result = await interiorSyncApi.push(sheetId.trim(), selectedSheets);

      if (result.success) {
        const totalSynced = result.results.reduce((sum, r) => sum + r.synced, 0);
        const totalErrors = result.results.reduce((sum, r) => sum + r.errors.length, 0);

        if (totalErrors > 0) {
          setMessage({
            type: 'error',
            text: `Đẩy dữ liệu hoàn tất với ${totalErrors} lỗi. Đã đồng bộ: ${totalSynced}`,
          });
        } else {
          setMessage({
            type: 'success',
            text: `Đẩy dữ liệu thành công! Đã đồng bộ: ${totalSynced} dòng`,
          });
        }
      }
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đẩy dữ liệu thất bại';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSyncing(false);
    }
  };

  // Toggle sheet selection
  const toggleSheet = (sheet: SheetType) => {
    setSelectedSheets((prev) =>
      prev.includes(sheet) ? prev.filter((s) => s !== sheet) : [...prev, sheet]
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Pagination
  const totalPages = Math.ceil(logsTotal / LOGS_LIMIT);

  if (loading && !status) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 32, color: tokens.color.primary }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Connection Status Card */}
      <div
        style={{
          background: tokens.color.surface,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.color.border}`,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <i
            className={status?.connected ? 'ri-link' : 'ri-link-unlink'}
            style={{
              fontSize: 24,
              color: status?.connected ? tokens.color.success : tokens.color.error,
            }}
          />
          <div>
            <h3 style={{ margin: 0, color: tokens.color.text, fontSize: 16 }}>
              Trạng thái kết nối
            </h3>
            <span
              style={{
                color: status?.connected ? tokens.color.success : tokens.color.muted,
                fontSize: 13,
              }}
            >
              {status?.connected ? 'Đã kết nối Google Sheets' : 'Chưa kết nối'}
            </span>
          </div>
        </div>

        {/* Sheet ID Input */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              color: tokens.color.muted,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Google Sheet ID
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="Nhập Sheet ID từ URL Google Sheets"
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                background: tokens.color.background,
                color: tokens.color.text,
                fontSize: 14,
                outline: 'none',
              }}
            />
            {sheetId && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                  color: tokens.color.primary,
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                <i className="ri-external-link-line" />
                Mở Sheet
              </motion.a>
            )}
          </div>
        </div>

        {/* Sheet Selection */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              color: tokens.color.muted,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Chọn sheet để đồng bộ
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['DuAn', 'LayoutIDs'] as SheetType[]).map((sheet) => (
              <label
                key={sheet}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  background: selectedSheets.includes(sheet)
                    ? `${tokens.color.primary}20`
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedSheets.includes(sheet) ? tokens.color.primary : tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSheets.includes(sheet)}
                  onChange={() => toggleSheet(sheet)}
                  style={{ display: 'none' }}
                />
                <i
                  className={selectedSheets.includes(sheet) ? 'ri-checkbox-fill' : 'ri-checkbox-blank-line'}
                  style={{
                    color: selectedSheets.includes(sheet) ? tokens.color.primary : tokens.color.muted,
                  }}
                />
                <span style={{ color: tokens.color.text, fontSize: 14 }}>{sheet}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePull}
            disabled={syncing || !status?.connected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              color: '#111',
              border: 'none',
              borderRadius: tokens.radius.md,
              fontWeight: 600,
              fontSize: 14,
              cursor: syncing || !status?.connected ? 'not-allowed' : 'pointer',
              opacity: syncing || !status?.connected ? 0.5 : 1,
            }}
          >
            {syncing ? (
              <motion.i
                className="ri-loader-4-line"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <i className="ri-download-2-line" />
            )}
            Lấy dữ liệu (Pull)
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePush}
            disabled={syncing || !status?.connected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.05)',
              color: tokens.color.text,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              fontWeight: 600,
              fontSize: 14,
              cursor: syncing || !status?.connected ? 'not-allowed' : 'pointer',
              opacity: syncing || !status?.connected ? 0.5 : 1,
            }}
          >
            {syncing ? (
              <motion.i
                className="ri-loader-4-line"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <i className="ri-upload-2-line" />
            )}
            Đẩy lên Sheet (Push)
          </motion.button>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: tokens.radius.md,
                background: message.type === 'success' ? `${tokens.color.success}20` : `${tokens.color.error}20`,
                border: `1px solid ${message.type === 'success' ? tokens.color.success : tokens.color.error}30`,
                color: message.type === 'success' ? tokens.color.success : tokens.color.error,
                fontSize: 14,
              }}
            >
              <i className={message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} style={{ marginRight: 8 }} />
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last Sync Info */}
        {status?.lastSync && (
          <div style={{ marginTop: 16, color: tokens.color.muted, fontSize: 13 }}>
            <i className="ri-time-line" style={{ marginRight: 6 }} />
            Đồng bộ lần cuối: {formatDate(status.lastSync)}
          </div>
        )}
      </div>

      {/* Sync History Table */}
      <div
        style={{
          background: tokens.color.surface,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.color.border}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${tokens.color.border}` }}>
          <h3 style={{ margin: 0, color: tokens.color.text, fontSize: 16 }}>
            <i className="ri-history-line" style={{ marginRight: 8 }} />
            Lịch sử đồng bộ
          </h3>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: tokens.color.muted }}>
            Chưa có lịch sử đồng bộ
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${tokens.color.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: tokens.color.muted, fontSize: 13, fontWeight: 500 }}>
                    Thời gian
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: tokens.color.muted, fontSize: 13, fontWeight: 500 }}>
                    Hướng
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: tokens.color.muted, fontSize: 13, fontWeight: 500 }}>
                    Sheet
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: tokens.color.muted, fontSize: 13, fontWeight: 500 }}>
                    Trạng thái
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: tokens.color.muted, fontSize: 13, fontWeight: 500 }}>
                    Kết quả
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: tokens.color.muted, fontSize: 13, fontWeight: 500 }}>
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${tokens.color.border}` }}>
                    <td style={{ padding: '12px 16px', color: tokens.color.text, fontSize: 14 }}>
                      {formatDate(log.syncedAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: log.direction === 'pull' ? tokens.color.info : tokens.color.warning,
                          fontSize: 13,
                        }}
                      >
                        <i className={log.direction === 'pull' ? 'ri-download-2-line' : 'ri-upload-2-line'} />
                        {log.direction === 'pull' ? 'Pull' : 'Push'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: tokens.color.text, fontSize: 14 }}>
                      {log.sheetName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={log.status} />
                    </td>
                    <td style={{ padding: '12px 16px', color: tokens.color.muted, fontSize: 13 }}>
                      <span style={{ color: tokens.color.success }}>+{log.created}</span>
                      {' / '}
                      <span style={{ color: tokens.color.info }}>~{log.updated}</span>
                      {' / '}
                      <span style={{ color: tokens.color.muted }}>-{log.skipped}</span>
                      {log.errors && log.errors.length > 0 && (
                        <span style={{ color: tokens.color.error, marginLeft: 8 }}>
                          ({log.errors.length} lỗi)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {log.errors && log.errors.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setErrorDetails(log.errors)}
                          style={{
                            padding: 6,
                            background: 'transparent',
                            border: `1px solid ${tokens.color.error}40`,
                            borderRadius: tokens.radius.sm,
                            color: tokens.color.error,
                            cursor: 'pointer',
                          }}
                          title="Xem chi tiết lỗi"
                        >
                          <i className="ri-eye-line" />
                        </motion.button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  borderTop: `1px solid ${tokens.color.border}`,
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                  disabled={logsPage === 1}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.sm,
                    color: logsPage === 1 ? tokens.color.muted : tokens.color.text,
                    cursor: logsPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: logsPage === 1 ? 0.5 : 1,
                  }}
                >
                  <i className="ri-arrow-left-s-line" />
                </motion.button>
                <span style={{ color: tokens.color.muted, fontSize: 13 }}>
                  Trang {logsPage} / {totalPages}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLogsPage((p) => Math.min(totalPages, p + 1))}
                  disabled={logsPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.sm,
                    color: logsPage === totalPages ? tokens.color.muted : tokens.color.text,
                    cursor: logsPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: logsPage === totalPages ? 0.5 : 1,
                  }}
                >
                  <i className="ri-arrow-right-s-line" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Details Modal */}
      <AnimatePresence>
        {errorDetails && <ErrorDetailsModal errors={errorDetails} onClose={() => setErrorDetails(null)} />}
      </AnimatePresence>
    </div>
  );
}
