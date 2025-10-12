import { useState, useRef, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { tokens } from '@app/shared';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { mediaApi } from '../api';
import { MediaAsset } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';

type MediaFilter = 'all' | 'gallery' | 'system';

export function MediaPage() {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<MediaAsset[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaAsset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [editFormData, setEditFormData] = useState({
    alt: '',
    caption: '',
    isGalleryImage: false,
    isFeatured: false,
    displayOrder: 0,
    tags: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaApi.list();
      setMediaFiles(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => mediaApi.upload(file));
      const results = await Promise.all(uploadPromises);
      setMediaFiles((prev) => [...results, ...prev]);
      alert(`✅ ${results.length} file(s) uploaded successfully!`);
    } catch (error) {
      alert('❌ Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa file này? Hành động không thể hoàn tác!')) return;
    try {
      await mediaApi.delete(id);
      setMediaFiles((prev) => prev.filter((f) => f.id !== id));
      alert('✅ Đã xóa thành công!');
    } catch (error) {
      alert('❌ Delete failed: ' + (error as Error).message);
    }
  }

  const handleEditClick = (file: MediaAsset) => {
    setSelectedFile(file);
    setEditFormData({
      alt: file.alt || '',
      caption: file.caption || '',
      isGalleryImage: file.isGalleryImage || false,
      isFeatured: file.isFeatured || false,
      displayOrder: file.displayOrder || 0,
      tags: file.tags || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedFile) return;
    try {
      const response = await fetch(`http://localhost:4202/media/${selectedFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      const updated = await response.json();
      
      // Update local state
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFile.id ? { ...f, ...updated } : f
        )
      );
      
      setShowEditModal(false);
      setSelectedFile(null);
      alert('✅ Metadata updated successfully!');
      await loadMedia(); // Reload to get fresh data
    } catch (error) {
      alert('❌ Save failed: ' + (error as Error).message);
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:4202${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert('📋 URL copied to clipboard!');
  };

  const handleReorder = async (newOrder: MediaAsset[]) => {
    // Update displayOrder for gallery images only
    const galleryImages = newOrder.filter(img => img.isGalleryImage);
    
    try {
      await Promise.all(
        galleryImages.map((img, index) =>
          fetch(`http://localhost:4202/media/${img.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ displayOrder: index }),
          })
        )
      );
      
      setMediaFiles(newOrder);
      alert('✅ Order updated!');
    } catch (error) {
      console.error('Failed to reorder:', error);
      alert('❌ Reorder failed');
    }
  };

  // Filtering logic
  const filteredFiles = mediaFiles.filter(file => {
    // Search filter
    const matchesSearch = 
      (file.alt?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (file.caption?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (file.tags?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      file.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Type filter
    if (filter === 'gallery') return file.isGalleryImage === true;
    if (filter === 'system') return !file.isGalleryImage || file.isGalleryImage === false;
    return true; // 'all'
  });

  // Sort gallery images by displayOrder
  const sortedFiles = filter === 'gallery'
    ? [...filteredFiles].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : filteredFiles;

  const totalSize = mediaFiles.reduce((acc, file) => acc + (file.size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const galleryCount = mediaFiles.filter(f => f.isGalleryImage).length;
  const systemCount = mediaFiles.filter(f => !f.isGalleryImage).length;

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48, display: 'block', marginBottom: 16, color: tokens.color.primary }}
        />
        <p style={{ color: tokens.color.muted }}>Đang tải thư viện...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 32,
          background: 'rgba(12,12,16,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
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
              <i className="ri-gallery-line" />
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
                Media Library
              </h1>
              <p style={{ color: tokens.color.muted, fontSize: 15, margin: '4px 0 0 0' }}>
                {mediaFiles.length} files • {galleryCount} gallery • {systemCount} system • {formatBytes(totalSize)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              style={{ display: 'none' }}
            />
            <Button
              variant="primary"
              icon="ri-upload-cloud-line"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              size="large"
            >
              Upload Files
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm theo tên, caption, tags..."
              icon="ri-search-line"
              fullWidth
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: 4 }}>
            {[
              { value: 'all' as MediaFilter, label: 'All', icon: 'ri-image-line', count: mediaFiles.length },
              { value: 'gallery' as MediaFilter, label: 'Gallery', icon: 'ri-gallery-line', count: galleryCount },
              { value: 'system' as MediaFilter, label: 'System', icon: 'ri-folder-image-line', count: systemCount },
            ].map(({ value, label, icon, count }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(value)}
                style={{
                  padding: '8px 16px',
                  background: filter === value ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})` : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: filter === value ? '#0b0c0f' : tokens.color.muted,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <i className={icon} />
                {label} ({count})
              </motion.button>
            ))}
          </div>

          {/* View Mode */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: 4 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'grid' ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})` : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: viewMode === 'grid' ? '#0b0c0f' : tokens.color.muted,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              <i className="ri-grid-line" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})` : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: viewMode === 'list' ? '#0b0c0f' : tokens.color.muted,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              <i className="ri-list-check" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Media Grid/List */}
      {sortedFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'rgba(12,12,16,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <i className="ri-gallery-line" style={{ fontSize: 64, color: tokens.color.border, marginBottom: 16, display: 'block' }} />
          <p style={{ color: tokens.color.muted, marginBottom: 20, fontSize: 15 }}>
            {searchQuery ? 'Không tìm thấy file nào' : filter === 'gallery' ? 'Chưa có gallery images' : filter === 'system' ? 'Chưa có system images' : 'Chưa có file nào. Upload để bắt đầu!'}
          </p>
          {!searchQuery && filter === 'all' && (
            <Button onClick={() => fileInputRef.current?.click()} icon="ri-upload-cloud-line" variant="secondary">
              Upload Files
            </Button>
          )}
        </div>
      ) : filter === 'gallery' && viewMode === 'grid' ? (
        // Reorderable gallery grid
        <Reorder.Group
          axis="y"
          values={sortedFiles}
          onReorder={handleReorder}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}
        >
          {sortedFiles.map((file, index) => (
            <Reorder.Item
              key={file.id}
              value={file}
              style={{ position: 'relative' }}
            >
              <MediaCard
                file={file}
                index={index}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onCopy={copyToClipboard}
                isDraggable
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {sortedFiles.map((file, index) => (
            <MediaCard
              key={file.id}
              file={file}
              index={index}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      ) : (
        <div style={{ background: 'rgba(12,12,16,0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {sortedFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderBottom: index < sortedFiles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <OptimizedImage
                src={file.url.startsWith('http') ? file.url : `http://localhost:4202${file.url}`}
                alt={file.alt || 'Media'}
                loading="lazy"
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, color: tokens.color.text, fontWeight: 600 }}>
                    {file.alt || 'Untitled'}
                  </div>
                  {file.isGalleryImage && (
                    <span style={{ padding: '2px 8px', background: 'rgba(245,211,147,0.2)', borderRadius: '6px', fontSize: 11, color: tokens.color.primary, fontWeight: 600 }}>
                      GALLERY
                    </span>
                  )}
                  {file.isFeatured && (
                    <span style={{ padding: '2px 8px', background: 'rgba(245,158,11,0.2)', borderRadius: '6px', fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                      ⭐ FEATURED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: tokens.color.muted }}>
                  {file.width && file.height ? `${file.width} × ${file.height}` : 'Unknown'} • {new Date(file.createdAt).toLocaleDateString('vi-VN')}
                  {file.tags && <> • {file.tags}</>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(file.url)}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(245,211,147,0.1)',
                    border: '1px solid rgba(245,211,147,0.2)',
                    borderRadius: '8px',
                    color: tokens.color.primary,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <i className="ri-file-copy-line" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditClick(file)}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <i className="ri-edit-line" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(file.id)}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '8px',
                    color: tokens.color.error,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <i className="ri-delete-bin-line" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedFile && (
        <EditMediaModal
          file={selectedFile}
          formData={editFormData}
          onFormChange={setEditFormData}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}

// MediaCard Component
interface MediaCardProps {
  file: MediaAsset;
  index: number;
  onEdit: (file: MediaAsset) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
  isDraggable?: boolean;
}

function MediaCard({ file, index, onEdit, onDelete, onCopy, isDraggable }: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      style={{
        position: 'relative',
        background: 'rgba(12,12,16,0.7)',
        backdropFilter: 'blur(20px)',
        border: file.isFeatured ? '2px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: file.isFeatured ? '0 8px 32px rgba(245,158,11,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
        cursor: isDraggable ? 'grab' : 'default',
      }}
    >
      {/* Drag handle */}
      {isDraggable && (
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '4px 8px' }}>
          <i className="ri-drag-move-2-line" style={{ color: tokens.color.muted, fontSize: 16 }} />
        </div>
      )}

      {/* Badges */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {file.isGalleryImage && (
          <span style={{ padding: '4px 10px', background: 'rgba(245,211,147,0.9)', borderRadius: '8px', fontSize: 11, fontWeight: 700, color: '#0b0c0f' }}>
            GALLERY
          </span>
        )}
        {file.isFeatured && (
          <span style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.9)', borderRadius: '8px', fontSize: 11, fontWeight: 700, color: '#0b0c0f', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⭐ FEATURED
          </span>
        )}
        {file.displayOrder !== undefined && file.displayOrder > 0 && (
          <span style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.9)', borderRadius: '8px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            #{file.displayOrder + 1}
          </span>
        )}
      </div>

      {/* Image */}
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#000' }}>
        <OptimizedImage
          src={file.url.startsWith('http') ? file.url : `http://localhost:4202${file.url}`}
          alt={file.alt || 'Media'}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 13, color: tokens.color.text, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.alt || 'Untitled'}
        </div>
        <div style={{ fontSize: 11, color: tokens.color.muted, marginBottom: 8 }}>
          {file.width && file.height ? `${file.width} × ${file.height}` : 'Unknown size'}
          {file.tags && (
            <>
              <br />
              <span style={{ color: tokens.color.primary, fontSize: 10 }}>{file.tags}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCopy(file.url)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(245,211,147,0.1)',
              border: '1px solid rgba(245,211,147,0.2)',
              borderRadius: '8px',
              color: tokens.color.primary,
              cursor: 'pointer',
              fontSize: 16,
            }}
            title="Copy URL"
          >
            <i className="ri-file-copy-line" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(file)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '8px',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: 16,
            }}
            title="Edit"
          >
            <i className="ri-edit-line" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(file.id)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: tokens.color.error,
              cursor: 'pointer',
              fontSize: 16,
            }}
            title="Delete"
          >
            <i className="ri-delete-bin-line" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Edit Modal Component
