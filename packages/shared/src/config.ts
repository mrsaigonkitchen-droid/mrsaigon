/**
 * Centralized configuration module for MrSaiGon
 *
 * IMPORTANT: Vite's `define` option in vite.config.ts replaces
 * `import.meta.env.VITE_*` at BUILD TIME. This file is designed
 * to work with that replacement mechanism.
 *
 * @example
 * import { API_URL, getApiUrl } from '@app/shared';
 */

// ============================================
// BUILD-TIME CONSTANTS
// ============================================
// These are replaced by Vite's `define` option at build time.
// The `define` in vite.config.ts sets:
//   'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
//
// So `import.meta.env.VITE_API_URL` becomes the actual string value.

/**
 * API URL - replaced at build time by Vite
 * Falls back to localhost for development
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:4202';

/**
 * Get API URL (function form for compatibility)
 * @returns API base URL without trailing slash
 */
export function getApiUrl(): string {
  return API_URL.replace(/\/$/, '');
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return !isProduction();
}
