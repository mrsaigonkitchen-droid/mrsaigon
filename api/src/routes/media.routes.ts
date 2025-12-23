/**
 * Media Routes Module
 * 
 * Handles media asset operations including upload, retrieval, and deletion.
 * Supports image optimization with Sharp and tracks media usage across the system.
 * 
 * **Feature: api-refactoring**
 * **Requirements: 1.1, 1.2, 1.3, 3.5, 6.1, 6.2**
 */

import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { successResponse, errorResponse } from '../utils/response';

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
 * Normalize media URL - extract just the /media/xxx part
 * @param url - Full or relative URL
 * @returns Normalized URL or null
 */
function normalizeMediaUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/media\/[^"'\s?#]+/);
  return match ? match[0] : null;
}

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
    default: return 'application/octet-stream';
  }
}

// ============================================
// MEDIA ROUTES FACTORY
// ============================================

/**
 * Create media routes with dependency injection
 * @param prisma - Prisma client instance
 * @param mediaDir - Directory path for media storage
 * @returns Hono app with media routes
 */
export function createMediaRoutes(prisma: PrismaClient, mediaDir?: string) {
  const app = new Hono();
  const { authenticate, requireRole } = createAuthMiddleware(prisma);
  
  // Resolve media directory
  const resolvedMediaDir = mediaDir || path.resolve(process.cwd(), process.env.MEDIA_DIR || '.media');
  if (!fs.existsSync(resolvedMediaDir)) {
    fs.mkdirSync(resolvedMediaDir, { recursive: true });
  }


  // ============================================
  // MEDIA LIST & UPLOAD ROUTES
  // ============================================

  /**
   * @route GET /media
   * @description Get all media assets
   * @access Admin, Manager
   */
  app.get('/', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      const media = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return successResponse(c, media);
    } catch (error) {
      console.error('Get media error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get media', 500);
    }
  });

  /**
   * @route POST /media
   * @description Upload a new media file (images are optimized to WebP)
   * @access Admin, Manager
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
      if (mimeType.startsWith('image/')) {
        const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        const metadata = await sharp(buffer).metadata();
        const filename = `${id}.webp`;
        
        fs.writeFileSync(path.join(resolvedMediaDir, filename), optimized);
        
        const asset = await prisma.mediaAsset.create({
          data: {
            id,
            url: `/media/${filename}`,
            mimeType: 'image/webp',
            width: metadata.width || null,
            height: metadata.height || null,
            size: optimized.length,
          },
        });
        
        return successResponse(c, asset, 201);
      }

      // Non-image files
      const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
      const filename = `${id}.${ext}`;
      
      fs.writeFileSync(path.join(resolvedMediaDir, filename), buffer);
      
      const asset = await prisma.mediaAsset.create({
        data: {
          id,
          url: `/media/${filename}`,
          mimeType,
          size: buffer.length,
        },
      });
      
      return successResponse(c, asset, 201);
    } catch (error) {
      console.error('Upload error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Upload failed', 500);
    }
  });

  /**
   * @route POST /media/user-upload
   * @description Upload a file for authenticated users (contractors, homeowners)
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
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (buffer.length > MAX_FILE_SIZE) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File size exceeds 10MB limit', 400);
      }

      const id = crypto.randomUUID();
      const mimeType = file.type || 'application/octet-stream';

      // Optimize images to WebP
      if (mimeType.startsWith('image/')) {
        const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        const metadata = await sharp(buffer).metadata();
        const filename = `${id}.webp`;
        
        fs.writeFileSync(path.join(resolvedMediaDir, filename), optimized);
        
        const asset = await prisma.mediaAsset.create({
          data: {
            id,
            url: `/media/${filename}`,
            mimeType: 'image/webp',
            width: metadata.width || null,
            height: metadata.height || null,
            size: optimized.length,
          },
        });
        
        return successResponse(c, asset, 201);
      }

      // Non-image files (PDF, DOC, etc.)
      const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
      if (!allowedExtensions.includes(ext)) {
        return errorResponse(c, 'VALIDATION_ERROR', 'File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT', 400);
      }
      
      const filename = `${id}.${ext}`;
      
      fs.writeFileSync(path.join(resolvedMediaDir, filename), buffer);
      
      const asset = await prisma.mediaAsset.create({
        data: {
          id,
          url: `/media/${filename}`,
          mimeType,
          size: buffer.length,
        },
      });
      
      return successResponse(c, asset, 201);
    } catch (error) {
      console.error('User upload error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Upload failed', 500);
    }
  });

  // ============================================
  // MEDIA SYNC & USAGE ROUTES
  // ============================================

  /**
   * @route POST /media/sync
   * @description Sync media - scan all images in DB and create MediaAsset if not exists
   * @access Admin only
   */
  app.post('/sync', authenticate(), requireRole('ADMIN'), async (c) => {
    try {
      const allUrls = new Set<string>();

      // Collect URLs from Materials
      const materials = await prisma.material.findMany({
        where: { imageUrl: { not: null } },
        select: { imageUrl: true },
      });
      materials.forEach((m) => {
        const url = normalizeMediaUrl(m.imageUrl);
        if (url) allUrls.add(url);
      });

      // Collect URLs from Blog Posts
      const blogPosts = await prisma.blogPost.findMany({
        where: { featuredImage: { not: null } },
        select: { featuredImage: true },
      });
      blogPosts.forEach((b) => {
        const url = normalizeMediaUrl(b.featuredImage);
        if (url) allUrls.add(url);
      });

      // Collect URLs from Sections
      const sections = await prisma.section.findMany();
      sections.forEach((s) => {
        const dataStr = typeof s.data === 'string' ? s.data : JSON.stringify(s.data);
        const urlMatches = dataStr.match(/\/media\/[^"'\s?#]+/g) || [];
        urlMatches.forEach((url) => allUrls.add(url));
      });

      // Get existing media URLs
      const existingMedia = await prisma.mediaAsset.findMany({ select: { url: true } });
      const existingUrls = new Set(
        existingMedia.map((m) => normalizeMediaUrl(m.url)).filter(Boolean)
      );

      // Find missing URLs and create MediaAsset
      const missingUrls = [...allUrls].filter((url) => !existingUrls.has(url));
      let created = 0;

      for (const url of missingUrls) {
        const filename = url.replace('/media/', '');
        const filePath = path.join(resolvedMediaDir, filename);

        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          let width: number | null = null;
          let height: number | null = null;

          try {
            const metadata = await sharp(filePath).metadata();
            width = metadata.width || null;
            height = metadata.height || null;
          } catch {
            // Not an image or can't read metadata
          }

          await prisma.mediaAsset.create({
            data: {
              url,
              alt: filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
              mimeType: getMimeType(filename),
              width,
              height,
              size: stats.size,
            },
          });
          created++;
        }
      }

      return successResponse(c, {
        message: `Synced ${created} new media files`,
        totalFound: allUrls.size,
        alreadyExists: existingUrls.size,
        created,
      });
    } catch (error) {
      console.error('Media sync error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to sync media', 500);
    }
  });


  /**
   * @route GET /media/usage
   * @description Track where images are used across the system
   * @access Admin, Manager
   */
  app.get('/usage', authenticate(), requireRole('ADMIN', 'MANAGER'), async (c) => {
    try {
      // Get all media
      const allMedia = await prisma.mediaAsset.findMany();

      // ============================================
      // COLLECT URLS BY CATEGORY
      // ============================================
      
      // Blog posts with featured images
      const blogPosts = await prisma.blogPost.findMany({
        where: { featuredImage: { not: null } },
        select: { featuredImage: true },
      });
      const blogUrls = new Set(
        blogPosts.map((b) => normalizeMediaUrl(b.featuredImage)).filter(Boolean) as string[]
      );

      // Sections with images in data
      const sections = await prisma.section.findMany();
      const sectionUrls = new Set<string>();
      sections.forEach((s) => {
        const dataStr = typeof s.data === 'string' ? s.data : JSON.stringify(s.data);
        const urlMatches = dataStr.match(/\/media\/[^"'\s?#]+/g) || [];
        urlMatches.forEach((url) => sectionUrls.add(url));
      });

      // ============================================
      // DYNAMIC CATEGORIES FROM INTERIOR & PRICING
      // ============================================
      
      // Dynamic categories structure: { categoryKey: { label, icon, urls } }
      const dynamicCategories: Record<string, { label: string; icon: string; urls: Set<string> }> = {};

      // --- PRICING: Material Categories ---
      const materialCategories = await prisma.materialCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true, icon: true },
      });
      
      for (const cat of materialCategories) {
        const materials = await prisma.material.findMany({
          where: { categoryId: cat.id, imageUrl: { not: null } },
          select: { imageUrl: true },
        });
        
        if (materials.length > 0) {
          const key = `material_${cat.id}`;
          dynamicCategories[key] = {
            label: cat.name,
            icon: cat.icon || 'ri-tools-line',
            urls: new Set(materials.map((m) => normalizeMediaUrl(m.imageUrl)).filter(Boolean) as string[]),
          };
        }
      }

      // --- INTERIOR: Furniture Categories ---
      const furnitureCategories = await prisma.interiorFurnitureCategory.findMany({
        where: { isActive: true, parentId: null }, // Only top-level categories
        select: { id: true, name: true, icon: true },
      });
      
      for (const cat of furnitureCategories) {
        const items = await prisma.interiorFurnitureItem.findMany({
          where: { 
            categoryId: cat.id,
            OR: [
              { thumbnail: { not: null } },
              { images: { not: null } },
            ],
          },
          select: { thumbnail: true, images: true },
        });
        
        const urls = new Set<string>();
        items.forEach((item) => {
          if (item.thumbnail) {
            const url = normalizeMediaUrl(item.thumbnail);
            if (url) urls.add(url);
          }
          if (item.images) {
            try {
              const imgs = JSON.parse(item.images) as string[];
              imgs.forEach((img) => {
                const url = normalizeMediaUrl(img);
                if (url) urls.add(url);
              });
            } catch { /* ignore */ }
          }
        });
        
        if (urls.size > 0) {
          const key = `furniture_${cat.id}`;
          dynamicCategories[key] = {
            label: cat.name,
            icon: cat.icon || 'ri-home-smile-line',
            urls,
          };
        }
      }

      // --- INTERIOR: Developments ---
      const developments = await prisma.interiorDevelopment.findMany({
        select: { id: true, name: true, thumbnail: true, images: true },
      });
      
      const devUrls = new Set<string>();
      developments.forEach((d) => {
        if (d.thumbnail) {
          const url = normalizeMediaUrl(d.thumbnail);
          if (url) devUrls.add(url);
        }
        if (d.images) {
          try {
            const imgs = JSON.parse(d.images) as string[];
            imgs.forEach((img) => {
              const url = normalizeMediaUrl(img);
              if (url) devUrls.add(url);
            });
          } catch { /* ignore */ }
        }
      });
      
      if (devUrls.size > 0) {
        dynamicCategories['interior_developments'] = {
          label: 'Dự án',
          icon: 'ri-building-line',
          urls: devUrls,
        };
      }

      // --- INTERIOR: Buildings ---
      const buildings = await prisma.interiorBuilding.findMany({
        select: { thumbnail: true, floorPlanImage: true },
      });
      
      const buildingUrls = new Set<string>();
      buildings.forEach((b) => {
        if (b.thumbnail) {
          const url = normalizeMediaUrl(b.thumbnail);
          if (url) buildingUrls.add(url);
        }
        if (b.floorPlanImage) {
          const url = normalizeMediaUrl(b.floorPlanImage);
          if (url) buildingUrls.add(url);
        }
      });
      
      if (buildingUrls.size > 0) {
        dynamicCategories['interior_buildings'] = {
          label: 'Tòa nhà',
          icon: 'ri-building-2-line',
          urls: buildingUrls,
        };
      }

      // --- INTERIOR: Layouts ---
      const layouts = await prisma.interiorUnitLayout.findMany({
        select: { layoutImage: true, layout3DImage: true, dimensionImage: true },
      });
      
      const layoutUrls = new Set<string>();
      layouts.forEach((l) => {
        if (l.layoutImage) {
          const url = normalizeMediaUrl(l.layoutImage);
          if (url) layoutUrls.add(url);
        }
        if (l.layout3DImage) {
          const url = normalizeMediaUrl(l.layout3DImage);
          if (url) layoutUrls.add(url);
        }
        if (l.dimensionImage) {
          const url = normalizeMediaUrl(l.dimensionImage);
          if (url) layoutUrls.add(url);
        }
      });
      
      if (layoutUrls.size > 0) {
        dynamicCategories['interior_layouts'] = {
          label: 'Mặt bằng',
          icon: 'ri-layout-masonry-line',
          urls: layoutUrls,
        };
      }

      // --- INTERIOR: Packages ---
      const packages = await prisma.interiorPackage.findMany({
        select: { thumbnail: true, images: true },
      });
      
      const packageUrls = new Set<string>();
      packages.forEach((p) => {
        if (p.thumbnail) {
          const url = normalizeMediaUrl(p.thumbnail);
          if (url) packageUrls.add(url);
        }
        if (p.images) {
          try {
            const imgs = JSON.parse(p.images) as string[];
            imgs.forEach((img) => {
              const url = normalizeMediaUrl(img);
              if (url) packageUrls.add(url);
            });
          } catch { /* ignore */ }
        }
      });
      
      if (packageUrls.size > 0) {
        dynamicCategories['interior_packages'] = {
          label: 'Gói nội thất',
          icon: 'ri-gift-line',
          urls: packageUrls,
        };
      }

      // ============================================
      // CATEGORIZE MEDIA
      // ============================================
      
      const usage: Record<string, { usedIn: string[]; count: number }> = {};

      allMedia.forEach((media) => {
        const normalizedUrl = normalizeMediaUrl(media.url);
        const usedIn: string[] = [];

        if (normalizedUrl && blogUrls.has(normalizedUrl)) {
          usedIn.push('blog');
        }
        if (normalizedUrl && sectionUrls.has(normalizedUrl)) {
          usedIn.push('sections');
        }
        
        // Check dynamic categories
        for (const [key, cat] of Object.entries(dynamicCategories)) {
          if (normalizedUrl && cat.urls.has(normalizedUrl)) {
            usedIn.push(key);
          }
        }

        usage[media.id] = { usedIn, count: usedIn.length };
      });

      // ============================================
      // BUILD RESPONSE
      // ============================================
      
      // Convert dynamic categories to response format (without urls Set)
      const categories: Record<string, { label: string; icon: string; count: number }> = {};
      for (const [key, cat] of Object.entries(dynamicCategories)) {
        categories[key] = {
          label: cat.label,
          icon: cat.icon,
          count: allMedia.filter((m) => usage[m.id]?.usedIn.includes(key)).length,
        };
      }

      return successResponse(c, {
        usage,
        categories, // Dynamic categories with counts
        summary: {
          total: allMedia.length,
          blog: allMedia.filter((m) => usage[m.id]?.usedIn.includes('blog')).length,
          sections: allMedia.filter((m) => usage[m.id]?.usedIn.includes('sections')).length,
          unused: allMedia.filter((m) => usage[m.id]?.count === 0).length,
        },
      });
    } catch (error) {
      console.error('Media usage error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to get media usage', 500);
    }
  });

  // ============================================
  // MEDIA FILE SERVING & DELETE ROUTES
  // ============================================

  /**
   * @route GET /media/:filename
   * @description Serve a media file by filename
   * @access Public
   */
  app.get('/:filename', async (c) => {
    try {
      const filename = c.req.param('filename');
      const filePath = path.join(resolvedMediaDir, filename);

      if (!fs.existsSync(filePath)) {
        return errorResponse(c, 'NOT_FOUND', 'File not found', 404);
      }

      const buf = fs.readFileSync(filePath);
      const contentType = getMimeType(filename);

      return new Response(buf, {
        headers: { 'Content-Type': contentType },
      });
    } catch (error) {
      console.error('Get file error:', error);
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

      // Delete file from disk
      const filename = asset.url.split('/').pop();
      if (!filename) {
        return errorResponse(c, 'INTERNAL_ERROR', 'Invalid media URL format', 500);
      }
      const filePath = path.join(resolvedMediaDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await prisma.mediaAsset.delete({ where: { id } });

      return successResponse(c, { ok: true });
    } catch (error) {
      console.error('Delete media error:', error);
      return errorResponse(c, 'INTERNAL_ERROR', 'Failed to delete media', 500);
    }
  });

  return app;
}

export default { createMediaRoutes };
