import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import type { ThemeSettings } from './types';
import { API_URL, glass } from './types';

interface ThemeTabProps {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
  onShowMessage: (message: string) => void;
  onError: (message: string) => void;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
];

const COLOR_PRESETS = [
  { name: 'Gold (Default)', primary: '#f5d393', accent: '#3b82f6' },
  { name: 'Blue Ocean', primary: '#3b82f6', accent: '#f5d393' },
  { name: 'Green Nature', primary: '#10b981', accent: '#f59e0b' },
  { name: 'Purple Royal', primary: '#8b5cf6', accent: '#ec4899' },
];

export function ThemeTab({ settings, onChange, onShowMessage, onError }: ThemeTabProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/settings/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value: settings }),
      });

      if (!response.ok) throw new Error('Failed to save');
      localStorage.setItem('themeSettings', JSON.stringify(settings));
      onShowMessage('✅ Theme đã được lưu!');
    } catch (error) {
      console.error('Error saving theme:', error);
      onError('Lưu theme thất bại.');
    } finally {
      setSaving(false);
    }
  }, [settings, onShowMessage, onError]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Color Presets */}
      <Card icon="ri-palette-line" title="Bảng Màu" subtitle="Chọn preset hoặc tùy chỉnh màu sắc">
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, color: tokens.color.text, fontWeight: 500 }}>
            Preset Colors
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {COLOR_PRESETS.map((preset) => (
              <motion.button
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ ...settings, primaryColor: preset.primary, accentColor: preset.accent })}
                style={{
                  padding: 16,
                  background: settings.primaryColor === preset.primary ? `${preset.primary}20` : glass.background,
                  border: settings.primaryColor === preset.primary ? `2px solid ${preset.primary}` : glass.border,
                  borderRadius: tokens.radius.md,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: preset.primary }} />
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: preset.accent }} />
                </div>
                <span style={{ fontSize: 12, color: tokens.color.text }}>{preset.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: tokens.color.text, fontWeight: 500 }}>
              Primary Color
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => onChange({ ...settings, primaryColor: e.target.value })}
                style={{ width: 48, height: 48, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => onChange({ ...settings, primaryColor: e.target.value })}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: glass.background,
                  border: glass.border,
                  borderRadius: tokens.radius.md,
                  color: tokens.color.text,
                  fontSize: 14,
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: tokens.color.text, fontWeight: 500 }}>
              Accent Color
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => onChange({ ...settings, accentColor: e.target.value })}
                style={{ width: 48, height: 48, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => onChange({ ...settings, accentColor: e.target.value })}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: glass.background,
                  border: glass.border,
                  borderRadius: tokens.radius.md,
                  color: tokens.color.text,
                  fontSize: 14,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card icon="ri-font-size-2" title="Typography" subtitle="Chọn font chữ cho website">
        <label style={{ display: 'block', marginBottom: 8, color: tokens.color.text, fontWeight: 500 }}>
          Font Family
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: glass.background,
            border: glass.border,
            borderRadius: tokens.radius.md,
            color: tokens.color.text,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>

        {/* Preview */}
        <div style={{
          marginTop: 24,
          padding: 24,
          background: glass.background,
          border: glass.border,
          borderRadius: tokens.radius.md,
        }}>
          <p style={{ color: tokens.color.muted, fontSize: 12, marginBottom: 12 }}>Preview:</p>
          <h3 style={{ fontFamily: settings.fontFamily, color: settings.primaryColor, fontSize: 24, marginBottom: 8 }}>
            Anh Thợ Xây
          </h3>
          <p style={{ fontFamily: settings.fontFamily, color: tokens.color.text, fontSize: 14 }}>
            Dịch vụ cải tạo nhà chuyên nghiệp, uy tín với hơn 10 năm kinh nghiệm.
          </p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <i className={saving ? 'ri-loader-4-line' : 'ri-save-line'} />
            {saving ? 'Đang lưu...' : 'Lưu Theme'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
