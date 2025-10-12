import React, { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconRight?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  type = 'button',
  className,
}: ButtonProps) {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
      color: '#0b0c0f',
      border: 'none',
      boxShadow: '0 4px 16px rgba(245,211,147,0.3)',
    },
    secondary: {
      background: 'rgba(12,12,16,0.6)',
      backdropFilter: 'blur(10px)',
      color: tokens.color.text,
      border: `1px solid ${tokens.color.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
    danger: {
      background: `linear-gradient(135deg, ${tokens.color.error}, #dc2626)`,
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
    },
    ghost: {
      background: 'transparent',
      color: tokens.color.text,
      border: 'none',
      boxShadow: 'none',
    },
    outline: {
      background: 'transparent',
      color: tokens.color.text,
      border: `1px solid ${tokens.color.border}`,
      boxShadow: 'none',
    },
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: 13 },
    medium: { padding: '12px 24px', fontSize: 14 },
    large: { padding: '16px 32px', fontSize: 16 },
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <motion.button
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && !loading && onClick) {
          onClick(e);
        }
      }}
      disabled={disabled || loading}
      className={className}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: '12px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled || loading ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {loading && (
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {!loading && icon && <i className={icon} />}
      {children}
      {!loading && iconRight && <i className={iconRight} />}
    </motion.button>
  );
}

