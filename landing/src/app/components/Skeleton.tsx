import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = tokens.radius.md, style }: SkeletonProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, 
          rgba(255,255,255,0.05) 0%, 
          rgba(255,255,255,0.1) 50%, 
          rgba(255,255,255,0.05) 100%)`,
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div
      style={{
        background: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.lg,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Skeleton height={200} borderRadius={tokens.radius.md} />
      <Skeleton height={24} width="80%" />
      <Skeleton height={16} width="60%" />
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Skeleton height={16} width={80} borderRadius={tokens.radius.pill} />
        <Skeleton height={16} width={60} borderRadius={tokens.radius.pill} />
      </div>
    </div>
  );
}

// Menu Item Skeleton
export function MenuItemSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        padding: 24,
        background: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.lg,
      }}
    >
      <Skeleton width={120} height={120} borderRadius={tokens.radius.md} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton height={24} width="70%" />
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="85%" />
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton height={28} width={80} />
          <Skeleton height={40} width={120} borderRadius={tokens.radius.pill} />
        </div>
      </div>
    </div>
  );
}

// Gallery Grid Skeleton
export function GalleryGridSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 24,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={280} borderRadius={tokens.radius.lg} />
      ))}
    </div>
  );
}

// Text Lines Skeleton
export function TextLinesSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}


