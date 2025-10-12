// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { tokens } from '@app/shared';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { staggerChildren } from '@app/ui';
import { useEffect, useState, lazy, Suspense } from 'react';
import { ToastContainer, useToast } from './components/Toast';
import { MobileMenu } from './components/MobileMenu';
import { ScrollProgress } from './components/ScrollProgress';
import { FloatingActions } from './sections/FloatingActions';
import { Header, type HeaderConfig } from './components/Header';
import { Footer, type FooterConfig } from './components/Footer';
import type { PageData, PageMeta, RouteType } from './types';

// Lazy load all pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then(m => ({ default: m.MenuPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const ImageHoverTest = lazy(() => import('./pages/ImageHoverTest').then(m => ({ default: m.ImageHoverTest })));

export function App() {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteType>(() => {
    const h = window.location.hash.replace('#/', '');
    if (h === 'menu' || h === 'about' || h === 'gallery' || h === 'contact' || h === 'blog') return h;
    if (h.startsWith('blog/')) return 'blog';
    if (h === 'test-hover') return 'test-hover'; // DEBUG route
    return 'home';
  });
  const [blogSlug, setBlogSlug] = useState<string>('');
  const { toasts, showToast, removeToast } = useToast();

  // Load header and footer config from localStorage as fallback (admin settings)
  const [headerConfigFromSettings, setHeaderConfigFromSettings] = useState<HeaderConfig | null>(null);
  const [footerConfigFromSettings, setFooterConfigFromSettings] = useState<FooterConfig | null>(null);

  useEffect(() => {
    // Only use localStorage if page data is not available yet (fallback)
    // Page data from API will override this via headerConfig/footerConfig fields
    if (!page) {
      const savedHeader = localStorage.getItem('headerConfig');
      const savedFooter = localStorage.getItem('footerConfig');
      if (savedHeader) {
        try {
          setHeaderConfigFromSettings(JSON.parse(savedHeader));
        } catch (e) {
          console.error('Failed to parse header config:', e);
        }
      }
      if (savedFooter) {
        try {
          setFooterConfigFromSettings(JSON.parse(savedFooter));
        } catch (e) {
          console.error('Failed to parse footer config:', e);
        }
      }
    } else {
      // Clear localStorage when page data is loaded (DB is source of truth now)
      if (localStorage.getItem('headerConfig') || localStorage.getItem('footerConfig')) {
        console.log('🗑️ Clearing old localStorage configs - using database now');
        localStorage.removeItem('headerConfig');
        localStorage.removeItem('footerConfig');
        setHeaderConfigFromSettings(null);
        setFooterConfigFromSettings(null);
      }
    }
  }, [page]);

  // Function to fetch page data
  const fetchPageData = () => {
    setLoading(true);
    
    // Mock data cho development (khi API chưa có data)
    const mockData = {
      id: '1',
      slug: 'home',
      title: 'Nhà Hàng Sang Trọng',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: '1',
          kind: 'HERO',
          order: 1,
          data: {
            title: 'Trải Nghiệm Ẩm Thực Đỉnh Cao',
            subtitle: 'Khám phá hương vị tinh tế với không gian sang trọng và dịch vụ chuyên nghiệp',
            imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
            ctaText: 'Đặt Bàn Ngay',
            ctaLink: '#/contact'
          }
        },
        {
          id: '2',
          kind: 'FEATURED_MENU',
          order: 2,
          data: {
            title: 'Thực Đơn Nổi Bật',
            items: [
              {
                name: 'Bò Bít Tết Úc',
                description: 'Thịt bò nhập khẩu, nướng hoàn hảo với sốt tiêu đen',
                price: '450.000đ',
                imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500'
              },
              {
                name: 'Hải Sản Nướng Bơ',
                description: 'Tôm hùm, sò điệp, cá hồi tươi nướng bơ tỏi',
                price: '650.000đ',
                imageUrl: 'https://images.unsplash.com/photo-1559737558-2fca2a4fb401?w=500'
              },
              {
                name: 'Pasta Truffle',
                description: 'Mì Ý sốt kem nấm truffle cao cấp',
                price: '380.000đ',
                imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500'
              }
            ]
          }
        },
        {
          id: '3',
          kind: 'CTA',
          order: 3,
          data: {
            title: 'Đặt Bàn Ngay Hôm Nay',
            description: 'Trải nghiệm ẩm thực đẳng cấp với ưu đãi đặc biệt cho khách hàng mới',
            buttonText: 'Liên Hệ Ngay',
            buttonLink: '#/contact'
          }
        }
      ]
    };

    // Thử fetch từ API, nếu không được thì dùng mock data
    fetch('http://localhost:4202/pages/home')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load content');
        return r.json();
      })
      .then((data) => {
        // Sort sections by order before setting state
        if (data?.sections) {
          data.sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        }
        setPage(data);
        setError(null);
        if (data?.title) document.title = `${data.title} — Restaurant`;
        // Toast notification removed for better UX
      })
      .catch((e) => {
        console.log('Using mock data (API not available)');
        setPage(mockData as any);
        setError(null);
        if (mockData?.title) document.title = `${mockData.title} — Restaurant`;
        // Toast notification removed for better UX
      })
      .finally(() => setLoading(false));
  };

  // Initial fetch
  useEffect(() => {
    fetchPageData();
  }, []);

  // Refetch when window gains focus (user returns from admin)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - refetching page data');
      fetchPageData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  function getMeta(pageData: PageData | null, currentRoute: RouteType): PageMeta {
    if (!pageData) return {};
    const baseTitle: string = pageData?.title ? `${pageData.title} — Restaurant` : 'Restaurant';
    const routeTitle = currentRoute === 'home' ? baseTitle : `${baseTitle} · ${currentRoute.toUpperCase()}`;
    // Prefer HERO.subtitle, then first CTA.description, then first RICH_TEXT text content
    const heroSub = pageData.sections?.find((s) => s.kind === 'HERO')?.data?.subtitle as string | undefined;
    const ctaDesc = pageData.sections?.find((s) => s.kind === 'CTA')?.data?.description as string | undefined;
    const richHtml = pageData.sections?.find((s) => s.kind === 'RICH_TEXT')?.data?.html as string | undefined;
    let desc = heroSub || ctaDesc;
    if (!desc && richHtml) {
      const div = document.createElement('div');
      div.innerHTML = richHtml;
      desc = div.textContent || div.innerText || undefined;
      if (desc) desc = desc.trim().slice(0, 160);
    }
    return { title: routeTitle, description: desc };
  }

  function setOgMeta(title?: string, description?: string) {
    const pairs: Array<[string, string]> = [
      ['og:title', title || 'Restaurant'],
      ['og:description', description || ''],
      ['twitter:title', title || 'Restaurant'],
      ['twitter:description', description || ''],
      ['twitter:card', 'summary_large_image'],
    ];
    const base = window.location.origin;
    const path = window.location.hash.replace('#', '') || '/';
    const canonical = base + path;
    setOrCreate('link[rel="canonical"]', 'href', canonical, () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      document.head.appendChild(l);
      return l as HTMLLinkElement;
    });
    for (const [name, content] of pairs) {
      setOrCreate(`meta[property='${name}'], meta[name='${name}']`, 'content', content, () => {
        const m = document.createElement('meta');
        if (name.startsWith('og:')) m.setAttribute('property', name); else m.setAttribute('name', name);
        document.head.appendChild(m);
        return m as HTMLMetaElement;
      });
    }
  }

  function setOrCreate(selector: string, attr: string, value: string, create: (el: Element | null) => HTMLElement) {
    let el = document.querySelector(selector) as HTMLElement | null;
    if (!el) el = create(el);
    el.setAttribute(attr, value);
  }

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace('#/', '');
      if (h === 'menu' || h === 'about' || h === 'gallery' || h === 'contact' || h === 'blog') {
        setRoute(h);
        setBlogSlug('');
      } else if (h === 'test-hover') {
        setRoute('test-hover'); // DEBUG route
        setBlogSlug('');
      } else if (h.startsWith('blog/')) {
        setRoute('blog');
        setBlogSlug(h.replace('blog/', ''));
      } else {
        setRoute('home');
        setBlogSlug('');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update meta tags when page or route changes
  useEffect(() => {
    if (!page) return;
    const { title, description } = getMeta(page, route);
    if (title) document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
    setOgMeta(title, description);
  }, [page, route]);
  const containerStyle: React.CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' };
  
  // Scroll progress indicator
  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, 2000], [0, 100]);

  return (
    <div style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Scroll Progress Bar */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${tokens.color.primary}, ${tokens.color.accent})`,
          transformOrigin: 'left',
          scaleX: useTransform(scrollProgress, [0, 100], [0, 1]),
          zIndex: 10001,
        }}
      />

      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Header - render from DATABASE FIRST (page config), then localStorage fallback */}
      <Header
        config={
          page?.headerConfig
            ? (typeof page.headerConfig === 'string'
                ? JSON.parse(page.headerConfig)
                : page.headerConfig)
            : (headerConfigFromSettings ?? {
                logo: {
                  text: page?.title ?? 'Restaurant',
                  icon: 'ri-restaurant-2-line',
                  animateIcon: true,
                },
              })
        }
        currentRoute={route}
        onNavigate={(r) => setRoute(r as RouteType)}
        mobileMenuComponent={
          <MobileMenu
            currentRoute={route}
            onNavigate={(r) => setRoute(r as RouteType)}
          />
        }
      />

      <main id="main" style={{ ...containerStyle, marginTop: 20 }}>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(11,12,15,0.98)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 20,
              zIndex: 9998,
            }}
          >
            {/* Simple Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: `4px solid ${tokens.color.border}`,
                borderTopColor: tokens.color.primary,
              }}
            />

            {/* Loading Text - Simple */}
            <div
              style={{
                color: tokens.color.text,
                fontSize: 16,
                fontFamily: tokens.font.display,
              }}
            >
              Đang tải...
            </div>
          </motion.div>
        )}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{
              padding: 60,
              textAlign: 'center',
              margin: '60px 0',
            }}
          >
            <i className="ri-error-warning-line" style={{ fontSize: 64, color: tokens.color.error, marginBottom: 20, display: 'block' }} />
            <h2 style={{ color: tokens.color.error, marginBottom: 12 }}>Không thể tải nội dung</h2>
            <p style={{ color: tokens.color.muted, marginBottom: 24 }}>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                background: `linear-gradient(135deg, ${tokens.color.primary} 0%, ${tokens.color.accent} 100%)`,
                color: '#111',
                border: 'none',
                borderRadius: tokens.radius.pill,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="ri-refresh-line" style={{ marginRight: 8 }} />
              Thử lại
            </motion.button>
          </motion.div>
        )}
        {!loading && !error && page && (
          <Suspense fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              flexDirection: 'column',
              gap: 20,
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: `3px solid ${tokens.color.border}`,
                  borderTopColor: tokens.color.primary,
                }}
              />
              <div style={{
                color: tokens.color.muted,
                fontSize: 14,
              }}>
                Đang tải...
              </div>
            </div>
          }>
            <motion.div variants={staggerChildren(0.15)} initial="initial" animate="animate">
              {route === 'home' && <HomePage page={page} />}
              {route === 'menu' && <MenuPage />}
              {route === 'gallery' && <GalleryPage />}
              {route === 'about' && <AboutPage page={page} />}
              {route === 'contact' && <ContactPage page={page} />}
            </motion.div>
          </Suspense>
        )}
        <Suspense fallback={null}>
          {route === 'test-hover' && <ImageHoverTest />}
          {route === 'blog' && !blogSlug && <BlogPage />}
          {route === 'blog' && blogSlug && (
            <BlogDetailPage slug={blogSlug} onBack={() => window.location.hash = '#/blog'} />
          )}
        </Suspense>
      </main>

      {/* Footer - render from DATABASE FIRST (page config), then localStorage fallback */}
      <Footer
        config={(() => {
          // Get footer config from DATABASE first, then settings
          let footerConfig = page?.footerConfig
            ? (typeof page.footerConfig === 'string'
                ? JSON.parse(page.footerConfig)
                : page.footerConfig)
            : (footerConfigFromSettings ?? {
                brand: {
                  text: page?.title ?? 'Restaurant',
                  icon: 'ri-restaurant-2-fill',
                },
                copyright: {
                  text: `© ${new Date().getFullYear()} ${page?.title ?? 'Restaurant'}. All rights reserved.`,
                },
              });

          // Sync logo from header config (DB) if footer doesn't have one
          const headerConfigFromDB = page?.headerConfig 
            ? (typeof page.headerConfig === 'string' ? JSON.parse(page.headerConfig) : page.headerConfig)
            : null;
          
          if (footerConfig && !footerConfig.brand?.imageUrl && headerConfigFromDB?.logo?.imageUrl) {
            footerConfig = {
              ...footerConfig,
              brand: {
                ...footerConfig.brand,
                imageUrl: headerConfigFromDB.logo.imageUrl,
              },
            };
          }

          return footerConfig;
        })()}
      />

      {/* Floating Action Button Menu - Render from sections data */}
      {!loading && !error && page && (
        <>
          {page.sections
            ?.filter((s) => s.kind === 'FAB_ACTIONS')
            .map((s) => {
              const fabData = typeof s.data === 'string' ? JSON.parse(s.data) : (s.data || {});
              return <FloatingActions key={s.id} data={fabData} />;
            })}
        </>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
