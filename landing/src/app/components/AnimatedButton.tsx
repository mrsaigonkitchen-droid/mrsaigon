import { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  href?: string;
}

/**
 * Optimized button with conditional animations
 * Uses CSS transitions for reduced motion preference
 */
export function AnimatedButton({ 
  children, 
  onClick, 
  style, 
  className,
  type = 'button',
  disabled,
  href,
}: AnimatedButtonProps) {
  const shouldReduce = useReducedMotion();

  const baseStyle: CSSProperties = {
    ...style,
    transition: 'all 0.2s ease',
  };

  if (shouldReduce || disabled) {
    // Use regular button/link with CSS transitions only
    const Element = href ? 'a' : 'button';
    return (
      <Element
        onClick={onClick}
        style={baseStyle}
        className={className}
        type={href ? undefined : type}
        disabled={disabled}
        href={href}
      >
        {children}
      </Element>
    );
  }

  // Use motion components for full animations
  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        style={baseStyle}
        className={className}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      style={baseStyle}
      className={className}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

