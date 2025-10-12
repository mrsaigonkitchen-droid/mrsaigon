/**
 * Convert relative media URLs to absolute URLs
 * @param url - Image URL (can be relative /media/xxx or absolute http://...)
 * @returns Absolute URL ready for use in src/background-image
 */
export function toAbsoluteUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative media path - prepend API URL
  if (url.startsWith('/media/')) {
    const API_URL = 'http://localhost:4202';
    return `${API_URL}${url}`;
  }
  
  // Other relative paths (shouldn't happen, but handle it)
  if (url.startsWith('/')) {
    const API_URL = 'http://localhost:4202';
    return `${API_URL}${url}`;
  }
  
  // Return as-is for other cases
  return url;
}

/**
 * Fix image URL in section data object
 * Recursively processes objects and arrays to convert all image URLs
 */
export function fixSectionImageUrls<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => fixSectionImageUrls(item)) as T;
  }
  
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    // Convert known image URL fields
    if ((key === 'imageUrl' || key === 'url' || key === 'backgroundUrl') && typeof value === 'string') {
      result[key] = toAbsoluteUrl(value);
    }
    // Recursively process nested objects/arrays
    else if (value && typeof value === 'object') {
      result[key] = fixSectionImageUrls(value);
    }
    // Keep other values as-is
    else {
      result[key] = value;
    }
  }
  
  return result as T;
}

