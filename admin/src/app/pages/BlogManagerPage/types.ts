// Types for BlogManagerPage tabs

export type BlogTabType = 'categories' | 'posts';

export interface BlogTabConfig {
  id: BlogTabType;
  label: string;
  icon: string;
}

export const BLOG_TABS: BlogTabConfig[] = [
  { id: 'categories', label: 'Categories', icon: 'ri-price-tag-3-line' },
  { id: 'posts', label: 'Bài viết', icon: 'ri-article-line' },
];
