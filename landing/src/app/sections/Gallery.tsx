import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { galleryAPI } from '../api';

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  isFeatured: boolean;
  displayOrder: number | null;
  tags: string | null;
}

interface GalleryData {
  title?: string;
  subtitle?: string;
  columns?: number; // 2, 3, or 4 columns, default 3
  limit?: number; // Max images to show, default 12
  showOnlyFeatured?: boolean; // Only show featured images
  filterByTag?: string; // Filter by specific tag
}

export const Gallery = memo(function Gallery({ data }: { data: GalleryData }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const columns = data.columns || 3;
  const limit = data.limit || 12;
  const showOnlyFeatured = data.showOnlyFeatured || false;

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const allImages = await galleryAPI.getImages();
      
      // Filter images
      let filtered = allImages;
      
      if (showOnlyFeatured) {
        filtered = filtered.filter((img: GalleryImage) => img.isFeatured);
      }
      
      if (data.filterByTag) {
        filtered = filtered.filter((img: GalleryImage) => 
          img.tags && img.tags.split(',').map(t => t.trim().toLowerCase()).includes(data.filterByTag!.toLowerCase())
        );
      }
      
      // Sort by display order, then slice
      const sorted = filtered.sort((a: GalleryImage, b: GalleryImage) => 
        (a.displayOrder || 999) - (b.displayOrder || 999)
      );
      
      setImages(sorted.slice(0, limit));
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:4202${url}`;
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 40, color: tokens.color.primary }}
        />
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        padding: '80px 20px',
        background: tokens.color.background,
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        {(data.title || data.subtitle) && (
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            {data.title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  fontSize: tokens.font.size.h2,
                  fontFamily: tokens.font.display,
                  color: tokens.color.primary,
                  marginBottom: 12,
                }}
              >
                {data.title}
              </motion.h2>
            )}
            {data.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: 16,
                  color: tokens.color.muted,
                  maxWidth: 600,
                  margin: '0 auto',
                }}
              >
                {data.subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.05, // Reduced from 0.08
              },
            },
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 4 ? '280px' : columns === 2 ? '450px' : '350px'}, 1fr))`,
            gap: 20,
          }}
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              variants={{
                hidden: { opacity: 0, y: 20 }, // Reduced from y: 30
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }, // Faster duration
              }}
              onClick={() => setSelectedImage(index)}
              onMouseEnter={() => setHoveredImage(index)}
              onMouseLeave={() => setHoveredImage(null)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                overflow: 'hidden',
                borderRadius: tokens.radius.lg,
                cursor: 'pointer',
                border: `2px solid ${hoveredImage === index ? tokens.color.primary : tokens.color.border}`,
                boxShadow: hoveredImage === index ? tokens.shadow.lg : tokens.shadow.sm,
                transition: 'all 0.3s ease',
              }}
            >
              <img
                src={getImageUrl(image.url)}
                alt={image.alt || image.caption || `Gallery image ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  transform: hoveredImage === index ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              
              {/* Hover Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  opacity: hoveredImage === index ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 20,
                }}
              >
                {image.caption && (
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                    {image.caption}
                  </div>
                )}
                {image.tags && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {image.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '3px 8px',
                          background: 'rgba(245, 211, 147, 0.2)',
                          border: `1px solid ${tokens.color.primary}`,
                          borderRadius: tokens.radius.sm,
                          fontSize: 11,
                          color: tokens.color.primary,
                          fontWeight: 600,
                        }}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* View Icon */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: hoveredImage === index ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  color: tokens.color.primary,
                  fontSize: 18,
                }}
              >
                <i className="ri-zoom-in-line" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: tokens.zIndex.modal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, background: tokens.color.error }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: `2px solid ${tokens.color.border}`,
                color: '#fff',
                fontSize: 28,
                width: 56,
                height: 56,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                zIndex: 10,
              }}
            >
              <i className="ri-close-line" />
            </motion.button>

            {/* Image */}
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              src={getImageUrl(images[selectedImage].url)}
              alt={images[selectedImage].alt || images[selectedImage].caption || 'Gallery image'}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                borderRadius: tokens.radius.lg,
                boxShadow: tokens.shadow.lg,
              }}
            />

            {/* Image Info */}
            {(images[selectedImage].caption || images[selectedImage].tags) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: 40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  maxWidth: 600,
                  padding: 24,
                  background: 'rgba(19, 19, 22, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: tokens.radius.lg,
                  border: `1px solid ${tokens.color.border}`,
                  textAlign: 'center',
                }}
              >
                {images[selectedImage].caption && (
                  <div style={{ fontSize: 18, fontWeight: 600, color: tokens.color.primary, marginBottom: 12 }}>
                    {images[selectedImage].caption}
                  </div>
                )}
                {images[selectedImage].tags && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {images[selectedImage].tags!.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(245, 211, 147, 0.15)',
                          border: `1px solid ${tokens.color.primary}`,
                          borderRadius: tokens.radius.pill,
                          fontSize: 13,
                          color: tokens.color.primary,
                          fontWeight: 600,
                        }}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {selectedImage > 0 && (
              <motion.button
                whileHover={{ scale: 1.1, background: tokens.color.primary }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage - 1);
                }}
                style={{
                  position: 'absolute',
                  left: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${tokens.color.border}`,
                  color: '#fff',
                  fontSize: 32,
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <i className="ri-arrow-left-s-line" />
              </motion.button>
            )}

            {selectedImage < images.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.1, background: tokens.color.primary }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage + 1);
                }}
                style={{
                  position: 'absolute',
                  right: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${tokens.color.border}`,
                  color: '#fff',
                  fontSize: 32,
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <i className="ri-arrow-right-s-line" />
              </motion.button>
            )}

            {/* Image Counter */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                left: 24,
                padding: '12px 20px',
                background: 'rgba(19, 19, 22, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: tokens.radius.pill,
                border: `1px solid ${tokens.color.border}`,
                color: tokens.color.text,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {selectedImage + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
});

