import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

interface MissionVisionData {
  title?: string;
  subtitle?: string;
  mission?: {
    icon: string;
    title: string;
    content: string;
  };
  vision?: {
    icon: string;
    title: string;
    content: string;
  };
}

export function MissionVision({ data }: { data: MissionVisionData }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        margin: '80px 0',
        padding: '60px 24px',
      }}
    >
      {/* Header */}
      {(data.title || data.subtitle) && (
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {data.title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: tokens.font.size.h2,
                fontFamily: tokens.font.display,
                color: tokens.color.primary,
                marginBottom: 12,
              }}
            >
              {data.title}
            </motion.h2>
          )}
          {data.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                color: tokens.color.muted,
                fontSize: 16,
              }}
            >
              {data.subtitle}
            </motion.p>
          )}
        </div>
      )}

      {/* Mission & Vision Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Mission */}
        {data.mission && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            style={{
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(12px)',
              padding: 48,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
              }}
            >
              <i className={data.mission.icon} style={{ fontSize: 36, color: '#111' }} />
            </motion.div>

            {/* Title */}
            <h3
              style={{
                fontSize: 28,
                color: tokens.color.primary,
                marginBottom: 16,
                fontWeight: 700,
                fontFamily: tokens.font.display,
              }}
            >
              {data.mission.title}
            </h3>

            {/* Content */}
            <p
              style={{
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.8,
                fontSize: 16,
                margin: 0,
              }}
            >
              {data.mission.content}
            </p>
          </motion.div>
        )}

        {/* Vision */}
        {data.vision && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            style={{
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(12px)',
              padding: 48,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
              }}
            >
              <i className={data.vision.icon} style={{ fontSize: 36, color: '#111' }} />
            </motion.div>

            {/* Title */}
            <h3
              style={{
                fontSize: 28,
                color: tokens.color.primary,
                marginBottom: 16,
                fontWeight: 700,
                fontFamily: tokens.font.display,
              }}
            >
              {data.vision.title}
            </h3>

            {/* Content */}
            <p
              style={{
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.8,
                fontSize: 16,
                margin: 0,
              }}
            >
              {data.vision.content}
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

