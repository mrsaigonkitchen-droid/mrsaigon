import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { pagesApi } from '../api';
import type { Page } from '../types';

export function PagesPage({ onNavigateToSections }: { onNavigateToSections: (slug: string) => void }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
  });

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const data = await pagesApi.list();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingPage) {
        await pagesApi.update(editingPage.slug, { title: formData.title });
      } else {
        await pagesApi.create({ slug: formData.slug, title: formData.title });
      }
      await loadPages();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete page "${slug}"? All sections will be deleted!`)) return;
    try {
      await pagesApi.delete(slug);
      await loadPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Failed to delete page');
    }
  }

  function handleEdit(page: Page) {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title || '',
    });
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingPage(null);
    setFormData({
      slug: '',
      title: '',
    });
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: tokens.color.muted }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48, display: 'block', marginBottom: 16, color: tokens.color.primary }}
        />
        <p>Loading pages...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Explanation Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${tokens.color.primary}15, ${tokens.color.accent}10)`,
          border: `1px solid ${tokens.color.primary}30`,
          borderRadius: tokens.radius.lg,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: tokens.radius.md,
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#111',
              flexShrink: 0,
            }}
          >
            <i className="ri-pages-line" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: tokens.color.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              📄 Quản lý Pages
            </h3>
            <p style={{ color: tokens.color.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              <strong style={{ color: tokens.color.primary }}>Pages</strong> là các trang riêng biệt trong website của bạn (Home, About, Menu, Gallery, Contact...). 
              Mỗi page có thể chứa nhiều <strong style={{ color: tokens.color.primary }}>Sections</strong> để tạo nên giao diện hoàn chỉnh.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: tokens.color.text }}>
                <i className="ri-checkbox-circle-fill" style={{ color: '#34D399' }} />
                Quản lý nội dung từng trang
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: tokens.color.text }}>
                <i className="ri-checkbox-circle-fill" style={{ color: '#34D399' }} />
                Tùy chỉnh Sections theo ý muốn
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: tokens.color.text }}>
                <i className="ri-checkbox-circle-fill" style={{ color: '#34D399' }} />
                Preview realtime trên website
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: tokens.radius.md,
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#111',
            }}
          >
            <i className="ri-file-list-3-line" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: tokens.color.text, margin: 0 }}>Pages</h1>
            <p style={{ color: tokens.color.muted, fontSize: 15, margin: 0 }}>Manage all website pages</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} icon="ri-add-line">
          Create Page
        </Button>
      </div>

      {/* Pages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {pages.map((page, index) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hoverable>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: tokens.radius.md,
                      background: `${tokens.color.primary}20`,
                      border: `1px solid ${tokens.color.primary}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      color: tokens.color.primary,
                    }}
                  >
                    <i className="ri-file-text-line" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(page)}
                    style={{
                      padding: 6,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${tokens.color.border}`,
                      borderRadius: tokens.radius.sm,
                      color: tokens.color.primary,
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    <i className="ri-edit-line" />
                  </motion.button>
                  {page.slug !== 'home' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(page.slug)}
                      style={{
                        padding: 6,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${tokens.color.border}`,
                        borderRadius: tokens.radius.sm,
                        color: tokens.color.error,
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                    >
                      <i className="ri-delete-bin-line" />
                    </motion.button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, marginBottom: 6 }}>{page.title || page.slug}</h3>
              <p style={{ fontSize: 13, color: tokens.color.muted, marginBottom: 16 }}>/{page.slug}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.md, border: `1px solid ${tokens.color.border}` }}>
                  <div style={{ fontSize: 12, color: tokens.color.muted, marginBottom: 4 }}>Sections</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: tokens.color.primary }}>{page._count?.sections || 0}</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.md, border: `1px solid ${tokens.color.border}` }}>
                  <div style={{ fontSize: 12, color: tokens.color.muted, marginBottom: 4 }}>Updated</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('vi-VN') : '-'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => onNavigateToSections(page.slug)}
                  fullWidth
                  icon="ri-layout-grid-line"
                >
                  Manage Sections
                </Button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(`http://localhost:4200/#/${page.slug}`, '_blank')}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    cursor: 'pointer',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <i className="ri-external-link-line" />
                  Preview Page
                </motion.button>
              </div>
            </Card>
          </motion.div>
        ))}

        {pages.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
            <i className="ri-file-list-3-line" style={{ fontSize: 64, color: tokens.color.border, marginBottom: 16, display: 'block' }} />
            <p style={{ color: tokens.color.muted, marginBottom: 20, fontSize: 15 }}>No pages yet</p>
            <Button onClick={() => setShowModal(true)} icon="ri-add-line" variant="secondary">
              Create First Page
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
                width: 'min(500px, 100%)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(20,21,26,0.98)',
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.color.border}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
            <div style={{ padding: 24, borderBottom: `1px solid ${tokens.color.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, margin: 0 }}>
                  {editingPage ? 'Edit Page' : 'Create New Page'}
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

            <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Input
                label="Page Title"
                value={formData.title}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    title: value,
                    slug: editingPage ? formData.slug : generateSlug(value),
                  });
                }}
                placeholder="About Us"
                required
                fullWidth
              />

              <Input
                label="Slug (URL)"
                value={formData.slug}
                onChange={(value) => setFormData({ ...formData, slug: value })}
                placeholder="about"
                required
                disabled={!!editingPage}
                fullWidth
              />

              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <Button type="submit" fullWidth>
                  <i className={editingPage ? 'ri-save-line' : 'ri-add-line'} style={{ marginRight: 8 }} />
                  {editingPage ? 'Update' : 'Create'} Page
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseModal} fullWidth>
                  <i className="ri-close-line" style={{ marginRight: 8 }} />
                  Cancel
                </Button>
              </div>
            </form>
            </motion.div>
          </div>
        </>
      )}

    </div>
  );
}
