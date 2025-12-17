import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { IconPicker } from '../../components/IconPicker';
import type { HeaderConfig, FooterConfig } from './types';
import { API_URL, glass } from './types';

interface LayoutTabProps {
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  onHeaderChange: (config: HeaderConfig) => void;
  onFooterChange: (config: FooterConfig) => void;
  onShowMessage: (message: string) => void;
  onError: (message: string) => void;
}

// ATH pages list
const ATH_PAGES = ['home', 'about', 'contact', 'blog', 'bao-gia'];

export function LayoutTab({
  headerConfig,
  footerConfig,
  onHeaderChange,
  onFooterChange,
  onShowMessage,
  onError,
}: LayoutTabProps) {
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);

  // Save header config to all pages
  const handleSaveHeader = useCallback(async () => {
    try {
      setSavingHeader(true);

      const landingHeaderConfig = {
        logo: {
          text: headerConfig.logo?.text || 'Anh Thợ Xây',
          icon: headerConfig.logo?.icon || 'ri-building-2-fill',
          animateIcon: headerConfig.logo?.animateIcon ?? true,
        },
        links: headerConfig.navigation?.map((nav) => ({
          href: nav.route,
          label: nav.label,
          icon: nav.icon,
        })) || [],
        ctaButton: headerConfig.cta ? {
          text: headerConfig.cta.text,
          href: headerConfig.cta.link,
          icon: 'ri-phone-line',
        } : undefined,
        showMobileMenu: true,
      };

      const headerConfigStr = JSON.stringify(landingHeaderConfig);

      // Save to all ATH pages
      await Promise.all(
        ATH_PAGES.map((slug) =>
          fetch(`${API_URL}/pages/${slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ headerConfig: headerConfigStr }),
          })
        )
      );

      onShowMessage('✅ Header đã được lưu cho tất cả trang!');
    } catch (error) {
      console.error('Error saving header:', error);
      onError('Lưu header thất bại.');
    } finally {
      setSavingHeader(false);
    }
  }, [headerConfig, onShowMessage, onError]);

  // Save footer config to all pages
  const handleSaveFooter = useCallback(async () => {
    try {
      setSavingFooter(true);

      const landingFooterConfig = {
        brand: {
          text: footerConfig.brand?.text || 'Anh Thợ Xây',
          icon: footerConfig.brand?.icon || 'ri-building-2-fill',
          description: footerConfig.brand?.tagline || '',
        },
        quickLinks: footerConfig.quickLinks?.map((link) => ({
          href: link.link,
          label: link.label,
        })) || [],
        newsletter: footerConfig.newsletter,
        socialLinks: footerConfig.social?.map((s) => ({
          platform: s.platform.toLowerCase(),
          url: s.url,
          icon: s.icon,
        })) || [],
        copyright: footerConfig.copyright?.text || `© ${new Date().getFullYear()} Anh Thợ Xây`,
      };

      const footerConfigStr = JSON.stringify(landingFooterConfig);

      // Save to all ATH pages
      await Promise.all(
        ATH_PAGES.map((slug) =>
          fetch(`${API_URL}/pages/${slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ footerConfig: footerConfigStr }),
          })
        )
      );

      onShowMessage('✅ Footer đã được lưu cho tất cả trang!');
    } catch (error) {
      console.error('Error saving footer:', error);
      onError('Lưu footer thất bại.');
    } finally {
      setSavingFooter(false);
    }
  }, [footerConfig, onShowMessage, onError]);

  // Navigation helpers
  const addNavItem = useCallback(() => {
    const newNav = [...(headerConfig.navigation || []), { label: 'Link mới', route: '/', icon: 'ri-link' }];
    onHeaderChange({ ...headerConfig, navigation: newNav });
  }, [headerConfig, onHeaderChange]);

  const removeNavItem = useCallback((index: number) => {
    const newNav = headerConfig.navigation?.filter((_, i) => i !== index) || [];
    onHeaderChange({ ...headerConfig, navigation: newNav });
  }, [headerConfig, onHeaderChange]);

  const updateNavItem = useCallback((index: number, field: string, value: string) => {
    const newNav = headerConfig.navigation?.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ) || [];
    onHeaderChange({ ...headerConfig, navigation: newNav });
  }, [headerConfig, onHeaderChange]);

  // Quick links helpers
  const addQuickLink = useCallback(() => {
    const newLinks = [...(footerConfig.quickLinks || []), { label: 'Link mới', link: '/' }];
    onFooterChange({ ...footerConfig, quickLinks: newLinks });
  }, [footerConfig, onFooterChange]);

  const removeQuickLink = useCallback((index: number) => {
    const newLinks = footerConfig.quickLinks?.filter((_, i) => i !== index) || [];
    onFooterChange({ ...footerConfig, quickLinks: newLinks });
  }, [footerConfig, onFooterChange]);

  const updateQuickLink = useCallback((index: number, field: string, value: string) => {
    const newLinks = footerConfig.quickLinks?.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ) || [];
    onFooterChange({ ...footerConfig, quickLinks: newLinks });
  }, [footerConfig, onFooterChange]);

  // Social links helpers
  const addSocialLink = useCallback(() => {
    const newSocial = [...(footerConfig.social || []), { platform: 'Facebook', url: 'https://facebook.com', icon: 'ri-facebook-fill' }];
    onFooterChange({ ...footerConfig, social: newSocial });
  }, [footerConfig, onFooterChange]);

  const removeSocialLink = useCallback((index: number) => {
    const newSocial = footerConfig.social?.filter((_, i) => i !== index) || [];
    onFooterChange({ ...footerConfig, social: newSocial });
  }, [footerConfig, onFooterChange]);

  const updateSocialLink = useCallback((index: number, field: string, value: string) => {
    const newSocial = footerConfig.social?.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ) || [];
    onFooterChange({ ...footerConfig, social: newSocial });
  }, [footerConfig, onFooterChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Header Config */}
      <Card icon="ri-layout-top-2-line" title="Header Configuration" subtitle="Tùy chỉnh logo, navigation và CTA button">
        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Logo</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <Input
              label="Text"
              value={headerConfig.logo?.text || ''}
              onChange={(v) => onHeaderChange({ ...headerConfig, logo: { ...headerConfig.logo, text: v } })}
              placeholder="Anh Thợ Xây"
              fullWidth
            />
            <IconPicker
              label="Icon"
              value={headerConfig.logo?.icon || ''}
              onChange={(v) => onHeaderChange({ ...headerConfig, logo: { ...headerConfig.logo, icon: v } })}
            />
          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600 }}>Navigation Links</h4>
            <Button variant="secondary" size="small" onClick={addNavItem}>
              <i className="ri-add-line" /> Thêm
            </Button>
          </div>
          {headerConfig.navigation?.map((nav, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 8,
              marginBottom: 8,
              padding: 12,
              background: glass.background,
              borderRadius: tokens.radius.md,
            }}>
              <Input value={nav.label} onChange={(v) => updateNavItem(i, 'label', v)} placeholder="Label" fullWidth />
              <Input value={nav.route} onChange={(v) => updateNavItem(i, 'route', v)} placeholder="/route" fullWidth />
              <IconPicker value={nav.icon || ''} onChange={(v) => updateNavItem(i, 'icon', v)} />
              <Button variant="danger" size="small" onClick={() => removeNavItem(i)}>
                <i className="ri-delete-bin-line" />
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>CTA Button</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <Input
              label="Text"
              value={headerConfig.cta?.text || ''}
              onChange={(v) => onHeaderChange({ ...headerConfig, cta: { ...headerConfig.cta, text: v } })}
              placeholder="Báo giá ngay"
              fullWidth
            />
            <Input
              label="Link"
              value={headerConfig.cta?.link || ''}
              onChange={(v) => onHeaderChange({ ...headerConfig, cta: { ...headerConfig.cta, link: v } })}
              placeholder="/bao-gia"
              fullWidth
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: tokens.color.muted }}>
            <i className="ri-information-line" style={{ marginRight: 4 }} />
            Áp dụng cho tất cả trang (home, bao-gia, about, blog, contact)
          </p>
          <Button variant="primary" onClick={handleSaveHeader} disabled={savingHeader}>
            <i className={savingHeader ? 'ri-loader-4-line' : 'ri-save-line'} />
            {savingHeader ? 'Đang lưu...' : 'Lưu Header'}
          </Button>
        </div>
      </Card>

      {/* Footer Config */}
      <Card icon="ri-layout-bottom-2-line" title="Footer Configuration" subtitle="Tùy chỉnh brand, links và social media">
        {/* Brand */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Brand</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <Input
              label="Name"
              value={footerConfig.brand?.text || ''}
              onChange={(v) => onFooterChange({ ...footerConfig, brand: { ...footerConfig.brand, text: v } })}
              placeholder="Anh Thợ Xây"
              fullWidth
            />
            <IconPicker
              label="Icon"
              value={footerConfig.brand?.icon || ''}
              onChange={(v) => onFooterChange({ ...footerConfig, brand: { ...footerConfig.brand, icon: v } })}
            />
          </div>
          <Input
            label="Tagline"
            value={footerConfig.brand?.tagline || ''}
            onChange={(v) => onFooterChange({ ...footerConfig, brand: { ...footerConfig.brand, tagline: v } })}
            placeholder="Dịch vụ cải tạo nhà chuyên nghiệp"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </div>

        {/* Quick Links */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600 }}>Quick Links</h4>
            <Button variant="secondary" size="small" onClick={addQuickLink}>
              <i className="ri-add-line" /> Thêm
            </Button>
          </div>
          {footerConfig.quickLinks?.map((link, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 8,
              marginBottom: 8,
              padding: 12,
              background: glass.background,
              borderRadius: tokens.radius.md,
            }}>
              <Input value={link.label} onChange={(v) => updateQuickLink(i, 'label', v)} placeholder="Label" fullWidth />
              <Input value={link.link} onChange={(v) => updateQuickLink(i, 'link', v)} placeholder="/link" fullWidth />
              <Button variant="danger" size="small" onClick={() => removeQuickLink(i)}>
                <i className="ri-delete-bin-line" />
              </Button>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600 }}>Social Links</h4>
            <Button variant="secondary" size="small" onClick={addSocialLink}>
              <i className="ri-add-line" /> Thêm
            </Button>
          </div>
          {footerConfig.social?.map((social, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 8,
              marginBottom: 8,
              padding: 12,
              background: glass.background,
              borderRadius: tokens.radius.md,
            }}>
              <Input value={social.platform} onChange={(v) => updateSocialLink(i, 'platform', v)} placeholder="Platform" fullWidth />
              <Input value={social.url} onChange={(v) => updateSocialLink(i, 'url', v)} placeholder="URL" fullWidth />
              <IconPicker value={social.icon} onChange={(v) => updateSocialLink(i, 'icon', v)} />
              <Button variant="danger" size="small" onClick={() => removeSocialLink(i)}>
                <i className="ri-delete-bin-line" />
              </Button>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <Input
          label="Copyright"
          value={footerConfig.copyright?.text || ''}
          onChange={(v) => onFooterChange({ ...footerConfig, copyright: { text: v } })}
          placeholder={`© ${new Date().getFullYear()} Anh Thợ Xây`}
          fullWidth
          style={{ marginBottom: 24 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: tokens.color.muted }}>
            <i className="ri-information-line" style={{ marginRight: 4 }} />
            Áp dụng cho tất cả trang (home, bao-gia, about, blog, contact)
          </p>
          <Button variant="primary" onClick={handleSaveFooter} disabled={savingFooter}>
            <i className={savingFooter ? 'ri-loader-4-line' : 'ri-save-line'} />
            {savingFooter ? 'Đang lưu...' : 'Lưu Footer'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
