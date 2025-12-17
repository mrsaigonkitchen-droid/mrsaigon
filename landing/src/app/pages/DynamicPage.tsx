import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { renderSection } from '../sections/render';
import type { PageData } from '../types';

export function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:4202/pages/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Page not found: ${slug}`);
        }
        return res.json();
      })
      .then((data) => {
        setPage(data);
      })
      .catch((err) => {
        console.error(`Failed to fetch page ${slug}:`, err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `3px solid ${tokens.color.border}`,
            borderTopColor: tokens.color.primary,
          }}
        />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div
        style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <i className="ri-error-warning-line" style={{ fontSize: 64, color: tokens.color.primary }} />
        <h1 style={{ fontSize: 24, color: tokens.color.text, margin: 0 }}>
          Trang không tồn tại
        </h1>
        <p style={{ color: tokens.color.textMuted, margin: 0 }}>
          Trang "{slug}" không được tìm thấy hoặc đã bị xóa.
        </p>
        <a
          href="/"
          style={{
            marginTop: 16,
            padding: '12px 24px',
            background: tokens.color.primary,
            color: '#111',
            borderRadius: tokens.radius.md,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Về trang chủ
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title (optional) */}
      {page.title && (
        <div
          style={{
            padding: '60px 20px 40px',
            textAlign: 'center',
            background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)`,
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700,
              color: tokens.color.text,
              margin: 0,
            }}
          >
            {page.title}
          </motion.h1>
        </div>
      )}

      {/* Render all sections */}
      {page.sections && page.sections.length > 0 ? (
        page.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => renderSection(section))
      ) : (
        <div
          style={{
            minHeight: '30vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.color.textMuted,
          }}
        >
          <p>Trang này chưa có nội dung.</p>
        </div>
      )}
    </div>
  );
}

export default DynamicPage;
