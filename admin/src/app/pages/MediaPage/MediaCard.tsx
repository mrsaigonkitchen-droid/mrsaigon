// Media Card Component
import { motion } from 'framer-motion';
import { tokens, resolveMediaUrl } from '@app/shared';
import { OptimizedImage } from '../../components/OptimizedImage';
import { UsageBadges } from './UsageBadges';
import type { MediaCardProps } from './types';

export function MediaCard({ file, index, usageInfo, dynamicCategories, onEdit, onDelete, onCopy }: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      style={{
        position: 'relative',
        background: 'rgba(12,12,16,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Usage Badges */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <UsageBadges usedIn={usageInfo.usedIn} dynamicCategories={dynamicCategories} />
      </div>

      {/* Image */}
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#000' }}>
        <OptimizedImage
          src={resolveMediaUrl(file.url)}
          alt={file.alt || 'Media'}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 13, color: tokens.color.text, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.alt || 'Untitled'}
        </div>
        <div style={{ fontSize: 11, color: tokens.color.muted, marginBottom: 8 }}>
          {file.width && file.height ? `${file.width} × ${file.height}` : 'Unknown size'}
          {file.tags && (
            <>
              <br />
              <span style={{ color: tokens.color.primary, fontSize: 10 }}>{file.tags}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCopy(file.url)}
            style={{
              flex: 1,
              padding: '8px',
              background: `${tokens.color.primary}15`,
              border: `1px solid ${tokens.color.primary}30`,
              borderRadius: '8px',
              color: tokens.color.primary,
              cursor: 'pointer',
              fontSize: 16,
            }}
            title="Copy URL"
          >
            <i className="ri-file-copy-line" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(file)}
            style={{
              flex: 1,
              padding: '8px',
              background: `${tokens.color.info}15`,
              border: `1px solid ${tokens.color.info}30`,
              borderRadius: '8px',
              color: tokens.color.info,
              cursor: 'pointer',
              fontSize: 16,
            }}
            title="Edit"
          >
            <i className="ri-edit-line" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(file.id)}
            style={{
              flex: 1,
              padding: '8px',
              background: `${tokens.color.error}15`,
              border: `1px solid ${tokens.color.error}30`,
              borderRadius: '8px',
              color: tokens.color.error,
              cursor: 'pointer',
              fontSize: 16,
            }}
            title="Delete"
          >
            <i className="ri-delete-bin-line" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
