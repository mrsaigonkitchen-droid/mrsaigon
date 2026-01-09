import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

interface AboutData {
  badge?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

interface AboutProps {
  data: AboutData;
}

export function About({ data }: AboutProps) {
  const { badge, title, description, imageUrl } = data;

  return (
    <section
      style={{
        padding: 'clamp(60px, 10vw, 100px) clamp(16px, 5vw, 40px)',
        background: tokens.color.background,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: imageUrl ? 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))' : '1fr',
          gap: 'clamp(32px, 6vw, 60px)',
          alignItems: 'center',
        }}
      >
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {badge && (
            <span
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: `${tokens.color.primary}15`,
                color: tokens.color.primary,
                borderRadius: tokens.radius.pill,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {badge}
            </span>
          )}

          {title && (
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 42px)',
                fontWeight: 700,
                color: tokens.color.text,
                lineHeight: 1.2,
                marginBottom: 20,
                fontFamily: tokens.font.display,
              }}
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 17px)',
                color: tokens.color.muted,
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
              }}
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* Image */}
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: 'relative',
              borderRadius: tokens.radius.lg,
              overflow: 'hidden',
              aspectRatio: '4/3',
            }}
          >
            <img
              src={imageUrl}
              alt={title || 'About'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Decorative border */}
            <div
              style={{
                position: 'absolute',
                inset: -8,
                border: `2px solid ${tokens.color.primary}30`,
                borderRadius: tokens.radius.lg,
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
