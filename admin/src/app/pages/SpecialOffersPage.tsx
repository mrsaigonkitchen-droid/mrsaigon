import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { offersApi } from '../api';
import { SpecialOffer } from '../types';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { OptimizedImage } from '../components/OptimizedImage';

export function SpecialOffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    validFrom: '',
    validUntil: '',
    imageId: '',
    isActive: true,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offersApi.list();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        imageId: formData.imageId || null,
      };

      if (editingOffer) {
        await offersApi.update(editingOffer.id, payload);
      } else {
        await offersApi.create(payload);
      }
      await loadOffers();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save offer:', error);
      alert('Failed to save offer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa ưu đãi này?')) return;
    try {
      await offersApi.delete(id);
      await loadOffers();
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer');
    }
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount?.toString() || '',
      validFrom: offer.validFrom.split('T')[0],
      validUntil: offer.validUntil.split('T')[0],
      imageId: offer.imageId || '',
      isActive: offer.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discount: '',
      validFrom: '',
      validUntil: '',
      imageId: '',
      isActive: true,
    });
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData({ ...formData, imageId: imageUrl });
    setShowImagePicker(false);
  };

  const isOfferActive = (offer: SpecialOffer) => {
    const now = new Date();
    const validFrom = new Date(offer.validFrom);
    const validUntil = new Date(offer.validUntil);
    return offer.isActive && now >= validFrom && now <= validUntil;
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48, display: 'block', marginBottom: 16, color: tokens.color.primary }}
        />
        <p style={{ color: tokens.color.muted }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
      {/* Modern Header với Glass */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          background: 'rgba(12,12,16,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#0b0c0f',
              boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
            }}
          >
            <i className="ri-percent-line" />
          </motion.div>
          <div>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: tokens.color.text,
                margin: 0,
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Special Offers
            </h1>
            <p style={{ color: tokens.color.muted, fontSize: 15, margin: '4px 0 0 0' }}>
              Quản lý các ưu đãi đặc biệt
            </p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} icon="ri-add-line" size="large">
          Tạo Offer
        </Button>
      </motion.div>

      {/* Modern Offers Grid với Glass */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {offers.map((offer, index) => {
          const isActive = isOfferActive(offer);
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(12,12,16,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: offer.isActive ? 1 : 0.5,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(245,211,147,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
              }}
            >
              {/* Modern Status Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  padding: '6px 14px',
                  borderRadius: '12px',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))'
                    : offer.isActive
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))'
                    : 'rgba(100,100,120,0.8)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 0 8px rgba(255,255,255,0.5)',
                }} />
                {isActive ? 'Active' : offer.isActive ? 'Scheduled' : 'Inactive'}
              </motion.div>

              {/* Image với Overlay */}
              {offer.imageId && (
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))', 
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <OptimizedImage
                    src={offer.imageId}
                    alt={offer.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  }} />
                </div>
              )}

              {/* Content */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        color: '#0b0c0f',
                        boxShadow: '0 4px 16px rgba(245,211,147,0.3)',
                      }}
                    >
                      <i className="ri-percent-line" />
                    </motion.div>
                    {offer.discount && (
                      <div>
                        <span style={{ 
                          fontSize: 36, 
                          fontWeight: 900, 
                          background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          lineHeight: 1,
                        }}>
                          {offer.discount}%
                        </span>
                        <p style={{ fontSize: 11, color: tokens.color.muted, margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Discount
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(offer)}
                      style={{
                        width: 38,
                        height: 38,
                        background: 'rgba(245,211,147,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(245,211,147,0.2)',
                        borderRadius: '10px',
                        color: tokens.color.primary,
                        cursor: 'pointer',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}
                    >
                      <i className="ri-edit-line" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(offer.id)}
                      style={{
                        width: 38,
                        height: 38,
                        background: 'rgba(239,68,68,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '10px',
                        color: tokens.color.error,
                        cursor: 'pointer',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}
                      >
                        <i className="ri-delete-bin-line" />
                      </motion.button>
                    </div>
                  </div>

                  <h3 style={{ 
                    fontSize: 22, 
                    fontWeight: 700, 
                    color: tokens.color.text, 
                    marginBottom: 10,
                    letterSpacing: '-0.02em',
                  }}>
                    {offer.title}
                  </h3>
                  <p style={{ fontSize: 14, color: tokens.color.muted, lineHeight: 1.6, marginBottom: 20 }}>
                    {offer.description}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    fontSize: 13, 
                    color: tokens.color.muted,
                    background: 'rgba(255,255,255,0.02)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <i className="ri-calendar-line" style={{ fontSize: 18, color: tokens.color.primary }} />
                    <span style={{ fontWeight: 500 }}>
                      {new Date(offer.validFrom).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(offer.validUntil).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
            </motion.div>
          );
        })}

        {offers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
            <i className="ri-percent-line" style={{ fontSize: 64, color: tokens.color.border, marginBottom: 16, display: 'block' }} />
            <p style={{ color: tokens.color.muted, marginBottom: 20, fontSize: 15 }}>Chưa có offer nào</p>
            <Button onClick={() => setShowModal(true)} icon="ri-add-line" variant="secondary">
              Tạo Offer Đầu Tiên
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: 'min(700px, 100%)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(20,21,26,0.98)',
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.color.border}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
            <div style={{ padding: 24, borderBottom: `1px solid ${tokens.color.border}`, position: 'sticky', top: 0, background: 'rgba(20,21,26,0.98)', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
                  {editingOffer ? 'Sửa Offer' : 'Tạo Offer Mới'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: tokens.color.muted,
                    cursor: 'pointer',
                    fontSize: 24,
                  }}
                >
                  <i className="ri-close-line" />
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Input
                label="Tiêu đề"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                placeholder="Ví dụ: Giảm 30% Tất Cả Món Ăn"
                required
                fullWidth
              />

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về ưu đãi..."
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <Input
                  label="Giảm giá (%)"
                  type="number"
                  value={formData.discount}
                  onChange={(value) => setFormData({ ...formData, discount: value })}
                  placeholder="30"
                  fullWidth
                />

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Trạng thái
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.md, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        background: formData.isActive ? tokens.color.primary : 'rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: formData.isActive ? 22 : 2,
                          width: 20,
                          height: 20,
                          background: '#fff',
                          borderRadius: '50%',
                          transition: 'all 0.2s',
                        }}
                      />
                    </div>
                    <span style={{ color: tokens.color.text, fontSize: 14, fontWeight: 500 }}>Active</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <Input
                  label="Ngày bắt đầu"
                  type="date"
                  value={formData.validFrom}
                  onChange={(value) => setFormData({ ...formData, validFrom: value })}
                  required
                  fullWidth
                />

                <Input
                  label="Ngày kết thúc"
                  type="date"
                  value={formData.validUntil}
                  onChange={(value) => setFormData({ ...formData, validUntil: value })}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                  Hình ảnh
                </label>
                {formData.imageId && (
                  <div style={{ marginBottom: 12 }}>
                    <OptimizedImage
                      src={formData.imageId}
                      alt="Preview"
                      loading="eager"
                      style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: tokens.radius.md }}
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowImagePicker(true)}
                  fullWidth
                >
                  <i className="ri-image-line" style={{ marginRight: 8 }} />
                  {formData.imageId ? 'Đổi hình ảnh' : 'Chọn hình ảnh'}
                </Button>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <Button type="submit" fullWidth>
                  <i className={editingOffer ? 'ri-save-line' : 'ri-add-line'} style={{ marginRight: 8 }} />
                  {editingOffer ? 'Cập nhật' : 'Tạo Offer'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseModal} fullWidth>
                  <i className="ri-close-line" style={{ marginRight: 8 }} />
                  Hủy
                </Button>
              </div>
            </form>
            </motion.div>
          </div>
        </>
      )}

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}
