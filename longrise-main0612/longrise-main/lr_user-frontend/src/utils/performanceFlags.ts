/**
 * Performance flags utility for Longrise Frontend
 * Controls animation and performance-intensive features based on environment
 */

export interface PerformanceConfig {
  enableAnimations: boolean;
  enableCanvasAnimations: boolean;
  enableCSSAnimations: boolean;
  enableRealtimeUpdates: boolean;
  enableBlurEffects: boolean;
  particleMultiplier: number;
}

/**
 * Detects if running in local development environment
 */
export const isLocalDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const isDev = import.meta.env.DEV;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  return isLocalHost && isDev;
};

/**
 * Gets performance mode from environment variables
 */
export const getPerformanceMode = (): 'auto' | 'development' | 'production' => {
  const mode = import.meta.env.VITE_PERFORMANCE_MODE;

  if (mode === 'development' || mode === 'production') {
    return mode;
  }

  return 'auto';
};

/**
 * Determines if animations should be enabled based on current environment
 */
export const shouldEnableAnimations = (): boolean => {
  const mode = getPerformanceMode();
  const forceLocalDevMode = import.meta.env.VITE_LOCAL_DEV_MODE === 'true';
  const globalAnimationsFlag = import.meta.env.VITE_ENABLE_ANIMATIONS !== 'false';

  // Force disable if LOCAL_DEV_MODE is explicitly set to true
  if (forceLocalDevMode) {
    return false;
  }

  switch (mode) {
    case 'development':
      return false; // Always disable in development mode
    case 'production':
      return globalAnimationsFlag; // Follow global flag in production
    case 'auto':
    default:
      // Auto mode: disable if local development, otherwise follow global flag
      return isLocalDevelopment() ? false : globalAnimationsFlag;
  }
};

/**
 * Gets the performance configuration object
 */
export const getPerformanceConfig = (): PerformanceConfig => {
  const animationsEnabled = shouldEnableAnimations();
  const particleMultiplier = parseFloat(import.meta.env.VITE_PARTICLE_COUNT_MULTIPLIER || '1');

  return {
    enableAnimations: animationsEnabled,
    enableCanvasAnimations: animationsEnabled && import.meta.env.VITE_ENABLE_CANVAS_ANIMATIONS !== 'false',
    enableCSSAnimations: animationsEnabled && import.meta.env.VITE_ENABLE_CSS_ANIMATIONS !== 'false',
    enableRealtimeUpdates: animationsEnabled && import.meta.env.VITE_ENABLE_REALTIME_UPDATES !== 'false',
    enableBlurEffects: animationsEnabled && import.meta.env.VITE_ENABLE_BLUR_EFFECTS !== 'false',
    particleMultiplier: Math.max(0.1, Math.min(particleMultiplier, 2.0)), // Clamp between 0.1 and 2.0
  };
};

/**
 * Hook-like function for components to check performance settings
 */
export const usePerformanceMode = () => {
  return getPerformanceConfig();
};

/**
 * Debug utility to log current performance configuration
 */
export const logPerformanceConfig = (): void => {
  if (import.meta.env.DEV) {
    const config = getPerformanceConfig();
    const mode = getPerformanceMode();
    const isLocal = isLocalDevelopment();

    console.group('🚀 Performance Configuration');
    console.log('Mode:', mode);
    console.log('Is Local Development:', isLocal);
    console.log('Config:', config);
    console.groupEnd();
  }
};

// Initialize performance config logging in development
if (import.meta.env.DEV) {
  // Delay to ensure DOM is ready
  setTimeout(logPerformanceConfig, 1000);
}