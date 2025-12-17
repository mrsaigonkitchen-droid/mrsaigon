import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { CategoriesTab } from './CategoriesTab';
import { PostsTab } from './PostsTab';
import { BLOG_TABS, BlogTabType } from './types';

export function BlogManagerPage() {
  const [activeTab, setActiveTab] = useState<BlogTabType>('posts');

  const handleTabChange = useCallback((tab: BlogTabType) => {
    setActiveTab(tab);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoriesTab />;
      case 'posts':
        return <PostsTab />;
      default:
        return <PostsTab />;
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          background: 'rgba(12,12,16,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '24px 28px',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#0b0c0f',
          }}
        >
          <i className="ri-quill-pen-line" />
        </div>
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: tokens.color.text,
              margin: 0,
              background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Blog Manager
          </h1>
          <p style={{ color: tokens.color.muted, fontSize: 14, margin: '4px 0 0 0' }}>
            Quản lý categories và bài viết blog
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          background: 'rgba(12,12,16,0.5)',
          padding: 6,
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {BLOG_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 20px',
              background: activeTab === tab.id
                ? `linear-gradient(135deg, ${tokens.color.primary}20, ${tokens.color.accent}10)`
                : 'transparent',
              border: activeTab === tab.id
                ? `1px solid ${tokens.color.primary}40`
                : '1px solid transparent',
              borderRadius: '10px',
              color: activeTab === tab.id ? tokens.color.primary : tokens.color.muted,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            <i className={tab.icon} style={{ fontSize: 18 }} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}

export default BlogManagerPage;
