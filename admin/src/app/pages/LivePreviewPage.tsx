import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

import { Button } from '../components/Button';

export function LivePreviewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  function handleDeviceSwitch(device: 'desktop' | 'tablet' | 'mobile') {
    setIsMobile(device === 'mobile');
    setIsTablet(device === 'tablet');
  }

  const iframeWidth = isMobile ? '375px' : isTablet ? '768px' : '100%';

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ color: tokens.color.text, fontWeight: 600, fontSize: 16 }}>
            <i className="ri-tv-line" style={{ marginRight: 8 }} />
            Landing Page Preview
          </div>
          <div style={{ color: tokens.color.muted, fontSize: 14 }}>
            http://localhost:4200
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Device Switcher */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              display: 'flex',
              padding: 4,
            }}
          >
            {[
              { icon: 'ri-smartphone-line', device: 'mobile' as const, tooltip: 'Mobile' },
              { icon: 'ri-tablet-line', device: 'tablet' as const, tooltip: 'Tablet' },
              { icon: 'ri-computer-line', device: 'desktop' as const, tooltip: 'Desktop' },
            ].map(({ icon, device, tooltip }) => (
              <motion.button
                key={device}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeviceSwitch(device)}
                title={tooltip}
                style={{
                  background:
                    (device === 'mobile' && isMobile) ||
                    (device === 'tablet' && isTablet) ||
                    (device === 'desktop' && !isMobile && !isTablet)
                      ? tokens.color.primary
                      : 'transparent',
                  color:
                    (device === 'mobile' && isMobile) ||
                    (device === 'tablet' && isTablet) ||
                    (device === 'desktop' && !isMobile && !isTablet)
                      ? '#111'
                      : tokens.color.muted,
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: tokens.radius.sm,
                  cursor: 'pointer',
                  fontSize: 18,
                  transition: 'all 0.2s',
                }}
              >
                <i className={icon} />
              </motion.button>
            ))}
          </div>

          <Button variant="secondary" icon="ri-refresh-line" onClick={handleRefresh}>
            Refresh
          </Button>

          <Button
            variant="primary"
            icon="ri-external-link-line"
            onClick={() => window.open('http://localhost:4200', '_blank')}
          >
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div
        style={{
          flex: 1,
          background: '#1a1b1e',
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Device Frame for Mobile/Tablet */}
        {(isMobile || isTablet) && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: iframeWidth,
              height: '90%',
              background: '#fff',
              borderRadius: isMobile ? '32px' : '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              padding: isMobile ? '16px' : '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Notch for mobile */}
            {isMobile && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 120,
                  height: 24,
                  background: '#1a1b1e',
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  zIndex: 10,
                }}
              />
            )}

            <iframe
              ref={iframeRef}
              key={refreshKey}
              src="http://localhost:4200"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: isMobile ? '24px' : '8px',
                background: '#fff',
              }}
              title="Landing Page Preview"
            />
          </motion.div>
        )}

        {/* Full Desktop Preview */}
        {!isMobile && !isTablet && (
          <iframe
            ref={iframeRef}
            key={refreshKey}
            src="http://localhost:4200"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#fff',
            }}
            title="Landing Page Preview"
          />
        )}

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `4px solid ${tokens.color.border}`,
              borderTopColor: tokens.color.primary,
            }}
          />
        </motion.div>
      </div>

      {/* Info Bar */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.md,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: tokens.color.muted,
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <i className="ri-information-line" style={{ marginRight: 6 }} />
            Changes to sections will be reflected automatically after save
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <i className="ri-layout-line" style={{ marginRight: 6 }} />
            {isMobile ? 'Mobile View (375px)' : isTablet ? 'Tablet View (768px)' : 'Desktop View (100%)'}
          </div>
        </div>
      </div>
    </div>
  );
}

