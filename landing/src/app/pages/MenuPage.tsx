import { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuAPI } from '../api';
import { OptimizedImage } from '../components/OptimizedImage';

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  _count?: { items: number };
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string | null;
  category?: MenuCategory | null;
  tags: string | null;
  isVegetarian: boolean;
  isSpicy: boolean;
  popular: boolean;
  available: boolean;
}

const ITEMS_PER_PAGE = 12; // Show 12 items per page

export const MenuPage = memo(function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        menuAPI.getItems(),
        fetch('http://localhost:4202/menu-categories').then(r => r.json())
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group items by category (memoized)
  const groupedItems = useMemo(() => 
    categories.reduce((acc, cat) => {
      const items = menuItems.filter(item => item.categoryId === cat.id);
      if (items.length > 0) {
        acc.push({ category: cat, items });
      }
      return acc;
    }, [] as Array<{ category: MenuCategory; items: MenuItem[] }>),
    [categories, menuItems]
  );

  // Filter items (memoized)
  const filteredGroups = useMemo(() =>
    selectedCategory === 'all'
      ? groupedItems
      : groupedItems.filter(g => g.category.id === selectedCategory),
    [groupedItems, selectedCategory]
  );

  // Flatten items for pagination
  const allFilteredItems = useMemo(() => 
    filteredGroups.flatMap(g => g.items),
    [filteredGroups]
  );

  // Pagination logic
  const totalPages = Math.ceil(allFilteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = allFilteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Fix image URL helper
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:4202${url}`;
  };

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
            <i className="ri-restaurant-line" style={{ marginRight: 8 }} />
            Menu
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
            Thực Đơn Đặc Biệt
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
            Những món ăn tinh tế được chế biến từ nguyên liệu tươi ngon nhất, 
            mang đến trải nghiệm ẩm thực tuyệt vời
          </motion.p>
        </div>
      </motion.div>

      {/* Category Filters */}
      <div style={{ 
        maxWidth: 1200, 
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
            marginBottom: 60, 
            flexWrap: 'wrap',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 24,
          }}
        >
          <motion.button
            onClick={() => setSelectedCategory('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              border: 'none',
              background: selectedCategory === 'all'
                ? 'linear-gradient(135deg, #F5D393, #EFB679)' 
                : 'transparent',
              color: selectedCategory === 'all' ? '#111' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
          >
            Tất cả ({menuItems.length})
          </motion.button>

          {categories.map((cat) => {
            const count = menuItems.filter(i => i.categoryId === cat.id).length;
            const isActive = selectedCategory === cat.id;

            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive 
                    ? 'linear-gradient(135deg, #F5D393, #EFB679)' 
                    : 'transparent',
                  color: isActive ? '#111' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {cat.icon && <i className={cat.icon} style={{ fontSize: 18 }} />}
                {cat.name} ({count})
              </motion.button>
            );
          })}
        </motion.div>

        {/* Menu Items - Elegant Restaurant Style */}
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
            <p>Đang tải thực đơn...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 0',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <i className="ri-restaurant-line" style={{ fontSize: 64, marginBottom: 16, display: 'block' }} />
            <p style={{ fontSize: 18 }}>Không tìm thấy món ăn nào</p>
          </div>
        ) : (
          <div style={{ paddingBottom: 48 }}>
            {/* Menu Items Grid - Paginated */}
            <div style={{
              display: 'grid',
              gap: 24,
            }}>
              {paginatedItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: idx * 0.05,
                  }}
                  className="menu-card"
                  style={{
                    display: 'flex',
                    gap: 20,
                    padding: 20,
                    borderRadius: 16,
                    background: 'rgba(12,12,16,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                    opacity: item.available ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,211,147,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                      >
                        {/* Image Thumbnail */}
                        {item.imageUrl && (
                          <OptimizedImage
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            loading="lazy"
                            style={{
                              flexShrink: 0,
                              width: 120,
                              height: 120,
                              borderRadius: 12,
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
                        )}

                        {/* Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Title & Price Row */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: 8,
                            gap: 16,
                          }}>
                            <h3 style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: '#fff',
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}>
                              {item.name}
                              {item.popular && (
                                <span style={{
                                  padding: '4px 10px',
                                  background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}>
                                  <i className="ri-fire-line" style={{ marginRight: 4 }} />
                                  Popular
                                </span>
                              )}
                              {!item.available && (
                                <span style={{
                                  padding: '4px 10px',
                                  background: 'rgba(100,100,120,0.9)',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}>
                                  Hết món
                                </span>
                              )}
                            </h3>

                            <div style={{
                              fontSize: 24,
                              fontWeight: 800,
                              color: '#F5D393',
                              whiteSpace: 'nowrap',
                              fontFamily: 'Playfair Display, serif',
                            }}>
                              {item.price.toLocaleString('vi-VN')}đ
                            </div>
                          </div>

                          {/* Description */}
                          <p style={{
                            fontSize: 15,
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.6,
                            margin: '0 0 12px 0',
                          }}>
                            {item.description}
                          </p>

                          {/* Tags & Icons */}
                          <div style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginTop: 'auto',
                          }}>
                            {item.isVegetarian && (
                              <span style={{
                                padding: '4px 10px',
                                background: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: 6,
                                fontSize: 12,
                                color: '#10b981',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                                <i className="ri-leaf-line" />
                                Chay
                              </span>
                            )}
                            {item.isSpicy && (
                              <span style={{
                                padding: '4px 10px',
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 6,
                                fontSize: 12,
                                color: '#ef4444',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                                <i className="ri-fire-fill" />
                                Cay
                              </span>
                            )}
                            {item.tags && item.tags.split(',').map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                style={{
                                  padding: '4px 10px',
                                  background: 'rgba(245,211,147,0.1)',
                                  border: '1px solid rgba(245,211,147,0.2)',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  color: '#F5D393',
                                  fontWeight: 600,
                                }}
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {allFilteredItems.length > ITEMS_PER_PAGE && (
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
        )}
      </div>
    </section>
  );
});
