const cache = new Map<string, string>();

export async function resolveMediaUrlById(id?: string): Promise<string | undefined> {
  if (!id) return undefined;
  if (cache.has(id)) return cache.get(id);
  try {
    // Try API: GET /media/:filename is static; we don't know filename, but when admin uploads we store asset.url alongside id in some cases.
    // Fallback: attempt to fetch metadata endpoint if added later; for now, return undefined to avoid blocking UI.
    return undefined;
  } catch {
    return undefined;
  }
}


