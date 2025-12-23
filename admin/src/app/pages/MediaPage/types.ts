// Media Page Types
import { MediaAsset } from '../../types';

export interface MediaUsageInfo {
  usedIn: string[];
  count: number;
}

export interface DynamicCategory {
  label: string;
  icon: string;
  count: number;
}

export interface EditMediaFormData {
  alt: string;
  tags: string;
}

export interface MediaCardProps {
  file: MediaAsset;
  index: number;
  usageInfo: MediaUsageInfo;
  dynamicCategories: Record<string, DynamicCategory>;
  onEdit: (file: MediaAsset) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
}

export interface UsageBadgesProps {
  usedIn: string[];
  dynamicCategories: Record<string, DynamicCategory>;
}

export interface EditMediaModalProps {
  file: MediaAsset;
  formData: EditMediaFormData;
  onFormChange: (data: EditMediaFormData) => void;
  onSave: () => void;
  onClose: () => void;
}

// Base filter tabs (always shown)
export const BASE_FILTERS = [
  { value: 'all', label: 'Tất cả', icon: 'ri-image-line' },
  { value: 'blog', label: 'Blog', icon: 'ri-article-line' },
  { value: 'sections', label: 'Sections', icon: 'ri-layout-line' },
  { value: 'unused', label: 'Chưa dùng', icon: 'ri-question-line' },
] as const;
