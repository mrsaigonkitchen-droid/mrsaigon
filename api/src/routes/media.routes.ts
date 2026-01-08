/**
 * Media Routes Module
 * 
 * Handles media asset operations including upload, retrieval, and deletion.
 * Supports image optimization with Sharp and tracks media usage across the system.
 * Uses content-hash based filenames for CDN cache busting.
 * Uses storage abstraction for cloud compatibility (local, S3, R2).
 * 
 * **Feature: api-refactoring, high-traffic-resilience**
 * **Requirements: 1.1, 1.2, 1.3, 2.3, 3.5, 6.1, 6.2**
 */

import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { successResponse, errorResponse } from '../utils/response';
import { generateContentHashFilename } from '../utils/content-hash';
import { getStorage, getStorageType, IStorage } from '../services/storage';
import { logger } from '../utils/logger';

// ============================================
// TYPES
// ============================================

interface UploadedFile {
  arrayBuffer?: () => Promise<ArrayBuffer>;
  buffer?: ArrayBuffer;
  type?: string;
  name?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get MIME type from file extension
 * @param filename - File name with extension
 * @returns MIME type string
 */
function getMimeType(filename: string): string {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'webp': return 'image/webp';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default: return 'application/octet-stream';
  }
}

// ============================================
// MEDIA ROUTES FACTORY
// ============================================

/**
 * Create media routes with dependency injection
 * @param prisma - Prisma client instance
 * @returns Hono app with media routes
 */
