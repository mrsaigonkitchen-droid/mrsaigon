import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import type { FABActionsData } from '../types';

interface FloatingActionsProps {
  data: FABActionsData;
}

export function FloatingActions({ data }: FloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no actions configured
  if (!data.actions || data.actions.length === 0) return null;

  return (
    <>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 998,
              }}
            />
            
            {/* Actions */}
            {data.actions?.map((action, i) => (
              <motion.a
                key={action.label || i}
                href={action.href}
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: -(i + 1) * 64 }}
                exit={{ scale: 0, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.1, x: -8 }}
                style={{
                  position: 'fixed',
                  right: 20,
                  bottom: 20,
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: action.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 999,
                }}
                title={action.label}
              >
                <i className={action.icon} />
              </motion.a>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: data.mainColor || `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
          color: '#111',
          border: 'none',
          fontSize: 28,
          cursor: 'pointer',
          boxShadow: '0 12px 40px rgba(245,211,147,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i className={isOpen ? 'ri-close-line' : (data.mainIcon || 'ri-customer-service-2-fill')} />
      </motion.button>
    </>
  );
}

