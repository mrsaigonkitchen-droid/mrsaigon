import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { OptimizedImage } from '../components/OptimizedImage';
import { blogAPI } from '../api';

interface FeaturedBlogPostsData {
  title?: string;
  subtitle?: string;
  limit?: number; // max posts to show, default 3
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: {
    name: string;
    slug: string;
    color: string | null;
  };
  author: {
    name: string;
  };
  publishedAt: string;
  _count: {
    comments: number;
  };
}

export function FeaturedBlogPosts({ data }: { data: FeaturedBlogPostsData }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const limit = data.limit || 3;

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await blogAPI.getPosts({ status: 'PUBLISHED', limit: 20 });
      // Filter featured posts - assuming API will be updated to support isFeatured
      // For now, just take the first N posts
      setPosts(allPosts.slice(0, limit));
    } catch (error) {
      console.error('Failed to load featured blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:4202${url}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  if (posts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        margin: '80px 0',
        padding: '0 16px',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
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

      {/* Blog Posts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'rgba(12,12,16,0.7)',
              borderRadius: tokens.radius.lg,
              overflow: 'hidden',
              border: `1px solid ${tokens.color.border}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            whileHover={{ y: -8 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245,211,147,0.3)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(245,211,147,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.color.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => {
              window.location.href = `/blog/${post.slug}`;
            }}
          >
            {/* Featured Image */}
            {post.featuredImage && (
              <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                <OptimizedImage
                  src={getImageUrl(post.featuredImage)}
                  alt={post.title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLImageElement).style.transform = 'scale(1)';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div style={{ padding: 24 }}>
              {/* Category Badge */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: tokens.radius.pill,
                  background: post.category.color 
                    ? `${post.category.color}20`
                    : 'rgba(245,211,147,0.1)',
                  color: post.category.color || tokens.color.primary,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {post.category.name}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: tokens.color.text,
                  marginBottom: 12,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p
                  style={{
                    fontSize: 14,
                    color: tokens.color.muted,
                    lineHeight: 1.6,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: `1px solid ${tokens.color.border}`,
                  fontSize: 13,
                  color: tokens.color.muted,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ri-user-line" />
                  <span>{post.author.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ri-calendar-line" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  {post._count.comments > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ri-chat-3-line" />
                      <span>{post._count.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        style={{
          textAlign: 'center',
          marginTop: 48,
        }}
      >
        <a
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 32px',
            background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
            color: '#111',
            textDecoration: 'none',
            borderRadius: tokens.radius.pill,
            fontSize: 16,
            fontWeight: 700,
            boxShadow: tokens.shadow.lg,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>Xem tất cả bài viết</span>
          <i className="ri-arrow-right-line" />
        </a>
      </motion.div>
    </motion.section>
  );
}

