import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import type { FooterSocialData } from '../types';

interface FooterSocialProps {
  data: FooterSocialData;
}

export function FooterSocial({ data }: FooterSocialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        marginTop: 60,
        padding: 48,
        background: `linear-gradient(135deg, ${tokens.color.surface} 0%, rgba(19,19,22,0.8) 100%)`,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.border}`,
        textAlign: 'center',
      }}
    >
      {data.title && (
        <h3 style={{ fontSize: 28, color: tokens.color.primary, marginBottom: 16, fontWeight: 700 }}>
          {data.title}
        </h3>
      )}
      {data.subtitle && (
        <p style={{ color: tokens.color.muted, marginBottom: 32, fontSize: 16 }}>
          {data.subtitle}
        </p>
      )}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        justifyContent: 'center', 
        flexWrap: 'wrap' 
      }}>
        {data.platforms?.map((platform, idx) => (
          <motion.a
            key={idx}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: data.layout === 'circular' ? '50%' : tokens.radius.md,
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111',
              fontSize: 24,
              textDecoration: 'none',
              boxShadow: tokens.shadow.md,
              transition: 'all 0.3s ease',
            }}
            title={platform.name}
          >
            <i className={`ri-${platform.name}-fill`} />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

