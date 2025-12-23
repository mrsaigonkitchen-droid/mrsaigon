// Filter Tabs Component - Base + Dynamic categories
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import type { DynamicCategory } from './types';

interface FilterTabsProps {
  filter: string;
  setFilter: (filter: string) => void;
  dynamicCategories: Record<string, DynamicCategory>;
  usageSummary: { total: number; blog: number; sections: number; unused: number };
}

export function FilterTabs({ filter, setFilter, dynamicCategories, usageSummary }: FilterTabsProps) {
  // Build filter items: base filters + dynamic categories
  const filterItems: Array<{ value: string; label: string; icon: string; count: number }> = [
    // Base filters with counts
    { value: 'all', label: 'Tất cả', icon: 'ri-image-line', count: usageSummary.total },
    { value: 'blog', label: 'Blog', icon: 'ri-article-line', count: usageSummary.blog },
    { value: 'sections', label: 'Sections', icon: 'ri-layout-line', count: usageSummary.sections },
    // Dynamic categories from API
    ...Object.entries(dynamicCategories).map(([key, cat]) => ({
      value: key,
      label: cat.label,
      icon: cat.icon,
      count: cat.count,
    })),
    // Unused at the end
    { value: 'unused', label: 'Chưa dùng', icon: 'ri-question-line', count: usageSummary.unused },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: 6, 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '12px', 
      padding: 4, 
      flexWrap: 'wrap' 
    }}>
      {filterItems.map(({ value, label, icon, count }) => (
        <motion.button
          key={value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFilter(value)}
          style={{
            padding: '6px 12px',
            background: filter === value 
              ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})` 
              : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: filter === value ? '#0b0c0f' : tokens.color.muted,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
          }}
        >
          <i className={icon} style={{ fontSize: 14 }} />
          {label}
          <span style={{ 
            fontSize: 11, 
            opacity: 0.8,
            background: filter === value ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
            padding: '1px 5px',
            borderRadius: 4,
          }}>
            {count}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
