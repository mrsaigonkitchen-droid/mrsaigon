/**
 * Media Service Module
 *
 * Handles business logic for media asset operations including upload,
 * deletion, and file serving. Uses storage abstraction for cloud compatibility.
 *
 * **Feature: media-gallery-isolation**
 * **Requirements: 1.1, 1.2, 1.3**
 */

import { PrismaClient, MediaAsset } from '@prisma/client';
import sharp from 'sharp';
import { getStorage, getStorageType, IStorage } from './storage';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface UploadFileInput {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
}

export interface UploadResult {
  asset: MediaAsset;
}

// ============================================
// ERROR CLASS
// ============================================

export class MediaServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.name = 'MediaServiceError';
    this.statusCode = statusCode;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get MIME type from file extension
 * @param filename - File name with extension
 * @returns MIME type string
 */
export function getMimeType(filename: string): string {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

// ============================================
// MEDIA SERVICE CLASS
// ============================================

export class MediaService {
  private storage: IStorage;

  constructor(private prisma: PrismaClient) {
    this.storage = getStorage();
  }

  // ============================================
  // MEDIA CRUD OPERATIONS
  // ============================================

  /**
   * Get all media assets
   */
  async getAllMedia(): Promise<MediaAsset[]> {
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a media asset by ID
   */
  async getMediaById(id: string): Promise<MediaAsset | null> {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }

  /**
   * Upload a media file (images are optimized to WebP)
   */
  async uploadMedia(input: UploadFileInput): Promise<UploadResult> {
    const { buffer, mimeType, filename } = input;
    const id = crypto.randomUUID();

    // Optimize images to WebP
    if (mimeType.startsWith('image/') && !mimeType.includes('svg')) {
      const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
      const metadata = await sharp(buffer).metadata();
      const webpFilename = `${id}.webp`;

      // Upload to storage
      const storageFile = await this.storage.upload(webpFilename, optimized, {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000',
        isPublic: true,
        metadata: {
          originalName: filename || 'unknown',
          width: String(metadata.width || 0),
          height: String(metadata.height || 0),
        },
      });

      const asset = await this.prisma.mediaAsset.create({
        data: {
          id,
          url: storageFile.url,
          mimeType: 'image/webp',
          width: metadata.width || null,
          height: metadata.height || null,
          size: optimized.length,
        },
      });

      return { asset };
    }

    // Non-image files (or SVG)
    const ext = (filename?.split('.').pop() || 'bin').toLowerCase();
    const savedFilename = `${id}.${ext}`;

    // Upload to storage
    const storageFile = await this.storage.upload(savedFilename, buffer, {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000',
      isPublic: true,
      metadata: {
        originalName: filename || 'unknown',
      },
    });

    const asset = await this.prisma.mediaAsset.create({
      data: {
        id,
        url: storageFile.url,
        mimeType,
        size: buffer.length,
      },
    });

    return { asset };
  }

  /**
   * Delete a media asset by ID
   * @throws MediaServiceError if asset not found
   */
  async deleteMedia(id: string): Promise<void> {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      throw new MediaServiceError('NOT_FOUND', 'Media asset not found', 404);
    }

    // Extract filename from URL
    const filename = this.extractFilenameFromUrl(asset.url);
    
    if (filename) {
      // Delete file from storage
      await this.storage.delete(filename);
    }

    // Delete from database
    await this.prisma.mediaAsset.delete({ where: { id } });
  }

  /**
   * Extract filename from URL
   */
  private extractFilenameFromUrl(url: string): string | null {
    try {
      // Handle both relative and absolute URLs
      if (url.startsWith('/media/')) {
        return url.replace('/media/', '');
      }
      
      // For absolute URLs (S3/R2), extract the key
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Remove leading slash and bucket name if present
      const parts = pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || null;
    } catch {
      // If URL parsing fails, try simple extraction
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    }
  }

  // ============================================
  // FILE SERVING
  // ============================================

  /**
   * Get file buffer and content type by filename
   * @throws MediaServiceError if file not found
   */
  async getFile(filename: string): Promise<{ buffer: Buffer; contentType: string }> {
    const buffer = await this.storage.download(filename);

    if (!buffer) {
      throw new MediaServiceError('NOT_FOUND', 'File not found', 404);
    }

    const contentType = getMimeType(filename);

    return { buffer, contentType };
  }

  /**
   * Check if file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    return this.storage.exists(filename);
  }

  /**
   * Get public URL for a file
   */
  getFileUrl(filename: string): string {
    return this.storage.getUrl(filename);
  }

  /**
   * Get storage type (for debugging/info)
   */
  getStorageType(): 'local' | 's3' | 'r2' {
    return getStorageType();
  }
}
