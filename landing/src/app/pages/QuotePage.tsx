import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { renderSection } from '../sections/render';
import type { Section, PageData } from '../types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite provides import.meta.env
const API_URL = (import.meta as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:4202';

// Default QUOTE_CALCULATOR section data (used when no CMS page exists)
const defaultQuoteCalculatorSection: Section = {
  id: 'default-quote-calculator',
  kind: 'QUOTE_CALCULATOR',
  order: 1,
  data: {
    title: 'Báo Giá & Dự Toán',
    subtitle: 'Tính toán chi phí cải tạo nhà nhanh chóng và chính xác',
    defaultTab: 'calculator',
    calculatorTab: {
      label: 'Dự Toán Nhanh',
      icon: 'ri-calculator-line',
    },
    consultationTab: {
      label: 'Đăng Ký Tư Vấn',
      icon: 'ri-phone-line',
      title: 'Đăng Ký Tư Vấn Trực Tiếp',
      subtitle: 'Để lại thông tin, chúng tôi sẽ liên hệ bạn trong 24h',
      buttonText: 'Đăng Ký Tư Vấn',
      successMessage: 'Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.',
    },
    showMaterials: true,
    maxWidth: 900,
  },
};

export function QuotePage() {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch page data from CMS
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${API_URL}/pages/bao-gia`);
        if (res.ok) {
          const data = await res.json();
          setPage(data);
        }
      } catch {
        // Use default if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 50, height: 50, borderRadius: '50%', border: `3px solid ${tokens.color.border}`, borderTopColor: tokens.color.primary }}
        />
      </div>
    );
  }

  // Get sections from CMS page or use default
  const sections = page?.sections && page.sections.length > 0
    ? page.sections.sort((a, b) => a.order - b.order)
    : [defaultQuoteCalculatorSection];

  return (
    <div style={{ paddingTop: '4rem' }}>
      {sections.map((section) => renderSection(section))}
    </div>
  );
}

export default QuotePage;
