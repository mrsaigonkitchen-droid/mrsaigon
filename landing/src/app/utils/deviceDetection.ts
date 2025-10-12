/**
 * Device Detection & Performance Utilities
 * 
 * Provides utilities to detect device capabilities and adjust animations accordingly
 * to improve performance on lower-end devices.
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if device is low-end based on CPU cores
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const cpuCores = navigator.hardwareConcurrency || 2;
  return cpuCores < 4;
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Check if device is tablet
export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

// Check if device should use reduced animations
export const shouldReduceAnimations = (): boolean => {
  return prefersReducedMotion() || isLowEndDevice();
};

// Get appropriate animation duration based on device
export const getAnimationDuration = (base: number): number => {
  if (shouldReduceAnimations()) {
    return base * 0.5; // 50% faster on low-end devices
  }
  return base;
};

// Get appropriate stagger delay based on device
export const getStaggerDelay = (base: number): number => {
  if (shouldReduceAnimations()) {
    return base * 0.5; // Reduce stagger on low-end devices
  }
  if (isMobileDevice()) {
    return base * 0.8; // Slightly faster on mobile
  }
  return base;
};

// Check if parallax should be enabled
export const shouldEnableParallax = (): boolean => {
  return !isMobileDevice() && !shouldReduceAnimations();
};

// Check if backdrop-filter is supported and performant
export const supportsBackdropFilter = (): boolean => {
  if (typeof CSS === 'undefined') return false;
  return CSS.supports('backdrop-filter', 'blur(10px)') && !isLowEndDevice();
};

// Get optimal animation config for device
export const getAnimationConfig = () => {
  const reduced = shouldReduceAnimations();
  const mobile = isMobileDevice();

  return {
    shouldAnimate: !reduced,
    enableParallax: shouldEnableParallax(),
    enableInfiniteAnimations: !reduced && !mobile,
    enableComplexTransitions: !reduced,
    enableHoverEffects: !mobile,
    staggerDelay: getStaggerDelay(0.1),
    transitionDuration: getAnimationDuration(0.3),
  };
};