export function createMediaRoutes(prisma: PrismaClient) {
  const app = new Hono();
  const { authenticate, requireRole } = createAuthMiddleware(prisma);
  
  // Get storage instance (auto-selects local/S3/R2 based on env)
  const storage: IStorage = getStorage();
  
  // Log storage type on startup
  logger.info('Media routes initialized', { storageType: getStorageType() });

  // ============================================
  // MEDIA LIST & UPLOAD ROUTES
  // ============================================

  /**
   * @route GET /media
   * @description Get all gallery media assets
   * @access Admin, Manager
   */
  app.get('/', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      const media = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return successResponse(c, media);
    } catch {
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get media', 500);
    }
  });

  /**
   * @route GET /media/storage-info
   * @description Get storage type info (for debugging)
   * @access Admin
   */
  app.get('/storage-info', authenticate(), requireRole('ADMIN'), async (c) => {
    const storageType = getStorageType();
    const isAvailable = await storage.isAvailable();
    return successResponse(c, { 
      storageType, 
      isAvailable,
      isCloudStorage: storageType !== 'local',
    });
  });

  /**
   * @route POST /media
   * @description Upload a new media file for gallery (creates MediaAsset record)
   * @access Admin, Manager
   * 
   * **Feature: high-traffic-resilience**
   * **Requirements: 2.3** - Uses content hash for cache busting
   */
  app.post('/', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body.file as UploadedFile | undefined;
      
      if (!file) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File is required', 400);
      }

      // Get buffer from file
      let buffer: Buffer;
      if (file.arrayBuffer) {
        buffer = Buffer.from(await file.arrayBuffer());
      } else if (Buffer.isBuffer(file)) {
        buffer = file;
      } else if (file.buffer) {
        buffer = Buffer.from(file.buffer);
      } else {
        return errorResponse(c, 'VALIDATION_ERROR', 'Unsupported file format', 400);
      }

      const id = crypto.randomUUID();
      const mimeType = file.type || 'application/octet-stream';

      // Optimize images to WebP
      if (mimeType.startsWith('image/') && !mimeType.includes('svg')) {
        const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        const metadata = await sharp(buffer).metadata();
        
        // Generate content-hash based filename for cache busting
        const { filename } = generateContentHashFilename(optimized, {
          mimeType: 'image/webp',
          originalFilename: file.name,
        });
        
        // Upload to storage
        const storageFile = await storage.upload(filename, optimized, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
          isPublic: true,
          metadata: {
            originalName: file.name || 'unknown',
            width: String(metadata.width || 0),
            height: String(metadata.height || 0),
          },
        });
        
        const asset = await prisma.mediaAsset.create({
          data: {
            id,
            url: storageFile.url,
            mimeType: 'image/webp',
            width: metadata.width || null,
            height: metadata.height || null,
            size: optimized.length,
          },
        });
        
        return successResponse(c, asset, 201);
      }

      // Non-image files - use content hash
      const { filename } = generateContentHashFilename(buffer, {
        mimeType,
        originalFilename: file.name,
      });
      
      // Upload to storage
      const storageFile = await storage.upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
        isPublic: true,
        metadata: {
          originalName: file.name || 'unknown',
        },
      });
      
      const asset = await prisma.mediaAsset.create({
        data: {
          id,
          url: storageFile.url,
          mimeType,
          size: buffer.length,
        },
      });
      
      return successResponse(c, asset, 201);
    } catch (error) {
      logger.error('Upload failed', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Upload failed', 500);
    }
  });

  /**
   * @route POST /media/upload-file
   * @description Upload file only (NO MediaAsset record) - for furniture, materials, etc.
   * @access Admin, Manager
   */
  app.post('/upload-file', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body.file as UploadedFile | undefined;
      
      if (!file) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File is required', 400);
      }

      // Get buffer from file
      let buffer: Buffer;
      if (file.arrayBuffer) {
        buffer = Buffer.from(await file.arrayBuffer());
      } else if (Buffer.isBuffer(file)) {
        buffer = file;
      } else if (file.buffer) {
        buffer = Buffer.from(file.buffer);
      } else {
        return errorResponse(c, 'VALIDATION_ERROR', 'Unsupported file format', 400);
      }

      const mimeType = file.type || 'application/octet-stream';

      // Optimize images to WebP
      if (mimeType.startsWith('image/') && !mimeType.includes('svg')) {
        const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        const metadata = await sharp(buffer).metadata();
        
        const { filename } = generateContentHashFilename(optimized, {
          mimeType: 'image/webp',
          originalFilename: file.name,
        });
        
        const storageFile = await storage.upload(filename, optimized, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
          isPublic: true,
        });
        
        return successResponse(c, {
          url: storageFile.url,
          mimeType: 'image/webp',
          width: metadata.width || null,
          height: metadata.height || null,
          size: optimized.length,
        }, 201);
      }

      // Non-image files
      const { filename } = generateContentHashFilename(buffer, {
        mimeType,
        originalFilename: file.name,
      });
      
      const storageFile = await storage.upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
        isPublic: true,
      });
      
      return successResponse(c, {
        url: storageFile.url,
        mimeType,
        size: buffer.length,
      }, 201);
    } catch (error) {
      logger.error('Upload file failed', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Upload failed', 500);
    }
  });

  /**
   * @route POST /media/user-upload
   * @description Upload a file for authenticated users (NO MediaAsset record)
   * @access Authenticated users (CONTRACTOR, HOMEOWNER, ADMIN, MANAGER)
   */
  app.post('/user-upload', authenticate(), async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body.file as UploadedFile | undefined;
      
      if (!file) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File is required', 400);
      }

      // Get buffer from file
      let buffer: Buffer;
      if (file.arrayBuffer) {
        buffer = Buffer.from(await file.arrayBuffer());
      } else if (Buffer.isBuffer(file)) {
        buffer = file;
      } else if (file.buffer) {
        buffer = Buffer.from(file.buffer);
      } else {
        return errorResponse(c, 'VALIDATION_ERROR', 'Unsupported file format', 400);
      }

      // Limit file size to 10MB for user uploads
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (buffer.length > MAX_FILE_SIZE) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File size exceeds 10MB limit', 400);
      }

      const id = crypto.randomUUID();
      const mimeType = file.type || 'application/octet-stream';

      // Optimize images to WebP
      if (mimeType.startsWith('image/') && !mimeType.includes('svg')) {
        const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        const metadata = await sharp(buffer).metadata();
        const filename = `${id}.webp`;
        
        const storageFile = await storage.upload(filename, optimized, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
          isPublic: true,
        });
        
        return successResponse(c, {
          url: storageFile.url,
          mimeType: 'image/webp',
          width: metadata.width || null,
          height: metadata.height || null,
          size: optimized.length,
        }, 201);
      }

      // Non-image files (PDF, DOC, etc.)
      const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
      if (!allowedExtensions.includes(ext)) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT', 400);
      }
      
      const filename = `${id}.${ext}`;
      
      const storageFile = await storage.upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
        isPublic: true,
      });
      
      return successResponse(c, {
        url: storageFile.url,
        mimeType,
        size: buffer.length,
      }, 201);
    } catch (error) {
      logger.error('User upload failed', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Upload failed', 500);
    }
  });

  // ============================================
  // MEDIA METADATA UPDATE ROUTE
  // ============================================

  /**
   * @route PUT /media/:id
   * @description Update media metadata (alt, caption, tags, isFeatured)
   * @access Admin, Manager
   */
  app.put('/:id', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      
      const asset = await prisma.mediaAsset.findUnique({ where: { id } });
      if (!asset) {
        return errorResponse(c, 'NOT_FOUND', 'Media asset not found', 404);
      }

      const updated = await prisma.mediaAsset.update({
        where: { id },
        data: {
          alt: body.alt !== undefined ? body.alt : asset.alt,
          caption: body.caption !== undefined ? body.caption : asset.caption,
          tags: body.tags !== undefined ? body.tags : asset.tags,
          isFeatured: body.isFeatured !== undefined ? body.isFeatured : asset.isFeatured,
          isActive: body.isActive !== undefined ? body.isActive : asset.isActive,
          displayOrder: body.displayOrder !== undefined ? body.displayOrder : asset.displayOrder,
        },
      });

      return successResponse(c, updated);
    } catch (error) {
      logger.error('Update media error', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to update media', 500);
    }
  });

  // ============================================
  // FEATURED & GALLERY ROUTES (for landing page sections)
  // ============================================

  /**
   * @route GET /media/featured
   * @description Get all featured media for slideshow (public)
   * @access Public
   */
  app.get('/featured', async (c) => {
    try {
      const featured = await prisma.mediaAsset.findMany({
        where: { isFeatured: true, isActive: true },
        orderBy: { displayOrder: 'asc' },
      });
      return successResponse(c, featured);
    } catch (error) {
      logger.error('Get featured error', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get featured media', 500);
    }
  });

  /**
   * @route GET /media/gallery
   * @description Get all media for gallery with pagination (public)
   * @access Public
   */
  app.get('/gallery', async (c) => {
    try {
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '12');
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.mediaAsset.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.mediaAsset.count({ where: { isActive: true } }),
      ]);

      return successResponse(c, {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Get gallery error', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get gallery', 500);
    }
  });

  // ============================================
  // MEDIA FILE SERVING & DELETE ROUTES
  // ============================================

  /**
   * @route GET /media/:filename
   * @description Serve a media file by filename
   * @access Public
   * 
   * Note: In production with S3/R2, files are served directly from CDN.
   * This route is mainly for local development or fallback.
   */
  app.get('/:filename', async (c) => {
    try {
      const filename = c.req.param('filename');
      
      // Download from storage
      const buffer = await storage.download(filename);

      if (!buffer) {
        return errorResponse(c, 'NOT_FOUND', 'File not found', 404);
      }

      const contentType = getMimeType(filename);

      return new Response(new Uint8Array(buffer), {
        headers: { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (error) {
      logger.error('Get file error', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get file', 500);
    }
  });

  /**
   * @route DELETE /media/:id
   * @description Delete a media asset by ID
   * @access Admin, Manager
   */
  app.delete('/:id', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      const id = c.req.param('id');
      const asset = await prisma.mediaAsset.findUnique({ where: { id } });

      if (!asset) {
        return errorResponse(c, 'NOT_FOUND', 'Media asset not found', 404);
      }

      // Extract filename from URL
      const filename = extractFilenameFromUrl(asset.url);
      
      if (filename) {
        // Delete file from storage
        await storage.delete(filename);
      }

      // Delete from database
      await prisma.mediaAsset.delete({ where: { id } });

      return successResponse(c, { ok: true });
    } catch (error) {
      logger.error('Delete media error', { error: error instanceof Error ? error.message : 'Unknown' });
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to delete media', 500);
    }
  });

  return app;
}

/**
 * Extract filename from URL (handles both local and cloud URLs)
 */
function extractFilenameFromUrl(url: string): string | null {
  try {
    // Handle relative URLs (/media/filename.webp)
    if (url.startsWith('/media/')) {
      return url.replace('/media/', '');
    }
    
    // Handle absolute URLs (https://storage.googleapis.com/bucket/filename.webp)
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Get the last part of the path
    const parts = pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    // If URL parsing fails, try simple extraction
    const parts = url.split('/');
    return parts[parts.length - 1] || null;
  }
}

export default { createMediaRoutes };
