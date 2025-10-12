import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

export function HeroSkeleton() {
  return (
    <div style={{ height: '100vh', minHeight: 600, background: tokens.color.surface, position: 'relative' }}>
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 800,
          textAlign: 'center',
        }}
      >
        <div
          className="skeleton"
          style={{
            height: 80,
            background: tokens.color.border,
            borderRadius: 12,
            marginBottom: 24,
          }}
        />
        <div
          className="skeleton"
          style={{
            height: 40,
            background: tokens.color.border,
            borderRadius: 8,
            marginBottom: 32,
          }}
        />
        <div
          className="skeleton"
          style={{
            height: 56,
            width: 200,
            margin: '0 auto',
            background: tokens.color.border,
            borderRadius: 999,
          }}
        />
      </motion.div>
    </div>
  );
}

export function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ padding: '32px 0', display: 'grid', gap: 32 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{
            background: tokens.color.surface,
            padding: 32,
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          <div
            className="skeleton"
            style={{
              height: 32,
              width: 240,
              background: tokens.color.border,
              borderRadius: 8,
              marginBottom: 20,
            }}
          />
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="skeleton" style={{ height: 160, background: tokens.color.border, borderRadius: 12 }} />
            <div className="skeleton" style={{ height: 20, background: tokens.color.border, borderRadius: 6 }} />
            <div
              className="skeleton"
              style={{ height: 20, width: '80%', background: tokens.color.border, borderRadius: 6 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginTop: 40,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="skeleton"
          style={{
            height: 320,
            background: tokens.color.surface,
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.color.border}`,
          }}
        />
      ))}
    </div>
  );
}

