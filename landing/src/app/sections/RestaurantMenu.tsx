/**
 * RestaurantMenu Section
 * Elegant restaurant menu display with luxury styling
 */

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens, API_URL, resolveMediaUrl } from '@app/shared';
import { glassEffect } from '../styles/glassEffect';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isSpecial: boolean;
  order: number;
  category?: {
    id: string;
    name: string;
  };
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  items: MenuItem[];
}

interface RestaurantMenuData {
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'list' | 'tabs';
  showPrice?: boolean;
  showDescription?: boolean;
  onlyBestSeller?: boolean;
  onlySpecial?: boolean;
  limit?: number;
  ctaText?: string;
  ctaLink?: string;
}

export const RestaurantMenu = memo(function RestaurantMenu({ data }: { data: RestaurantMenuData }) {
  const {
    title = 'Thực Đơn',
    subtitle,
    layout = 'grid',
    showPrice = true,
    showDescription = true,
    onlyBestSeller = false,
    onlySpecial = false,
    limit = 0,
    ctaText,
    ctaLink,
  } = data;

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      const res = await fetch(`${API_URL}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      const json = await res.json();
      const menuData = json.data || json;
      setCategories(menuData);
      if (menuData.length > 0) {
        setActiveTab(menuData[0].id);
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterItems(items: MenuItem[]): MenuItem[] {
    let filtered = items.filter((item) => item.isAvailable);
    if (onlyBestSeller) filtered = filtered.filter((item) => item.isBestSeller);
    if (onlySpecial) filtered = filtered.filter((item) => item.isSpecial);
    if (limit > 0) filtered = filtered.slice(0, limit);
    return filtered;
  }

  function getAllItems(): MenuItem[] {
    const allItems = categories.flatMap((cat) =>
      cat.items.map((item) => ({ ...item, category: { id: cat.id, name: cat.name } }))
    );
    return filterItems(allItems);
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  }

  if (loading) {
    return (
      <section style={{ 
        padding: 'clamp(60px, 10vw, 100px) 20px', 
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

  const items = layout === 'tabs' ? [] : getAllItems();

  return (
    <section
      style={{
        padding: 'clamp(60px, 10vw, 100px) 20px',
        ...glassEffect({ variant: 'subtle' }),
        position: 'relative',
        borderRadius: 0,
        border: 'none',
        borderTop: `1px solid rgba(255, 255, 255, 0.08)`,
        borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${tokens.color.primary}30, transparent)`,
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          {/* Decorative line */}
          <div
            style={{
              width: 60,
              height: 2,
              background: tokens.color.primary,
              margin: '0 auto 20px',
            }}
          />
          
          {title && (
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
          )}
          {subtitle && (
            <p
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: tokens.color.muted,
                maxWidth: 600,
                margin: '0 auto',
                letterSpacing: 1,
              }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Tabs Layout */}
        {layout === 'tabs' && categories.length > 0 && (
          <>
            {/* Tab Headers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 48,
              }}
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(cat.id)}
                  style={{
                    padding: '12px 28px',
                    background: activeTab === cat.id ? tokens.color.primary : 'transparent',
                    color: activeTab === cat.id ? '#111' : tokens.color.text,
                    border: `1px solid ${activeTab === cat.id ? tokens.color.primary : tokens.color.border}`,
                    borderRadius: tokens.radius.pill,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {categories.map(
                (cat) =>
                  activeTab === cat.id && (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <MenuGrid
                        items={filterItems(cat.items)}
                        showPrice={showPrice}
                        showDescription={showDescription}
                        formatPrice={formatPrice}
                      />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </>
        )}

        {/* Grid/List Layout */}
        {layout !== 'tabs' && (
          <MenuGrid
            items={items}
            layout={layout}
            showPrice={showPrice}
            showDescription={showDescription}
            formatPrice={formatPrice}
          />
        )}

        {/* CTA Button */}
        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: 60 }}
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

// Menu Grid Component
const MenuGrid = memo(function MenuGrid({
  items,
  layout = 'grid',
  showPrice,
  showDescription,
  formatPrice,
}: {
  items: MenuItem[];
  layout?: 'grid' | 'list';
  showPrice: boolean;
  showDescription: boolean;
  formatPrice: (price: number) => string;
}) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: tokens.color.muted }}>
        <i className="ri-restaurant-line" style={{ fontSize: 64, marginBottom: 20, display: 'block', opacity: 0.3 }} />
        <p style={{ fontSize: 16, letterSpacing: 1 }}>Chưa có món ăn nào</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          layout === 'list' ? '1fr' : 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
        gap: layout === 'list' ? 20 : 32,
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.5 }}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
          style={{
            background: tokens.color.surface,
            borderRadius: tokens.radius.lg,
            overflow: 'hidden',
            border: `1px solid ${tokens.color.border}`,
            display: layout === 'list' ? 'flex' : 'block',
            gap: layout === 'list' ? 24 : 0,
            position: 'relative',
          }}
        >
          {/* Image */}
          <div
            style={{
              width: layout === 'list' ? 180 : '100%',
              height: layout === 'list' ? 140 : 220,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              background: `${tokens.color.primary}10`,
            }}
          >
            {item.imageUrl ? (
              <motion.img
                src={resolveMediaUrl(item.imageUrl)}
                alt={item.name}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
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
                }}
              >
                <i
                  className="ri-restaurant-line"
                  style={{ fontSize: 48, color: tokens.color.primary, opacity: 0.3 }}
                />
              </div>
            )}
            
            {/* Badges */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              {item.isBestSeller && (
                <span
                  style={{
                    padding: '6px 12px',
                    background: tokens.color.primary,
                    color: '#111',
                    borderRadius: tokens.radius.sm,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Best Seller
                </span>
              )}
              {item.isSpecial && (
                <span
                  style={{
                    padding: '6px 12px',
                    background: tokens.color.error,
                    color: '#fff',
                    borderRadius: tokens.radius.sm,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Đặc biệt
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 20, flex: 1 }}>
            {/* Category tag */}
            {item.category && (
              <span
                style={{
                  fontSize: 11,
                  color: tokens.color.primary,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                {item.category.name}
              </span>
            )}
            
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: tokens.color.text,
                marginBottom: 10,
                fontFamily: tokens.font.display,
              }}
            >
              {item.name}
            </h3>

            {showDescription && item.description && (
              <p
                style={{
                  fontSize: 14,
                  color: tokens.color.muted,
                  lineHeight: 1.6,
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.description}
              </p>
            )}

            {showPrice && (
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: tokens.color.primary,
                  fontFamily: tokens.font.display,
                }}
              >
                {formatPrice(item.price)}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

export default RestaurantMenu;
