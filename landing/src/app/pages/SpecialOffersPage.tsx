import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardImage } from '../components/OptimizedImage';
import { offersAPI } from '../api';

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: number | null;
  validFrom: string;
  validUntil: string;
  imageId: string | null;
  isActive: boolean;
}

export function SpecialOffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await offersAPI.getActive();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load special offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <section style={{ 
      minHeight: '100vh',
      background: 'transparent',
      paddingTop: 80
    }}>
      {/* Hero Section - Similar to BlogPage */}
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
            Ưu Đãi Đặc Biệt
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
            Khám phá các chương trình khuyến mãi hấp dẫn dành riêng cho bạn
          </motion.p>
        </div>
      </motion.div>

      {/* Offers Grid */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '60px 24px'
      }}>
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
            <p>Đang tải ưu đãi...</p>
          </div>
        ) : offers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 0',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <i className="ri-gift-line" style={{ fontSize: 64, marginBottom: 16, display: 'block' }} />
            <p style={{ fontSize: 18 }}>Hiện chưa có ưu đãi nào</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: 32,
              paddingBottom: 80,
            }}
          >
            <AnimatePresence mode="sync">
              {offers.map((offer, idx) => {
                const expired = isExpired(offer.validUntil);

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: idx * 0.1 }}
                    style={{
                      position: 'relative',
                      cursor: 'default',
                      borderRadius: 20,
                      overflow: 'hidden',
                      background: 'rgba(12,12,16,0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '2px solid rgba(245,211,147,0.2)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      willChange: 'transform, opacity',
                      transform: 'translateZ(0)',
                      opacity: expired ? 0.5 : 1,
                    }}
                  >
                    {/* Image */}
                    {offer.imageId ? (
                      <div 
                        style={{
                          position: 'relative',
                          height: 240,
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,0.3)',
                        }}
                        onMouseEnter={(e) => {
                          const img = e.currentTarget.querySelector('img');
                          if (img) img.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          const img = e.currentTarget.querySelector('img');
                          if (img) img.style.transform = 'scale(1)';
                        }}
                      >
                        <CardImage
                          src={`http://localhost:4202/media/${offer.imageId}`}
                          alt={offer.title}
                          style={{ aspectRatio: '16/9' }}
                        />

                        {/* Discount Badge */}
                        {offer.discount && (
                          <div style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(239,68,68,0.4)',
                            border: '3px solid white',
                          }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                              -{offer.discount}%
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                              OFF
                            </div>
                          </div>
                        )}

                        {expired && (
                          <div style={{
                            position: 'absolute',
                            top: 20,
                            left: 20,
                            padding: '8px 16px',
                            background: 'rgba(100,100,120,0.9)',
                            color: 'white',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            HẾT HẠN
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        height: 240,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(245,211,147,0.1), rgba(239,182,121,0.05))',
                      }}>
                        <i className="ri-gift-line" style={{ fontSize: 64, color: 'rgba(245,211,147,0.3)' }} />
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ padding: 32 }}>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#F5D393',
                        marginBottom: 16,
                        lineHeight: 1.3,
                        fontFamily: 'Playfair Display, serif',
                      }}>
                        {offer.title}
                      </h3>

                      <p style={{
                        fontSize: '0.938rem',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: 24,
                        lineHeight: 1.6,
                      }}>
                        {offer.description}
                      </p>

                      {/* Validity Period */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <i className="ri-calendar-line" style={{ fontSize: 20, color: '#F5D393' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                            Thời gian áp dụng
                          </div>
                          <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>
                            {formatDate(offer.validFrom)} - {formatDate(offer.validUntil)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

