/**
 * FeaturedMenu Section
 * Elegant featured menu showcase with luxury styling
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens, API_URL, resolveMediaUrl } from '@app/shared';
import { glassEffect } from '../styles/glassEffect';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isSpecial: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
}

interface FeaturedMenuData {
  title?: string;
  subtitle?: string;
  showBestSellers?: boolean;
  showSpecials?: boolean;
  limit?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  ctaText?: string;
  ctaLink?: string;
}

export const FeaturedMenu = memo(function FeaturedMenu({ data }: { data: FeaturedMenuData }) {
  const {
    title = 'Món Đặc Sắc',
    subtitle = 'Khám phá hương vị đặc trưng của MrSaiGon',
    showBestSellers = true,
    showSpecials = true,
    limit = 6,
    autoPlay = true,
    autoPlayInterval = 5000,
    ctaText = 'Xem toàn bộ thực đơn',
    ctaLink = '/menu',
  } = data;

  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const result = await res.json();
        const menuData = result.data || result;
        
        // Get featured items (best sellers + specials)
        const allItems: MenuItem[] = [];
        (menuData || []).forEach((cat: MenuCategory) => {
          cat.items?.forEach((item: MenuItem) => {
            if (item.isAvailable) {
              if ((showBestSellers && item.isBestSeller) || (showSpecials && item.isSpecial)) {
                allItems.push({ ...item, category: { id: cat.id, name: cat.name } });
              }
            }
          });
        });
        
        setFeaturedItems(allItems.slice(0, limit));
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [showBestSellers, showSpecials, limit]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, featuredItems.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  }, [featuredItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  }, [featuredItems.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (loading) {
    return (
      <section style={{ 
        padding: '80px 20px', 
        ...glassEffect({ variant: 'subtle' }),
        borderRadius: 0,
        border: 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: `3px solid ${tokens.color.border}`,
              borderTopColor: tokens.color.primary,
              margin: '0 auto',
            }}
          />
        </div>
      </section>
    );
  }

  if (featuredItems.length === 0) {
    return null; // Don't render if no featured items
  }

  const currentItem = featuredItems[currentIndex];

  return (
    <section
      style={{
        padding: 'clamp(60px, 10vw, 100px) 20px',
        ...glassEffect({ variant: 'subtle' }),
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        border: 'none',
        borderTop: `1px solid rgba(255, 255, 255, 0.08)`,
        borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150%',
          height: '150%',
          background: `radial-gradient(ellipse at center, ${tokens.color.primary}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          {/* Decorative icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: `${tokens.color.primary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <i className="ri-star-fill" style={{ fontSize: 28, color: tokens.color.primary }} />
          </motion.div>

          <h2
            style={{
              fontSize: 'clamp(32px, 6vw, 52px)',
              fontFamily: tokens.font.display,
              color: tokens.color.primary,
              marginBottom: 16,
              fontStyle: 'italic',
              letterSpacing: 2,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: tokens.color.muted,
              maxWidth: 500,
              margin: '0 auto',
              letterSpacing: 1,
            }}
          >
            {subtitle}
          </p>
        </motion.div>

        {/* Featured Item Showcase */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            gap: 40,
            alignItems: 'center',
            marginBottom: 48,
          }}
        >
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ position: 'relative' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'relative',
                  borderRadius: tokens.radius.xl,
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  background: tokens.color.background,
                }}
              >
                {currentItem.imageUrl ? (
                  <img
                    src={resolveMediaUrl(currentItem.imageUrl)}
                    alt={currentItem.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${tokens.color.primary}10`,
                    }}
                  >
                    <i
                      className="ri-restaurant-line"
                      style={{ fontSize: 80, color: tokens.color.primary, opacity: 0.3 }}
                    />
                  </div>
                )}

                {/* Badges */}
                <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 8 }}>
                  {currentItem.isBestSeller && (
                    <span
                      style={{
                        padding: '8px 16px',
                        background: tokens.color.primary,
                        color: '#111',
                        borderRadius: tokens.radius.pill,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      Best Seller
                    </span>
                  )}
                  {currentItem.isSpecial && (
                    <span
                      style={{
                        padding: '8px 16px',
                        background: tokens.color.error,
                        color: '#fff',
                        borderRadius: tokens.radius.pill,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      Đặc biệt
                    </span>
                  )}
                </div>

                {/* Gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {featuredItems.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevSlide}
                  style={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    color: tokens.color.text,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: tokens.shadow.md,
                  }}
                >
                  <i className="ri-arrow-left-s-line" style={{ fontSize: 24 }} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextSlide}
                  style={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    color: tokens.color.text,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: tokens.shadow.md,
                  }}
                >
                  <i className="ri-arrow-right-s-line" style={{ fontSize: 24 }} />
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ padding: '0 20px' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Category */}
                {currentItem.category && (
                  <span
                    style={{
                      fontSize: 12,
                      color: tokens.color.primary,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                      display: 'block',
                    }}
                  >
                    {currentItem.category.name}
                  </span>
                )}

                {/* Name */}
                <h3
                  style={{
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    fontFamily: tokens.font.display,
                    color: tokens.color.text,
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  {currentItem.name}
                </h3>

                {/* Description */}
                {currentItem.description && (
                  <p
                    style={{
                      fontSize: 16,
                      color: tokens.color.muted,
                      lineHeight: 1.8,
                      marginBottom: 24,
                    }}
                  >
                    {currentItem.description}
                  </p>
                )}

                {/* Price */}
                <div
                  style={{
                    fontSize: 'clamp(24px, 4vw, 32px)',
                    fontWeight: 700,
                    color: tokens.color.primary,
                    fontFamily: tokens.font.display,
                    marginBottom: 32,
                  }}
                >
                  {formatPrice(currentItem.price)}
                </div>

                {/* Dots indicator */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {featuredItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      style={{
                        width: currentIndex === i ? 32 : 10,
                        height: 10,
                        borderRadius: 5,
                        background: currentIndex === i ? tokens.color.primary : tokens.color.border,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA Button */}
        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <motion.a
              href={ctaLink}
              whileHover={{ scale: 1.05, boxShadow: `0 12px 40px ${tokens.color.primary}40` }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 36px',
                background: 'transparent',
                color: tokens.color.primary,
                border: `2px solid ${tokens.color.primary}`,
                borderRadius: tokens.radius.pill,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: 1,
                textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}
            >
              {ctaText}
              <i className="ri-arrow-right-line" />
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
});

export default FeaturedMenu;
