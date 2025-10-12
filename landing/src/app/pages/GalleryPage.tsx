import { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryAPI } from '../api';
import { OptimizedImage } from '../components/OptimizedImage';
import { AnimatedButton } from '../components/AnimatedButton';
import { useReducedMotion } from '../utils/useReducedMotion';

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  tags: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

const ITEMS_PER_PAGE = 12; // Show 12 images per page

export const GalleryPage = memo(function GalleryPage() {
  const shouldReduce = useReducedMotion();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await galleryAPI.getImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Parse tags (memoized to avoid recalculation)
  const allTags = useMemo(() => Array.from(
    new Set(
      images.flatMap(img => 
        img.tags ? img.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      )
    )
  ), [images]);

  // Filter images by tag (memoized)
  const filteredImages = useMemo(() => 
    selectedTag === 'all'
      ? images
      : images.filter(img => 
          img.tags?.split(',').map(t => t.trim()).includes(selectedTag)
        ),
    [images, selectedTag]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

  // Reset to page 1 when tag changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag]);

  // Fix image URL
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:4202${url}`;
  };

  // Lightbox navigation
  const openLightbox = (image: GalleryImage, index: number) => {
    setLightboxImage(image);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const nextImage = () => {
    const nextIndex = (lightboxIndex + 1) % filteredImages.length;
    setLightboxIndex(nextIndex);
    setLightboxImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    setLightboxIndex(prevIndex);
    setLightboxImage(filteredImages[prevIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, lightboxIndex]);

  return (
    <section style={{ 
      minHeight: '100vh',
      background: 'transparent',
      paddingTop: 80
    }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          background: 'radial-gradient(1000px 400px at 50% 0%, rgba(245,211,147,0.08) 0%, transparent 70%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 'clamp(80px, 14vh, 120px)',
          paddingBottom: 'clamp(80px, 14vh, 120px)',
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-block',
              marginBottom: 20,
              padding: '12px 24px',
              background: 'rgba(245,211,147,0.1)',
              border: '1px solid rgba(245,211,147,0.2)',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              color: '#F5D393',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            <i className="ri-gallery-line" style={{ marginRight: 8 }} />
            Gallery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontFamily: 'Playfair Display, serif',
              color: '#F5D393',
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            Thư Viện Hình Ảnh
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Khám phá không gian và món ăn đặc sắc của chúng tôi
          </motion.p>
        </div>
      </motion.div>

      {/* Tag Filters */}
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto', 
        padding: '48px 24px 0'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: 'flex', 
            gap: 12, 
            justifyContent: 'center', 
            marginBottom: 48, 
            flexWrap: 'wrap',
          }}
        >
          <AnimatedButton
            onClick={() => setSelectedTag('all')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: selectedTag === 'all'
                ? 'linear-gradient(135deg, #F5D393, #EFB679)' 
                : 'rgba(255,255,255,0.05)',
              color: selectedTag === 'all' ? '#111' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Tất cả ({images.length})
          </AnimatedButton>

          {allTags.map((tag) => {
            const count = images.filter(i => i.tags?.includes(tag)).length;
            const isActive = selectedTag === tag;

            return (
              <AnimatedButton
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive 
                    ? 'linear-gradient(135deg, #F5D393, #EFB679)' 
                    : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#111' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {tag} ({count})
              </AnimatedButton>
            );
          })}
        </motion.div>

        {/* Gallery Grid - Masonry Style */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 0',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: '3px solid rgba(245,211,147,0.2)',
              borderTopColor: '#F5D393',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p>Đang tải hình ảnh...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 0',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <i className="ri-gallery-line" style={{ fontSize: 64, marginBottom: 16, display: 'block' }} />
            <p style={{ fontSize: 18 }}>Chưa có hình ảnh nào</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
            paddingBottom: 48,
          }}>
            {paginatedImages.map((image, idx) => {
              const CardWrapper = shouldReduce ? 'div' : motion.div;
              const animationProps = shouldReduce ? {} : {
                initial: { opacity: 0, y: 15 },
                animate: { opacity: 1, y: 0 },
                transition: { 
                  duration: 0.35,
                  delay: Math.min(idx * 0.04, 0.4), // Cap delay at 0.4s
                },
              };
              
              return (
              <CardWrapper
                key={image.id}
                {...animationProps}
                onClick={() => openLightbox(image, startIndex + idx)}
                className="gallery-card"
                style={{
                  cursor: 'pointer',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'rgba(12,12,16,0.7)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(245,211,147,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                }}
                >
                  {/* Image */}
                  <div style={{
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <OptimizedImage
                      src={getImageUrl(image.url)}
                      alt={image.alt || 'Gallery image'}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      onMouseEnter={(e) => {
                        const img = e.currentTarget.querySelector('img');
                        if (img) img.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        const img = e.currentTarget.querySelector('img');
                        if (img) img.style.transform = 'scale(1)';
                      }}
                    />

                    {/* Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="gallery-overlay">
                      <i className="ri-zoom-in-line" style={{ 
                        fontSize: 48, 
                        color: '#F5D393',
                      }} />
                    </div>

                    {/* Featured Badge */}
                    {image.isFeatured && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.95), rgba(217,119,6,0.95))',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <i className="ri-star-fill" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  {(image.caption || image.alt) && (
                    <div style={{ padding: 16 }}>
                      {image.alt && (
                        <h3 style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#fff',
                          marginBottom: 4,
                        }}>
                          {image.alt}
                        </h3>
                      )}
                      {image.caption && (
                        <p style={{
                          fontSize: 14,
                          color: 'rgba(255,255,255,0.6)',
                          margin: 0,
                        }}>
                          {image.caption}
                        </p>
                      )}
                    </div>
                  )}
              </CardWrapper>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredImages.length > ITEMS_PER_PAGE && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            marginTop: 60,
            paddingBottom: 100,
          }}>
            {/* Previous Button */}
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: currentPage === 1 
                  ? 'rgba(255,255,255,0.03)' 
                  : 'rgba(255,255,255,0.05)',
                color: currentPage === 1 
                  ? 'rgba(255,255,255,0.3)' 
                  : 'rgba(255,255,255,0.8)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.background = 'rgba(245,211,147,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              <i className="ri-arrow-left-s-line" />
              Trước
            </button>

            {/* Page Numbers */}
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: pageNum === currentPage 
                      ? '2px solid #F5D393' 
                      : '1px solid rgba(255,255,255,0.1)',
                    background: pageNum === currentPage 
                      ? 'linear-gradient(135deg, #F5D393, #EFB679)' 
                      : 'rgba(255,255,255,0.05)',
                    color: pageNum === currentPage ? '#111' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (pageNum !== currentPage) {
                      e.currentTarget.style.background = 'rgba(245,211,147,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(245,211,147,0.4)';
                      e.currentTarget.style.color = '#F5D393';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pageNum !== currentPage) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: currentPage === totalPages 
                  ? 'rgba(255,255,255,0.03)' 
                  : 'rgba(255,255,255,0.05)',
                color: currentPage === totalPages 
                  ? 'rgba(255,255,255,0.3)' 
                  : 'rgba(255,255,255,0.8)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.background = 'rgba(245,211,147,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              Sau
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 9998,
              }}
            />

            {/* Lightbox Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
              }}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeLightbox}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000,
                }}
              >
                <i className="ri-close-line" />
              </motion.button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, x: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    style={{
                      position: 'absolute',
                      left: 20,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontSize: 28,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="ri-arrow-left-s-line" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1, x: 4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    style={{
                      position: 'absolute',
                      right: 20,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontSize: 28,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="ri-arrow-right-s-line" />
                  </motion.button>
                </>
              )}

              {/* Image Container */}
              <div style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
              }}>
                <motion.div
                  key={lightboxImage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(85vh - 100px)',
                    borderRadius: 12,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  <OptimizedImage
                    src={getImageUrl(lightboxImage.url)}
                    alt={lightboxImage.alt || ''}
                    loading="eager"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 'calc(85vh - 100px)',
                      borderRadius: 12,
                    }}
                  />
                </motion.div>

                {/* Info */}
                {(lightboxImage.caption || lightboxImage.alt) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      textAlign: 'center',
                      maxWidth: 600,
                      padding: 20,
                      background: 'rgba(12,12,16,0.8)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {lightboxImage.alt && (
                      <h2 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#F5D393',
                        marginBottom: 8,
                        fontFamily: 'Playfair Display, serif',
                      }}>
                        {lightboxImage.alt}
                      </h2>
                    )}
                    {lightboxImage.caption && (
                      <p style={{
                        fontSize: 16,
                        color: 'rgba(255,255,255,0.7)',
                        margin: 0,
                        lineHeight: 1.6,
                      }}>
                        {lightboxImage.caption}
                      </p>
                    )}
                    <div style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {lightboxIndex + 1} / {filteredImages.length}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSS for hover effect */}
      <style>{`
        .gallery-overlay {
          opacity: 0;
        }
        *:hover > .gallery-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
});
