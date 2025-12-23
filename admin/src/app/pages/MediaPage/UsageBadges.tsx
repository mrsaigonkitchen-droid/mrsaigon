// Usage Badges Component - Shows where media is used
import { tokens } from '@app/shared';
import type { UsageBadgesProps } from './types';

// Static badge configs for base categories
const STATIC_BADGES: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  blog: { label: 'Blog', icon: 'ri-article-line', bg: 'rgba(59,130,246,0.2)', color: '#3b82f6' },
  sections: { label: 'Sections', icon: 'ri-layout-line', bg: 'rgba(168,85,247,0.2)', color: '#a855f7' },
};

// Generate color from string (for dynamic categories)
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function UsageBadges({ usedIn, dynamicCategories }: UsageBadgesProps) {
  if (usedIn.length === 0) {
    return (
      <span style={{ 
        padding: '2px 8px', 
        background: 'rgba(239,68,68,0.2)', 
        borderRadius: '6px', 
        fontSize: 11, 
        color: tokens.color.error, 
        fontWeight: 600 
      }}>
        Chưa dùng
      </span>
    );
  }

  return (
    <>
      {usedIn.map(usage => {
        // Check static badges first
        const staticConfig = STATIC_BADGES[usage];
        if (staticConfig) {
          return (
            <span
              key={usage}
              style={{
                padding: '2px 8px',
                background: staticConfig.bg,
                borderRadius: '6px',
                fontSize: 11,
                color: staticConfig.color,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <i className={staticConfig.icon} style={{ fontSize: 10 }} />
              {staticConfig.label}
            </span>
          );
        }

        // Check dynamic categories
        const dynamicConfig = dynamicCategories[usage];
        if (dynamicConfig) {
          const color = stringToColor(usage);
          return (
            <span
              key={usage}
              style={{
                padding: '2px 8px',
                background: `${color}20`,
                borderRadius: '6px',
                fontSize: 11,
                color: color,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <i className={dynamicConfig.icon} style={{ fontSize: 10 }} />
              {dynamicConfig.label}
            </span>
          );
        }

        return null;
      })}
    </>
  );
}
