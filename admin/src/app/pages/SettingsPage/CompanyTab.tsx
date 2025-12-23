import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { tokens, resolveMediaUrl } from '@app/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { settingsApi, mediaApi } from '../../api';
import type { CompanySettings } from './types';
import { glass } from './types';

interface CompanyTabProps {
  settings: CompanySettings;
  onChange: (settings: CompanySettings) => void;
  onShowMessage: (message: string) => void;
  onError: (message: string) => void;
}

export function CompanyTab({ settings, onChange, onShowMessage, onError }: CompanyTabProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  // Resolve background image URL
  const backgroundImageUrl = useMemo(() => {
    if (!settings.backgroundImage) return null;
    return resolveMediaUrl(settings.backgroundImage);
  }, [settings.backgroundImage]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await settingsApi.update('company', { value: settings });
      localStorage.setItem('companySettings', JSON.stringify(settings));
      onShowMessage('✅ Thông tin công ty đã được lưu!');
    } catch (error) {
      console.error('Error saving company settings:', error);
      onError('Lưu thông tin công ty thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }, [settings, onShowMessage, onError]);

  const handleBackgroundUpload = useCallback(async (file: File) => {
    try {
      setUploadingBg(true);
      console.log('📤 Uploading background image...');
      const result = await mediaApi.upload(file);
      console.log('✅ Media upload success:', result);

      const updatedSettings = { ...settings, backgroundImage: result.url };
      console.log('🔄 Updating settings with:', updatedSettings);
      onChange(updatedSettings);

      // Save immediately
      console.log('💾 Saving to API...');
      await settingsApi.update('company', { value: updatedSettings });
      console.log('✅ Settings saved successfully');

      onShowMessage('✅ Hình nền đã được cập nhật!');
    } catch (error) {
      console.error('❌ Error uploading background:', error);
      onError('Upload hình nền thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingBg(false);
    }
  }, [settings, onChange, onShowMessage, onError]);

  const handleRemoveBackground = useCallback(async () => {
    if (!confirm('Xóa hình nền trang web?')) return;

    try {
      setSaving(true);
      const updatedSettings = { ...settings, backgroundImage: '' };
      onChange(updatedSettings);

      await settingsApi.update('company', { value: updatedSettings });

      onShowMessage('✅ Đã xóa hình nền!');
    } catch (error) {
      console.error('Error removing background:', error);
      onError('Xóa hình nền thất bại.');
    } finally {
      setSaving(false);
    }
  }, [settings, onChange, onShowMessage, onError]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Page Background */}
      <Card icon="ri-image-2-line" title="Hình Nền Trang Web" subtitle="Upload hình nền cho landing page">
        <div style={{ marginBottom: 12, fontSize: 13, color: tokens.color.muted }}>
          Khuyến nghị: 1920x1080px hoặc lớn hơn, ảnh chất lượng cao.
        </div>

        {settings.backgroundImage ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Image Preview */}
            <div style={{ 
              borderRadius: tokens.radius.md, 
              overflow: 'hidden',
              border: `1px solid ${tokens.color.border}`,
            }}>
              <img
                src={backgroundImageUrl || settings.backgroundImage}
                alt="Page background"
                style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  console.error('Image load error:', settings.backgroundImage);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {/* Delete Button - Outside image */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="secondary" 
                onClick={handleRemoveBackground} 
                disabled={saving}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: tokens.color.error,
                  color: tokens.color.error,
                }}
              >
                <i className="ri-delete-bin-line" /> Xóa hình nền
              </Button>
            </div>
          </div>
        ) : (
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            border: `2px dashed ${tokens.color.border}`,
            borderRadius: tokens.radius.md,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBackgroundUpload(file);
              }}
            />
            {uploadingBg ? (
              <i className="ri-loader-4-line" style={{ fontSize: 32, color: tokens.color.primary }} />
            ) : (
              <>
                <i className="ri-upload-cloud-2-line" style={{ fontSize: 32, color: tokens.color.muted, marginBottom: 8 }} />
                <span style={{ color: tokens.color.muted }}>Click để upload hình nền</span>
              </>
            )}
          </label>
        )}
      </Card>

      {/* Company Info */}
      <Card icon="ri-building-2-line" title="Thông Tin Công Ty" subtitle="Thông tin hiển thị trên website">
        <Input
          label="Tên công ty"
          value={settings.name}
          onChange={(value) => onChange({ ...settings, name: value })}
          placeholder="Anh Thợ Xây"
          fullWidth
        />

        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: tokens.color.text, fontWeight: 500 }}>
            Mô tả
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => onChange({ ...settings, description: e.target.value })}
            placeholder="Mô tả ngắn về công ty..."
            rows={3}
            style={{
              width: '100%',
              padding: 12,
              background: glass.background,
              border: glass.border,
              borderRadius: tokens.radius.md,
              color: tokens.color.text,
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
          <Input
            label="Số điện thoại"
            value={settings.phone}
            onChange={(value) => onChange({ ...settings, phone: value })}
            placeholder="0909 123 456"
            fullWidth
          />
          <Input
            label="Email"
            value={settings.email}
            onChange={(value) => onChange({ ...settings, email: value })}
            placeholder="contact@anhthoxay.vn"
            fullWidth
          />
          <Input
            label="Website"
            value={settings.website}
            onChange={(value) => onChange({ ...settings, website: value })}
            placeholder="https://anhthoxay.vn"
            fullWidth
          />
          <Input
            label="Giờ làm việc"
            value={settings.workingHours}
            onChange={(value) => onChange({ ...settings, workingHours: value })}
            placeholder="T2 - T7: 8:00 - 18:00"
            fullWidth
          />
        </div>

        <Input
          label="Địa chỉ"
          value={settings.address}
          onChange={(value) => onChange({ ...settings, address: value })}
          placeholder="123 Đường ABC, Quận 1, TP.HCM"
          fullWidth
          style={{ marginTop: 16 }}
        />

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <i className={saving ? 'ri-loader-4-line' : 'ri-save-line'} />
            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
