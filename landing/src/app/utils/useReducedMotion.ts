import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Also disables complex animations on low-end devices
 */
export function useReducedMotion(): boolean {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    // Check user preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduce(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setShouldReduce(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return shouldReduce;
}

/**
 * Get optimized animation config based on device capabilities
 */
export function getAnimationConfig(shouldReduce: boolean) {
  if (shouldReduce) {
    return {
      initial: {},
      animate: {},
      transition: { duration: 0 },
      whileHover: {},
      whileTap: {},
      whileInView: {},
    };
  }

  return {
    // Allow normal animations
    transition: { duration: 0.3, ease: 'easeOut' as const },
  };
}

/**
 * Throttle animation updates for better performance
 */
export function useThrottledScroll(callback: () => void, delay = 100) {
  useEffect(() => {
    let lastRun = 0;
    let timeout: NodeJS.Timeout;

    const handler = () => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun;

      if (timeSinceLastRun >= delay) {
        callback();
        lastRun = now;
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          callback();
          lastRun = Date.now();
        }, delay - timeSinceLastRun);
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      clearTimeout(timeout);
    };
  }, [callback, delay]);
}

