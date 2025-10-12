// Type definitions for Landing app

export type RouteType = 'home' | 'menu' | 'about' | 'gallery' | 'contact' | 'blog' | 'test-hover';

export interface Section {
  id: string;
  kind: string;
  order: number;
  data: Record<string, unknown>;
}

export interface PageData {
  id?: string;
  title?: string;
  slug?: string;
  headerConfig?: string | Record<string, unknown>; // JSON string or parsed object
  footerConfig?: string | Record<string, unknown>; // JSON string or parsed object
  sections?: Section[];
}

export interface PageMeta {
  title?: string;
  description?: string;
}

export interface FABAction {
  icon: string;
  label: string;
  href: string;
  color: string;
}

export interface FABActionsData {
  mainIcon?: string;
  mainColor?: string;
  actions: FABAction[];
}

export interface FooterSocialData {
  title?: string;
  subtitle?: string;
  platforms: Array<{
    name: string;
    url: string;
  }>;
  layout?: 'horizontal' | 'circular';
}