interface EditMediaModalProps {
  file: MediaAsset;
  formData: {
    alt: string;
    caption: string;
    isGalleryImage: boolean;
    isFeatured: boolean;
    displayOrder: number;
    tags: string;
  };
  onFormChange: (data: any) => void;
  onSave: () => void;
  onClose: () => void;
}

function EditMediaModal({ file, formData, onFormChange, onSave, onClose }: EditMediaModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
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
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          style={{
            width: 'min(700px, 100%)',
            maxHeight: '90vh',
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
                Edit Media Metadata
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
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

          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <OptimizedImage
                src={file.url.startsWith('http') ? file.url : `http://localhost:4202${file.url}`}
                alt={file.alt || 'Media'}
                loading="eager"
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: tokens.radius.md, background: '#000' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Alt Text"
                value={formData.alt}
                onChange={(value) => onFormChange({ ...formData, alt: value })}
                placeholder="Mô tả hình ảnh..."
                fullWidth
              />

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                  Caption
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => onFormChange({ ...formData, caption: e.target.value })}
                  placeholder="Chú thích hình ảnh..."
                  rows={3}
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

              <Input
                label="Tags (comma-separated)"
                value={formData.tags}
                onChange={(value) => onFormChange({ ...formData, tags: value })}
                placeholder="food, menu, special..."
                fullWidth
              />

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 12 }}>
                  Settings
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.md, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isGalleryImage}
                      onChange={(e) => onFormChange({ ...formData, isGalleryImage: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: tokens.color.primary, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tokens.color.text }}>Gallery Image</div>
                      <div style={{ fontSize: 12, color: tokens.color.muted }}>Include this image in gallery sections</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.md, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => onFormChange({ ...formData, isFeatured: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: tokens.color.primary, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tokens.color.text }}>⭐ Featured</div>
                      <div style={{ fontSize: 12, color: tokens.color.muted }}>Highlight this image in gallery</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.isGalleryImage && (
                <Input
                  label="Display Order"
                  type="number"
                  value={formData.displayOrder.toString()}
                  onChange={(value) => onFormChange({ ...formData, displayOrder: parseInt(value) || 0 })}
                  placeholder="0"
                  fullWidth
                />
              )}

              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: tokens.radius.md, fontSize: 12, color: tokens.color.muted }}>
                <div><strong>URL:</strong> {file.url}</div>
                <div><strong>Size:</strong> {file.width} × {file.height} • {file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown'}</div>
                <div><strong>Uploaded:</strong> {new Date(file.createdAt).toLocaleString('vi-VN')}</div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button onClick={onSave} fullWidth>
                  <i className="ri-save-line" style={{ marginRight: 8 }} />
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={onClose} fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
