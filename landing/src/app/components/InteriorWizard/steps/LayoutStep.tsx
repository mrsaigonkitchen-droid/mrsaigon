/**
 * LayoutStep - Step 5: Preview layout
 * Optimized for PC: 2-column layout (image left, info right)
 * Mobile: stacked layout
 */

import { tokens, resolveMediaUrl } from '@app/shared';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Layout, BuildingUnit } from '../types';

interface LayoutStepProps {
  layout: Layout | null;
  unit: BuildingUnit | null;
  onContinue: () => void;
  onBack: () => void;
}

type ViewMode = '2d' | '3d';

export function LayoutStep({ layout, unit, onContinue, onBack }: LayoutStepProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');

  if (!layout || !unit) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: tokens.color.error }}>Vui lòng chọn căn hộ trước</p>
      </div>
    );
  }

  const imageUrl =
    viewMode === '2d'
      ? layout.layoutImage
        ? resolveMediaUrl(layout.layoutImage)
        : null
      : layout.layout3DImage
        ? resolveMediaUrl(layout.layout3DImage)
        : null;

  const has3D = !!layout.layout3DImage;

  return (
    <div className="layout-step">
      <BackButton onClick={onBack} />
      
      {/* Header */}
      <div style={headerContainerStyle}>
        <h2 style={headerStyle}>Mặt Bằng Căn Hộ</h2>
        <p style={subtitleStyle}>
          {layout.name} • {unit.code}
        </p>
      </div>

      {/* Main Content - 2 columns on PC */}
      <div className="layout-content">
        {/* Left: Image */}
        <div className="layout-image-section">
          {/* View Mode Toggle */}
          {has3D && (
            <div style={toggleContainerStyle}>
              <button
                onClick={() => setViewMode('2d')}
                style={{
                  ...toggleButtonStyle,
                  ...(viewMode === '2d' ? activeToggleStyle : {}),
                }}
              >
                <i className="ri-layout-line" style={{ marginRight: '0.5rem' }} />
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                style={{
                  ...toggleButtonStyle,
                  ...(viewMode === '3d' ? activeToggleStyle : {}),
                }}
              >
                <i className="ri-box-3-line" style={{ marginRight: '0.5rem' }} />
                3D
              </button>
            </div>
          )}

          {/* Layout Image */}
          <div style={imageContainerStyle}>
            {imageUrl ? (
              <motion.img
                key={viewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={imageUrl}
                alt={layout.name}
                style={imageStyle}
              />
            ) : (
              <div style={placeholderStyle}>
                <i className="ri-image-line" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} />
                <p>Chưa có hình ảnh</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="layout-info-section">
          {/* Area Summary */}
          <div style={summaryStyle}>
            <h3 style={sectionTitleStyle}>
              <i className="ri-ruler-line" style={{ marginRight: '0.5rem' }} />
              Diện tích
            </h3>
            <div style={areaGridStyle}>
              <AreaItem label="Tim tường" value={`${layout.grossArea} m²`} />
              <AreaItem label="Thông thủy" value={`${layout.netArea} m²`} highlight />
              {layout.carpetArea && (
                <AreaItem label="Thảm" value={`${layout.carpetArea} m²`} />
              )}
              {layout.balconyArea && (
                <AreaItem label="Ban công" value={`${layout.balconyArea} m²`} />
              )}
              {layout.terraceArea && (
                <AreaItem label="Sân thượng" value={`${layout.terraceArea} m²`} />
              )}
            </div>
          </div>

          {/* Room Breakdown */}
          {layout.rooms && layout.rooms.length > 0 && (
            <div style={summaryStyle}>
              <h3 style={sectionTitleStyle}>
                <i className="ri-home-4-line" style={{ marginRight: '0.5rem' }} />
                Phân chia phòng
              </h3>
              <div style={roomListStyle}>
                {layout.rooms.map((room, index) => (
                  <div key={index} style={roomItemStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i
                        className={getRoomIcon(room.type)}
                        style={{ color: tokens.color.primary }}
                      />
                      <span style={{ color: tokens.color.text, fontSize: '0.875rem' }}>{room.name}</span>
                    </div>
                    <span style={{ color: tokens.color.textMuted, fontSize: '0.875rem' }}>{room.area} m²</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {layout.highlights && layout.highlights.length > 0 && (
            <div style={highlightsStyle}>
              {layout.highlights.map((highlight, index) => (
                <span key={index} style={highlightTagStyle}>
                  <i className="ri-star-line" style={{ marginRight: '0.25rem' }} />
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            style={continueButtonStyle}
          >
            Chọn Gói Nội Thất
            <i className="ri-arrow-right-line" style={{ marginLeft: '0.5rem' }} />
          </motion.button>
        </div>
      </div>

      <style>{`
        .layout-step {
          max-width: 100%;
        }
        
        .layout-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        .layout-image-section {
          display: flex;
          flex-direction: column;
        }
        
        .layout-info-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        /* PC: 2 columns */
        @media (min-width: 768px) {
          .layout-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: start;
          }
          
          .layout-image-section {
            position: sticky;
            top: 1rem;
          }
        }
        
        /* Large PC: better proportions */
        @media (min-width: 1024px) {
          .layout-content {
            grid-template-columns: 55% 45%;
          }
        }
      `}</style>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent',
        border: 'none',
        color: tokens.color.textMuted,
        cursor: 'pointer',
        marginBottom: '0.75rem',
        padding: '0.5rem',
        fontSize: '0.875rem',
      }}
    >
      <i className="ri-arrow-left-line" />
      Quay lại
    </motion.button>
  );
}

function AreaItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: '0.625rem',
        background: highlight ? `${tokens.color.primary}15` : tokens.color.surface,
        borderRadius: tokens.radius.md,
        textAlign: 'center',
        border: highlight ? `1px solid ${tokens.color.primary}30` : 'none',
      }}
    >
      <div style={{ color: tokens.color.textMuted, fontSize: '0.7rem', marginBottom: '0.25rem' }}>{label}</div>
      <div
        style={{
          color: highlight ? tokens.color.primary : tokens.color.text,
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getRoomIcon(roomType: string): string {
  const icons: Record<string, string> = {
    LIVING: 'ri-sofa-line',
    BEDROOM: 'ri-hotel-bed-line',
    BEDROOM_MASTER: 'ri-hotel-bed-line',
    KITCHEN: 'ri-restaurant-line',
    BATHROOM: 'ri-drop-line',
    BATHROOM_ENSUITE: 'ri-drop-line',
    BALCONY: 'ri-sun-line',
    TERRACE: 'ri-sun-line',
    STORAGE: 'ri-archive-line',
    DINING: 'ri-restaurant-2-line',
    OTHER: 'ri-home-line',
  };
  return icons[roomType] || 'ri-home-line';
}

const headerContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '1rem',
};

const headerStyle: React.CSSProperties = {
  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
  fontWeight: 600,
  color: tokens.color.text,
  marginBottom: '0.25rem',
};

const subtitleStyle: React.CSSProperties = {
  color: tokens.color.textMuted,
  fontSize: '0.875rem',
};

const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'center',
  marginBottom: '0.75rem',
};

const toggleButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: tokens.color.surface,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.md,
  color: tokens.color.textMuted,
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 500,
  transition: 'all 0.2s',
};

const activeToggleStyle: React.CSSProperties = {
  background: tokens.color.primary,
  borderColor: tokens.color.primary,
  color: tokens.color.background,
};

const imageContainerStyle: React.CSSProperties = {
  background: tokens.color.surface,
  borderRadius: tokens.radius.lg,
  overflow: 'hidden',
  aspectRatio: '4/3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxHeight: '400px',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

const placeholderStyle: React.CSSProperties = {
  color: tokens.color.textMuted,
  textAlign: 'center',
  fontSize: '0.875rem',
};

const summaryStyle: React.CSSProperties = {
  background: tokens.color.surface,
  borderRadius: tokens.radius.lg,
  padding: '1rem',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  color: tokens.color.text,
  fontSize: '0.875rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
};

const areaGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 90px), 1fr))',
  gap: '0.5rem',
};

const roomListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
};

const roomItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0',
  borderBottom: `1px solid ${tokens.color.border}`,
};

const highlightsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const highlightTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.75rem',
  background: `${tokens.color.primary}15`,
  borderRadius: tokens.radius.pill,
  color: tokens.color.primary,
  fontSize: '0.75rem',
  fontWeight: 500,
};

const continueButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: 'clamp(0.75rem, 2vw, 1rem)',
  background: tokens.color.primary,
  border: 'none',
  borderRadius: tokens.radius.md,
  color: tokens.color.background,
  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  marginTop: 'auto',
};

export default LayoutStep;
