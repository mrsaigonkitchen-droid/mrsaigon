import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { pagesApi, sectionsApi } from '../api';
import type { Page, Section, SectionKind } from '../types';
import { SectionEditor } from '../components/SectionEditor';
import { SectionTypePicker } from '../components/SectionTypePicker';
import { SectionsList } from '../components/SectionsList';
import { PageSelectorBar } from '../components/PageSelectorBar';

export function SectionsPage({ pageSlug = 'home' }: { pageSlug?: string }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [creatingSection, setCreatingSection] = useState<SectionKind | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (pageSlug && pages.length > 0) {
      const foundPage = pages.find(p => p.slug === pageSlug);
      if (foundPage) {
        setPage(foundPage);
      }
    }
  }, [pageSlug, pages]);

  async function loadPages() {
    try {
      const data = await pagesApi.list();
      setPages(data);
      // Auto-select page based on pageSlug or default to first page
      const selectedPage = data.find(p => p.slug === pageSlug) || data[0];
      if (selectedPage) {
        await loadPage(selectedPage.slug);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPage(slug: string) {
    try {
      const data = await pagesApi.get(slug);
      setPage(data);
    } catch (error) {
      console.error('Failed to load page:', error);
    }
  }

  async function handleSelectPage(selectedPage: Page) {
    setPage(null); // Clear current page to show loading
    await loadPage(selectedPage.slug);
  }

  async function handleCreatePage(data: { slug: string; title: string }) {
    await pagesApi.create(data);
  }

  async function handleEditPage(slug: string, data: { title: string }) {
    await pagesApi.update(slug, data);
  }

  async function handleDeletePage(slug: string) {
    await pagesApi.delete(slug);
  }

  async function handleDeleteSection(sectionId: string) {
    if (!confirm('Are you sure you want to delete this section?')) return;
    if (!page) return;
    try {
      await sectionsApi.delete(sectionId);
      await loadPage(page.slug);
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  }

  async function handleReorder(reorderedSections: Section[]) {
    if (!page) return;
    try {
      // Optimistically update UI
      setPage(prev => prev ? { ...prev, sections: reorderedSections } : null);
      
      // Save to backend
      await sectionsApi.reorder(reorderedSections.map(s => ({ id: s.id, order: s.order })));
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      // Reload to revert on error
      await loadPage(page.slug);
    }
  }

  async function handleSaveSection(sectionId: string | null, data: unknown) {
    if (!page) return;
    try {
      if (sectionId) {
        // Update existing section
        await sectionsApi.update(sectionId, { data });
      } else if (creatingSection) {
        // Create new section
        await sectionsApi.create(page.slug, { kind: creatingSection, data });
      }
      await loadPage(page.slug);
      // Reload live preview iframe
      setPreviewKey(prev => prev + 1);
      setEditingSection(null);
      setCreatingSection(null);
    } catch (error) {
      console.error('Failed to save section:', error);
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to save section';
      alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
      // Re-throw to prevent modal from closing
      throw error;
    }
  }

  async function handleDeleteSectionWithPreview(sectionId: string) {
    await handleDeleteSection(sectionId);
    // Reload live preview iframe
    setPreviewKey(prev => prev + 1);
  }

  async function handleReorderWithPreview(reorderedSections: Section[]) {
    await handleReorder(reorderedSections);
    // Reload live preview iframe
    setPreviewKey(prev => prev + 1);
  }

  const sectionTypes: Array<{ kind: SectionKind; icon: string; label: string; description: string }> = [
    { kind: 'HEADER', icon: 'ri-layout-top-2-line', label: 'Header', description: 'Navigation header with logo & links' },
    { kind: 'FOOTER', icon: 'ri-layout-bottom-2-line', label: 'Footer', description: 'Footer with brand info & links' },
    { kind: 'HERO', icon: 'ri-layout-top-line', label: 'Hero Section', description: 'Main banner with CTA' },
    { kind: 'HERO_SIMPLE', icon: 'ri-layout-top-fill', label: 'Simple Hero', description: 'Lightweight hero for secondary pages' },
    { kind: 'GALLERY', icon: 'ri-gallery-line', label: 'Gallery Grid', description: 'Image grid with lightbox' },
    { kind: 'GALLERY_SLIDESHOW', icon: 'ri-slideshow-line', label: 'Gallery Slideshow', description: 'Auto-playing slideshow' },
    { kind: 'FEATURED_MENU', icon: 'ri-restaurant-2-line', label: 'Featured Menu', description: 'Showcase signature dishes' },
    { kind: 'FEATURED_BLOG_POSTS', icon: 'ri-article-line', label: 'Featured Blog Posts', description: 'Latest blog posts' },
    { kind: 'TESTIMONIALS', icon: 'ri-message-3-line', label: 'Testimonials', description: 'Customer reviews' },
    { kind: 'STATS', icon: 'ri-bar-chart-line', label: 'Statistics', description: 'Display key numbers' },
    { kind: 'FEATURES', icon: 'ri-star-line', label: 'Features', description: 'Key features/values' },
    { kind: 'MISSION_VISION', icon: 'ri-flag-line', label: 'Mission & Vision', description: 'Company mission/vision' },
    { kind: 'CORE_VALUES', icon: 'ri-heart-3-line', label: 'Core Values', description: 'Display core values and principles' },
    { kind: 'CTA', icon: 'ri-megaphone-line', label: 'Call to Action', description: 'Action button' },
    { kind: 'CALL_TO_ACTION', icon: 'ri-megaphone-fill', label: 'Call to Action', description: 'CTA with primary and secondary buttons' },
    { kind: 'CONTACT_INFO', icon: 'ri-contacts-line', label: 'Contact Info', description: 'Contact details' },
    { kind: 'OPENING_HOURS', icon: 'ri-time-line', label: 'Opening Hours', description: 'Business hours' },
    { kind: 'SOCIAL_MEDIA', icon: 'ri-share-line', label: 'Social Media', description: 'Social links' },
    { kind: 'RESERVATION_FORM', icon: 'ri-calendar-line', label: 'Reservation Form', description: 'Booking form' },
    { kind: 'SPECIAL_OFFERS', icon: 'ri-price-tag-3-line', label: 'Special Offers', description: 'Promotional deals' },
    { kind: 'FAB_ACTIONS', icon: 'ri-customer-service-line', label: 'Floating Buttons', description: 'Corner action buttons' },
    { kind: 'FOOTER_SOCIAL', icon: 'ri-share-forward-line', label: 'Footer Social', description: 'Footer social links' },
    { kind: 'QUICK_CONTACT', icon: 'ri-contacts-fill', label: 'Quick Contact', description: 'Quick contact cards' },
    { kind: 'RICH_TEXT', icon: 'ri-text', label: 'Rich Text', description: 'Custom markdown content' },
    { kind: 'BANNER', icon: 'ri-notification-line', label: 'Banner', description: 'Notice banner' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: tokens.color.muted }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48, display: 'block', marginBottom: 16 }}
        />
        Loading sections...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: showLivePreview ? '100%' : 1400, margin: '0 auto', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 20px' }}>
      {/* Page Selector Bar */}
      <PageSelectorBar
        pages={pages}
        selectedPage={page}
        onSelectPage={handleSelectPage}
        onCreatePage={handleCreatePage}
        onEditPage={handleEditPage}
        onDeletePage={handleDeletePage}
        onRefresh={loadPages}
      />

      {/* Actions Bar */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.md,
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#111',
            }}
          >
            <i className="ri-layout-grid-line" />
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: tokens.color.text, margin: 0 }}>
              Page Sections
            </h2>
            <p style={{ color: tokens.color.muted, fontSize: 14, margin: 0 }}>
              Drag sections to reorder • Click to edit
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button 
            onClick={() => setShowLivePreview(!showLivePreview)} 
            icon={showLivePreview ? 'ri-layout-left-line' : 'ri-layout-right-line'}
            variant="secondary"
          >
            {showLivePreview ? 'Hide' : 'Show'} Live Preview
          </Button>
          <Button onClick={() => setShowTypePicker(true)} icon="ri-add-line">
            Add Section
          </Button>
        </div>
      </div>


      {/* Main Content with Split Layout */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        gap: 24, 
        overflow: 'hidden',
        paddingBottom: 20,
      }}>
        {/* Left Panel - Sections List */}
        <div style={{ 
          flex: showLivePreview ? '0 0 50%' : '1 1 100%',
          overflow: 'auto',
          maxWidth: showLivePreview ? '50%' : '1400px',
          margin: showLivePreview ? 0 : '0 auto',
        }}>

          {!page?.sections || page.sections.length === 0 ? (
            <Card title="No Sections Yet" icon="ri-layout-grid-line">
              <div style={{ textAlign: 'center', padding: 60, color: tokens.color.muted }}>
                <i className="ri-layout-grid-line" style={{ fontSize: 64, display: 'block', marginBottom: 16, opacity: 0.3 }} />
                <h3 style={{ fontSize: 20, fontWeight: 600, color: tokens.color.text, marginBottom: 8 }}>
                  Start Building Your Page
                </h3>
                <p style={{ fontSize: 15, marginBottom: 24 }}>
                  Add your first section to get started
                </p>
                <Button onClick={() => setShowTypePicker(true)} icon="ri-add-line">
                  Add First Section
                </Button>
              </div>
            </Card>
          ) : (
            <Card 
              title={`${page.sections.length} Section${page.sections.length > 1 ? 's' : ''}`}
              subtitle="Drag sections to reorder • Click to edit"
              icon="ri-list-ordered"
            >
              <SectionsList
                sections={page.sections}
                sectionTypes={sectionTypes}
                categoryColors={{
                  'Hero & Banners': '#f5d393',
                  'Content': '#3B82F6',
                  'Menu & Offers': '#10B981',
                  'Gallery & Media': '#8B5CF6',
                  'Social Proof': '#F59E0B',
                  'Call to Action': '#EF4444',
                  'Forms & Contact': '#06B6D4',
                }}
                onEdit={setEditingSection}
                onDelete={handleDeleteSectionWithPreview}
                onReorder={handleReorderWithPreview}
              />
            </Card>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        {showLivePreview && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            style={{ 
              flex: '0 0 50%',
              background: tokens.color.surface,
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.color.border}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: `1px solid ${tokens.color.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                }} />
                <span style={{ color: tokens.color.text, fontSize: 14, fontWeight: 600 }}>
                  Live Preview
                </span>
              </div>
              <button
                onClick={() => setPreviewKey(prev => prev + 1)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${tokens.color.border}`,
                  color: tokens.color.text,
                  padding: '6px 12px',
                  borderRadius: tokens.radius.sm,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <i className="ri-refresh-line" />
                Refresh
              </button>
            </div>
            <iframe
              key={previewKey}
              src="http://localhost:4200"
              style={{
                flex: 1,
                border: 'none',
                width: '100%',
                background: '#fff',
              }}
              title="Live Preview"
            />
          </motion.div>
        )}
      </div>

      {/* Section Type Picker Modal */}
      <AnimatePresence>
        {showTypePicker && (
          <SectionTypePicker
            onSelect={(type) => {
              setCreatingSection(type);
              setShowTypePicker(false);
            }}
            onCancel={() => setShowTypePicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Section Editor Modal */}
      <AnimatePresence mode="wait">
        {(editingSection || creatingSection) && (
          <SectionEditor
            key={editingSection?.id || `new-${creatingSection}`}
            section={editingSection}
            kind={creatingSection || editingSection?.kind || 'HERO'}
            onSave={(data) => handleSaveSection(editingSection?.id || null, data)}
            onCancel={() => {
              setEditingSection(null);
              setCreatingSection(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

