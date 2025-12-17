import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  hoverable?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, title, subtitle, icon, actions, hoverable = false, style, onClick, className }: CardProps) {
  const Component = hoverable || onClick ? motion.div : 'div';
  const animationProps = hoverable || onClick
    ? {
        whileHover: { 
          y: -6, 
          boxShadow: '0 16px 48px rgba(245,211,147,0.15)',
          borderColor: 'rgba(245,211,147,0.3)',
        },
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <Component
      {...animationProps}
      onClick={onClick}
      className={className}
      style={{
        background: 'rgba(12,12,16,0.7)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${tokens.color.border}`,
        borderRadius: '20px',
        padding: 28,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {(title || subtitle || icon || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `1px solid ${tokens.color.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {icon && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: '#0b0c0f',
                  boxShadow: '0 4px 16px rgba(245,211,147,0.3)',
                }}
              >
                <i className={icon} />
              </motion.div>
            )}
            <div>
              {title && (
                <h3 style={{ 
                  color: tokens.color.text, 
                  fontSize: 20, 
                  fontWeight: 700, 
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>{title}</h3>
              )}
              {subtitle && (
                <p style={{ 
                  color: tokens.color.muted, 
                  fontSize: 14, 
                  margin: '4px 0 0',
                  fontWeight: 400,
                }}>{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </Component>
  );
}

