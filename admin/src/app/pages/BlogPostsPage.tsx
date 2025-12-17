import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { OptimizedImageUpload } from '../components/OptimizedImageUpload';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { blogPostsApi, blogCategoriesApi, mediaApi } from '../api';
import { BlogPost, BlogCategory } from '../types';
import { useToast } from '../components/Toast';

export function BlogPostsPage() {
  const toast = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    tags: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    isFeatured: false,
  });

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [filterStatus, filterCategory, searchTerm]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params: { status?: string; categoryId?: string; search?: string } = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.categoryId = filterCategory;
      if (searchTerm) params.search = searchTerm;
      const data = await blogPostsApi.list(params);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await blogCategoriesApi.list();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await blogPostsApi.update(editingPost.id, formData);
        toast.success('Bài viết đã được cập nhật!');
      } else {
        await blogPostsApi.create(formData);
        toast.success('Bài viết mới đã được tạo!');
      }
      await loadPosts();
      handleCloseEditor();
    } catch (error) {
      console.error('Failed to save post:', error);
      toast.error('Lưu bài viết thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return;
    try {
      await blogPostsApi.delete(id);
      await loadPosts();
      toast.success('Bài viết đã được xóa!');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Xóa bài viết thất bại');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featuredImage: post.featuredImage || '',
      categoryId: post.categoryId,
      tags: post.tags || '',
      status: post.status,
      isFeatured: post.isFeatured,
    });
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      categoryId: '',
      tags: '',
      status: 'DRAFT',
      isFeatured: false,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    });
  };

  // Status badge styles are now inline in the JSX

  if (loading && posts.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <motion.i
          className="ri-loader-4-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48, display: 'block', marginBottom: 16, color: '#F5D393' }}
        />
        <p style={{ color: '#A1A1AA' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
            <i className="ri-article-line" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: tokens.color.text, margin: 0 }}>Blog Posts</h1>
            <p style={{ color: tokens.color.muted, fontSize: 15, margin: 0 }}>Quản lý bài viết blog của bạn</p>
          </div>
        </div>
        <Button onClick={() => setShowEditor(true)} icon="ri-add-line">
          Tạo Post Mới
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }} icon="ri-filter-3-line" title="Bộ lọc" subtitle="Tìm kiếm và lọc bài viết">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: tokens.color.muted }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              style={{
                width: '100%',
                paddingLeft: 40,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${tokens.color.border}`,
                borderRadius: tokens.radius.md,
                color: tokens.color.text,
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
            fullWidth={false}
          />

          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            options={[
              { value: '', label: 'Tất cả categories' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name }))
            ]}
            fullWidth={false}
          />
        </div>
      </Card>

      {/* Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map((post) => (
          <Card key={post.id} hoverable style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {post.featuredImage && (
                <img
                  src={post.featuredImage.startsWith('http') ? post.featuredImage : `http://localhost:4202${post.featuredImage}`}
                  alt={post.title}
                  style={{
                    width: 140,
                    height: 140,
                    objectFit: 'cover',
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#F4F4F5', marginBottom: 4 }}>{post.title}</h3>
                    <p style={{ fontSize: 13, color: '#A1A1AA' }}>/{post.slug}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(post)}
                      style={{
                        padding: 8,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${tokens.color.border}`,
                        borderRadius: tokens.radius.md,
                        color: tokens.color.primary,
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                    >
                      <i className="ri-edit-line" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(post.id)}
                      style={{
                        padding: 8,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${tokens.color.border}`,
                        borderRadius: tokens.radius.md,
                        color: tokens.color.error,
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                    >
                      <i className="ri-delete-bin-line" />
                    </motion.button>
                  </div>
                </div>

                {post.excerpt && (
                  <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>{post.excerpt}</p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#A1A1AA', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: post.status === 'PUBLISHED' ? 'rgba(52,211,153,0.15)' : post.status === 'ARCHIVED' ? 'rgba(245,158,11,0.15)' : 'rgba(161,161,170,0.15)',
                      color: post.status === 'PUBLISHED' ? '#34D399' : post.status === 'ARCHIVED' ? '#F59E0B' : '#A1A1AA',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {post.status}
                  </span>
                  {post.isFeatured && (
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: 'rgba(245,211,147,0.15)',
                        color: tokens.color.primary,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <i className="ri-star-fill" style={{ fontSize: 14 }} />
                      Featured
                    </span>
                  )}
                  {post.category && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: post.category.color || tokens.color.primary,
                        }}
                      />
                      {post.category.name}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span><i className="ri-calendar-line" style={{ marginRight: 4 }} />
                      {new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                  )}
                  {post._count && <span><i className="ri-message-3-line" style={{ marginRight: 4 }} />{post._count.comments} bình luận</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 60 }}>
            <i className="ri-article-line" style={{ fontSize: 64, color: '#27272A', marginBottom: 16, display: 'block' }} />
            <p style={{ color: '#A1A1AA', marginBottom: 20, fontSize: 15 }}>Chưa có bài viết nào</p>
            <Button onClick={() => setShowEditor(true)} icon="ri-add-line" variant="secondary">
              Tạo Post Đầu Tiên
            </Button>
          </Card>
        )}
      </div>

      {/* Modern Editor Modal với Glass Morphism */}
      {showEditor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseEditor}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1300,
            padding: 24,
            overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(24px)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              width: '100%',
              maxWidth: 1000,
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,211,147,0.1)',
              marginTop: 32,
              marginBottom: 32,
            }}
          >
            {/* Glass Header */}
            <div
              style={{
                padding: '28px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                position: 'sticky',
                top: 0,
                background: 'rgba(12,12,16,0.95)',
                backdropFilter: 'blur(24px)',
                zIndex: 10,
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    color: '#0b0c0f',
                    boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
                  }}
                >
                  <i className={editingPost ? 'ri-edit-line' : 'ri-add-line'} />
                </motion.div>
                <div>
                  <h2 style={{ 
                    fontSize: 24, 
                    fontWeight: 700, 
                    color: tokens.color.text,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    {editingPost ? 'Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
                  </h2>
                  <p style={{ 
                    fontSize: 14, 
                    color: tokens.color.muted, 
                    margin: '4px 0 0 0',
                    fontWeight: 400,
                  }}>
                    {editingPost ? 'Cập nhật thông tin bài viết' : 'Điền thông tin để tạo bài viết mới'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseEditor}
                style={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: tokens.color.muted,
                  cursor: 'pointer',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                }}
              >
                <i className="ri-close-line" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Tiêu đề"
                    value={formData.title}
                    onChange={(value) => handleTitleChange(value)}
                    placeholder="Tiêu đề bài viết..."
                    required
                    fullWidth
                  />
                </div>

                <Input
                  label="Slug (URL)"
                  value={formData.slug}
                  onChange={(value) => setFormData({ ...formData, slug: value })}
                  placeholder="tieu-de-bai-viet"
                  required
                  fullWidth
                />

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Category *
                  </label>
                  <Select
                    value={formData.categoryId}
                    onChange={(val) => setFormData({ ...formData, categoryId: val })}
                    options={[
                      { value: '', label: 'Chọn category' },
                      ...categories.map((cat) => ({ value: cat.id, label: cat.name }))
                    ]}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Excerpt (Tóm tắt)
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Tóm tắt ngắn gọn về bài viết..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(12,12,16,0.6)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${tokens.color.border}`,
                      borderRadius: '12px',
                      color: tokens.color.text,
                      fontSize: 14,
                      fontWeight: 400,
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = tokens.color.primary;
                      e.target.style.boxShadow = '0 4px 16px rgba(245,211,147,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = tokens.color.border;
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Nội dung *
                  </label>
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Viết nội dung bài viết..."
                    minHeight={350}
                    onImageUpload={async (file) => {
                      const formData = new FormData();
                      formData.append('file', file);
                      const response = await fetch('http://localhost:4202/media/upload', {
                        method: 'POST',
                        body: formData,
                      });
                      if (!response.ok) throw new Error('Upload failed');
                      const data = await response.json();
                      return data.url;
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <OptimizedImageUpload
                    label="Featured Image"
                    value={formData.featuredImage}
                    onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                    aspectRatio="16/9"
                    maxWidth={1920}
                    maxHeight={1080}
                  />
                </div>

                <Input
                  label="Tags (phân cách bởi dấu phẩy)"
                  value={formData.tags}
                  onChange={(value) => setFormData({ ...formData, tags: value })}
                  placeholder="món ăn, công thức, tips"
                  fullWidth
                />

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: tokens.color.text, marginBottom: 8 }}>
                    Trạng thái
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })}
                    options={[
                      { value: 'DRAFT', label: 'Draft' },
                      { value: 'PUBLISHED', label: 'Published' },
                      { value: 'ARCHIVED', label: 'Archived' },
                    ]}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    padding: '16px 20px',
                    background: 'rgba(245,211,147,0.05)',
                    border: `1px solid ${formData.isFeatured ? tokens.color.primary : tokens.color.border}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245,211,147,0.08)';
                    e.currentTarget.style.borderColor = tokens.color.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245,211,147,0.05)';
                    e.currentTarget.style.borderColor = formData.isFeatured ? tokens.color.primary : tokens.color.border;
                  }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      style={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        accentColor: tokens.color.primary,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: formData.isFeatured ? tokens.color.primary : tokens.color.text,
                        marginBottom: 4,
                      }}>
                        <i className="ri-star-fill" style={{ marginRight: 6 }} />
                        Nổi bật trên trang chủ
                      </div>
                      <div style={{ fontSize: 12, color: tokens.color.muted }}>
                        Bài viết này sẽ hiển thị trong phần "Featured Blog Posts" ở trang Home
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: `1px solid ${tokens.color.border}` }}>
                <Button type="submit" fullWidth>
                  <i className={editingPost ? 'ri-save-line' : 'ri-add-line'} style={{ marginRight: 8 }} />
                  {editingPost ? 'Cập nhật' : 'Tạo Post'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseEditor} fullWidth>
                  <i className="ri-close-line" style={{ marginRight: 8 }} />
                  Hủy
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

