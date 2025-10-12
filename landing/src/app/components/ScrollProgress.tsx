import { motion, useScroll, useSpring, useTransform, MotionValue } from 'framer-motion';
import { tokens } from '@app/shared';
import { useReducedMotion } from '../utils/useReducedMotion';

export function ScrollProgress() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  
  // Much more reduced stiffness and higher damping for fewer updates
  const scaleX = useSpring(scrollYProgress, {
    stiffness: shouldReduce ? 20 : 30,  // Lower = fewer updates
    damping: shouldReduce ? 50 : 45,    // Higher = more damping
    restDelta: 0.02,  // Larger threshold before updating
  });

  return (
    <>
      {/* Top Progress Bar */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${tokens.color.primary}, ${tokens.color.accent})`,
          transformOrigin: '0%',
          scaleX,
          zIndex: 10002,
          boxShadow: '0 0 10px rgba(245,211,147,0.5)',
        }}
      />

      {/* Scroll to Top Button */}
      <ScrollToTop scrollProgress={scrollYProgress} />
    </>
  );
}

function ScrollToTop({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const shouldReduce = useReducedMotion();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Use useTransform with smoother transitions and fewer updates
  const opacity = useTransform(scrollProgress, [0, 0.2, 0.3], [0, 0.7, 1]);
  const scale = shouldReduce 
    ? useTransform(scrollProgress, [0, 0.25], [0, 1])
    : useTransform(scrollProgress, [0, 0.2, 0.3], [0, 0.9, 1]);

  return (
    <motion.button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        left: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(11,12,15,0.95)',
        border: `2px solid ${tokens.color.primary}`,
        color: tokens.color.primary,
        fontSize: 24,
        cursor: 'pointer',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        opacity,
        scale,
        willChange: 'opacity, transform',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Scroll to top"
    >
      <i className="ri-arrow-up-line" />
    </motion.button>
  );
}

