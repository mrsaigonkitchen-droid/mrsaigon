// Settings Page Type Definitions - ANH THỢ XÂY

export interface CompanySettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  workingHours: string;
  backgroundImage?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  newLeads: boolean;
  newComments: boolean;
  systemUpdates: boolean;
}

export interface HeaderConfig {
  logo?: { text?: string; icon?: string; imageUrl?: string; animateIcon?: boolean };
  navigation?: Array<{ label: string; route: string; icon?: string }>;
  cta?: { text?: string; link?: string; variant?: 'primary' | 'outline' };
  options?: { sticky?: boolean; transparent?: boolean; showSearch?: boolean };
}

export interface FooterConfig {
  brand?: { text?: string; icon?: string; tagline?: string };
  quickLinks?: Array<{ label: string; link: string }>;
  newsletter?: { title?: string; placeholder?: string; buttonText?: string };
  social?: Array<{ platform: string; url: string; icon: string }>;
  copyright?: { text?: string };
}

export type SettingsTab = 'layout' | 'company' | 'theme' | 'notifications';

// Glass Morphism Design Tokens (matching landing page)
export const glass = {
  background: 'rgba(12,12,16,0.7)',
  border: '1px solid rgba(255,255,255,0.08)',
  blur: 'blur(20px)',
  shadow: '0 8px 32px rgba(0,0,0,0.3)',
  hoverBorder: '1px solid rgba(245,211,147,0.3)',
  hoverShadow: '0 12px 48px rgba(245,211,147,0.15)',
};

// Default values - ATH Construction
export const defaultCompanySettings: CompanySettings = {
  name: 'Anh Thợ Xây',
  description: 'Dịch vụ cải tạo nhà & căn hộ chuyên nghiệp',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  phone: '0909 123 456',
  email: 'contact@anhthoxay.vn',
  website: 'https://anhthoxay.vn',
  workingHours: 'T2 - T7: 8:00 - 18:00',
};

export const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#f5d393',
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
};

export const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  newLeads: true,
  newComments: true,
  systemUpdates: false,
};

export const defaultHeaderConfig: HeaderConfig = {
  logo: { text: 'Anh Thợ Xây', icon: 'ri-building-2-fill', animateIcon: true },
  navigation: [
    { label: 'Trang chủ', route: '/', icon: 'ri-home-4-line' },
    { label: 'Báo giá', route: '/bao-gia', icon: 'ri-calculator-line' },
    { label: 'Giới thiệu', route: '/about', icon: 'ri-information-line' },
    { label: 'Blog', route: '/blog', icon: 'ri-article-line' },
    { label: 'Liên hệ', route: '/contact', icon: 'ri-map-pin-line' },
  ],
  cta: { text: 'Báo giá ngay', link: '/bao-gia', variant: 'primary' },
  options: { sticky: true, transparent: false, showSearch: false },
};

export const defaultFooterConfig: FooterConfig = {
  brand: { text: 'Anh Thợ Xây', icon: 'ri-building-2-fill', tagline: 'Dịch vụ cải tạo nhà chuyên nghiệp' },
  quickLinks: [
    { label: 'Giới thiệu', link: '/about' },
    { label: 'Báo giá', link: '/bao-gia' },
    { label: 'Blog', link: '/blog' },
    { label: 'Liên hệ', link: '/contact' },
  ],
  newsletter: {
    title: 'Đăng ký nhận tin',
    placeholder: 'Email của bạn',
    buttonText: 'Đăng ký',
  },
  social: [
    { platform: 'Facebook', url: 'https://facebook.com', icon: 'ri-facebook-fill' },
    { platform: 'Zalo', url: 'https://zalo.me', icon: 'ri-chat-3-fill' },
    { platform: 'Youtube', url: 'https://youtube.com', icon: 'ri-youtube-fill' },
  ],
  copyright: { text: `© ${new Date().getFullYear()} Anh Thợ Xây. All rights reserved.` },
};

// API URL
export const API_URL = 'http://localhost:4202';
