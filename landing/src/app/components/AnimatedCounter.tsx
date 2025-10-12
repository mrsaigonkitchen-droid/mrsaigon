import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
  style,
}: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, {
        duration,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [inView, count, to, duration]);

  return (
    <motion.span ref={ref} style={style}>
      {rounded}
    </motion.span>
  );
}

// Stat Card with Counter
export function StatCard({
  icon,
  value,
  label,
  suffix = '',
  prefix = '',
  color = '#F5D393',
}: {
  icon: string;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  color?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '32px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: `radial-gradient(circle, ${color}20, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        style={{
          fontSize: 48,
          color,
          marginBottom: 16,
        }}
      >
        <i className={icon} />
      </motion.div>

      {/* Counter */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 8,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <AnimatedCounter to={value} suffix={suffix} prefix={prefix} duration={2.5} />
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}


