import { useState, memo } from 'react';
import { tokens } from '@app/shared';

interface BlogImageThumbnailProps {
  src?: string;
  alt?: string;
  onClick?: () => void;
}

/**
 * Blog Image Thumbnail - Banner style with lightbox support
 * Displays image with hover effect and click to open lightbox
 */
export const BlogImageThumbnail = memo(function BlogImageThumbnail({ 
  src, 
  alt, 
  onClick 
}: BlogImageThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.()}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        height: '200px',
        margin: '32px auto',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: isHovered
          ? `3px solid ${tokens.color.primary}`
          : '2px solid rgba(255,255,255,0.2)',
        boxShadow: isHovered
          ? `0 0 40px ${tokens.color.primary}60, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        background: isHovered ? `${tokens.color.primary}08` : 'transparent',
      }}
    >
      {/* Image background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.5s ease',
          pointerEvents: 'none',
        }}
        role="img"
        aria-label={alt}
      />

      {/* Overlay gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isHovered
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))'
            : 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.2))',
          zIndex: 1,
          transition: 'all 0.3s ease',
        }}
      />

      {/* Hover Icon */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${isHovered ? 1 : 0.8})`,
          opacity: isHovered ? 1 : 0,
          zIndex: 10,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          border: `2px solid ${tokens.color.primary}99`,
          borderRadius: '50%',
          width: '72px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
          fontSize: '32px',
          color: 'white',
          boxShadow: `0 0 20px ${tokens.color.primary}4D`,
        }}
      >
        🔍
      </div>

      {/* Hint badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${tokens.color.primary}80`,
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.95)',
          fontWeight: 500,
          zIndex: 10,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'none',
          boxShadow: `0 0 15px ${tokens.color.primary}33`,
        }}
      >
        🔍 Click để xem full
      </div>
    </div>
  );
});
