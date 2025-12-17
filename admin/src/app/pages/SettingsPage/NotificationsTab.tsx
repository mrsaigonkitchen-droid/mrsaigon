import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import type { NotificationSettings } from './types';
import { glass } from './types';

interface NotificationsTabProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onShowMessage: (message: string) => void;
}

const NOTIFICATION_OPTIONS = [
  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Nhận thông báo qua email' },
  { key: 'newLeads', label: 'Khách hàng mới', desc: 'Thông báo khi có khách hàng đăng ký tư vấn' },
  { key: 'newComments', label: 'Comment mới', desc: 'Thông báo khi có comment mới trên blog' },
  { key: 'systemUpdates', label: 'Cập nhật hệ thống', desc: 'Thông báo về updates và maintenance' },
] as const;

export function NotificationsTab({ settings, onChange, onShowMessage }: NotificationsTabProps) {
  const [saving, setSaving] = useState(false);

  const handleToggle = useCallback((key: keyof NotificationSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  }, [settings, onChange]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    // Simulate save - in real app, call API
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    onShowMessage('✅ Cài đặt thông báo đã được lưu!');
    setSaving(false);
  }, [settings, onShowMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card icon="ri-notification-3-line" title="Cài Đặt Thông Báo" subtitle="Quản lý các loại thông báo bạn muốn nhận">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {NOTIFICATION_OPTIONS.map(({ key, label, desc }) => (
            <motion.div
              key={key}
              whileHover={{ background: 'rgba(255,255,255,0.02)' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                background: glass.background,
                border: glass.border,
                borderRadius: tokens.radius.md,
                cursor: 'pointer',
              }}
              onClick={() => handleToggle(key)}
            >
              <div>
                <div style={{ color: tokens.color.text, fontWeight: 500, marginBottom: 4 }}>{label}</div>
                <div style={{ color: tokens.color.muted, fontSize: 13 }}>{desc}</div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  background: settings[key] ? tokens.color.primary : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <motion.div
                  animate={{ x: settings[key] ? 22 : 2 }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <i className={saving ? 'ri-loader-4-line' : 'ri-save-line'} />
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
