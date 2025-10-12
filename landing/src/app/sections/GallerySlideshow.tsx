import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { OptimizedImage } from '../components/OptimizedImage';
import { galleryAPI } from '../api';

interface GallerySlideshowData {
  title?: string;
  subtitle?: string;
  autoPlayInterval?: number; // milliseconds, default 5000
  showControls?: boolean; // default true
  showIndicators?: boolean; // default true
  limit?: number; // max images to show, default 10
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  isFeatured: boolean;
}

export function GallerySlideshow({ data }: { data: GallerySlideshowData }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const autoPlayInterval = data.autoPlayInterval || 5000;
  const showControls = data.showControls !== false;
  const showIndicators = data.showIndicators !== false;
  const limit = data.limit || 10;

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const allImages = await galleryAPI.getImages();
      // Filter featured or take first N images
      const featured = allImages.filter((img: GalleryImage) => img.isFeatured);
      const selected = featured.length > 0 ? featured : allImages;
      setImages(selected.slice(0, limit));
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play slideshow
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [images.length, autoPlayInterval, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
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
        margin: '60px 0',
        padding: '0 16px',
      }}
    >
      {/* Section Header */}
      {(data.title || data.subtitle) && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
                color: tokens.color.muted,
                maxWidth: 600,
                margin: '0 auto',
                fontSize: 16,
              }}
            >
              {data.subtitle}
            </motion.p>
          )}
        </div>
      )}

      {/* Slideshow Container */}
      <div
        style={{
          position: 'relative',
          maxWidth: 1200,
          margin: '0 auto',
          borderRadius: tokens.radius.xl,
          overflow: 'hidden',
          background: 'rgba(12,12,16,0.5)',
          border: `1px solid ${tokens.color.border}`,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Images */}
        <div style={{ position: 'relative', aspectRatio: '16/9' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <OptimizedImage
                src={getImageUrl(images[currentIndex].url)}
                alt={images[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Caption Overlay */}
              {images[currentIndex].caption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '24px 32px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    color: '#fff',
                    fontSize: 18,
                    textAlign: 'center',
                  }}
                >
                  {images[currentIndex].caption}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        {showControls && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <i className="ri-arrow-left-s-line" />
            </button>

            <button
              onClick={goToNext}
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <i className="ri-arrow-right-s-line" />
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: tokens.radius.pill,
              zIndex: 10,
            }}
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: currentIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: tokens.radius.pill,
                  background: currentIndex === index
                    ? tokens.color.primary
                    : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

