import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardImage } from './OptimizedImage';
import { blogAPI } from '../api';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: {
    name: string;
    color: string | null;
  };
  publishedAt: string;
}

interface RelatedPostsProps {
  currentPostId: string;
  categoryId?: string;
  limit?: number;
  onPostClick: (slug: string) => void;
}

/**
 * RelatedPosts Component
 * 
 * Shows related posts from the same category
 * Features:
 * - Auto-fetch based on category
 * - Horizontal card layout
 * - Smooth animations
 * - Click to navigate
 */
export function RelatedPosts({
  currentPostId,
  categoryId,
  limit = 3,
  onPostClick
}: RelatedPostsProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, categoryId]);

  const loadRelatedPosts = async () => {
    try {
      setLoading(true);
      const data = await blogAPI.getPosts({
        status: 'PUBLISHED',
        limit: limit + 1, // Get one extra to exclude current
      });
      
      // Filter out current post and limit results
      const filtered = data
        .filter((post: RelatedPost) => post.id !== currentPostId)
        .slice(0, limit);
      
      setPosts(filtered);
    } catch (error) {
      console.error('Failed to load related posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadTime = (text: string | null) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(18,18,22,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: 'clamp(24px, 5vw, 40px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto',
            border: '3px solid rgba(245,211,147,0.2)',
            borderTopColor: '#f5d393',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Đang tải bài viết liên quan...
          </p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show section if no related posts
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'rgba(18,18,22,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: 'clamp(24px, 5vw, 40px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        marginTop: '48px'
      }}
    >
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245,211,147,0.2), rgba(239,182,121,0.1))',
          border: '1px solid rgba(245,211,147,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245,211,147,0.2)'
        }}>
          <i className="ri-article-line" style={{ fontSize: '28px', color: '#f5d393' }} />
        </div>
        <div>
          <h3 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            marginBottom: '4px'
          }}>
            Bài viết liên quan
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            margin: 0
          }}>
            Khám phá thêm nội dung thú vị
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(16px, 3vw, 24px)'
      }}>
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{
              y: -8,
              borderColor: 'rgba(245,211,147,0.4)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4), 0 0 20px rgba(245,211,147,0.15)'
            }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
            onClick={() => onPostClick(post.slug)}
          >
            {/* Featured Image */}
            <div style={{ position: 'relative', height: '176px', background: '#111827', overflow: 'hidden' }}>
              {post.featuredImage ? (
                <div style={{ width: '100%', height: '100%', transition: 'transform 0.7s', overflow: 'hidden' }}>
                  <CardImage
                    src={post.featuredImage}
                    alt={post.title}
                    style={{ aspectRatio: '16/9' }}
                  />
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1f2937, #111827)'
                }}>
                  <i className="ri-image-line" style={{ fontSize: '48px', color: '#374151' }} />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                background: 'linear-gradient(to top, rgba(18,18,22,0.56), transparent, transparent)'
              }} />
              
              {/* Category Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backdropFilter: 'blur(12px)',
                  background: `linear-gradient(135deg, ${post.category.color || '#f5d393'}dd, ${post.category.color || '#efb679'}bb)`,
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: `0 2px 12px ${post.category.color || '#f5d393'}50`
                }}
              >
                {post.category.name}
              </div>

              {/* Read Time */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backdropFilter: 'blur(12px)',
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'white',
                fontSize: '12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <i className="ri-time-line" style={{ fontSize: '12px' }} />
                <span style={{ fontWeight: 600 }}>{calculateReadTime(post.excerpt)}</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              <h4 style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
                fontWeight: 700,
                color: 'white',
                marginBottom: '12px',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.title}
              </h4>

              {post.excerpt && (
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.excerpt}
                </p>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <motion.div
                  whileHover={{ x: 4 }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(245,211,147,0.1)',
                    border: '1px solid rgba(245,211,147,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f5d393'
                  }}
                >
                  <i className="ri-arrow-right-line" style={{ fontSize: '16px' }} />
                </motion.div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
