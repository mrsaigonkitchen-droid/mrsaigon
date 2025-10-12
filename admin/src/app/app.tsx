import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PagesPage } from './pages/PagesPage';
import { SectionsPage } from './pages/SectionsPage';
import { MenuPage } from './pages/MenuPage';
import { MediaPage } from './pages/MediaPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { LivePreviewPage } from './pages/LivePreviewPage';
import { BlogCategoriesPage } from './pages/BlogCategoriesPage';
import { BlogPostsPage } from './pages/BlogPostsPage';
import { SpecialOffersPage } from './pages/SpecialOffersPage';
import { SettingsPage } from './pages/SettingsPage';
import { useUser, store } from './store';
import { authApi } from './api';
import type { RouteType } from './types';

// Parse URL hash to route
function parseHash(): { route: RouteType; slug?: string } {
  const hash = window.location.hash.replace('#/', '');
  if (!hash || hash === 'dashboard') return { route: 'dashboard' };
  
  const [routePart, slugPart] = hash.split('/');
  const validRoutes: RouteType[] = [
    'dashboard', 'pages', 'sections', 'menu', 'media', 
    'reservations', 'preview', 'offers', 'blog-categories', 
    'blog-posts', 'settings'
  ];
  
  if (validRoutes.includes(routePart as RouteType)) {
    return { 
      route: routePart as RouteType, 
      slug: slugPart || (routePart === 'sections' ? 'home' : undefined)
    };
  }
  
  return { route: 'dashboard' };
}

// Update URL hash when route changes
function updateHash(newRoute: RouteType, slug?: string) {
  if (newRoute === 'dashboard') {
    window.location.hash = '#/dashboard';
  } else if (slug) {
    window.location.hash = `#/${newRoute}/${slug}`;
  } else {
    window.location.hash = `#/${newRoute}`;
  }
}

export function App() {
  const user = useUser();
  const initialState = parseHash();
  const [route, setRoute] = useState<RouteType>(initialState.route);
  const [pageSlug, setPageSlug] = useState<string>(initialState.slug || 'home');
  const [loading, setLoading] = useState(true);

  // Listen to hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const { route: newRoute, slug } = parseHash();
      setRoute(newRoute);
      if (slug) setPageSlug(slug);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle navigation with page context
  function handleNavigate(newRoute: RouteType, slug?: string) {
    setRoute(newRoute);
    if (slug) {
      setPageSlug(slug);
    } else if (newRoute === 'sections' && !slug) {
      // Default to home when navigating to sections without a specific page
      setPageSlug('home');
    }
    
    // Update URL hash
    updateHash(newRoute, slug);
  }

	useEffect(() => {
    // Check if user is already logged in
    authApi
      .me()
      .then((userData) => {
        store.setUser(userData as any);
      })
      .catch(() => {
        // Not logged in
      })
      .finally(() => {
        setLoading(false);
		});
	}, []);

  async function handleLogout() {
    try {
      await authApi.logout();
      store.setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  if (loading) {
	return (
      <div
								style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0c0f',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#f5d393',
          }}
        />
		</div>
	);
}

  if (!user) {
    return <LoginPage />;
  }

	return (
    <Layout 
      currentRoute={route} 
      currentPageSlug={pageSlug}
      onNavigate={handleNavigate} 
      onLogout={handleLogout} 
      userEmail={user.email}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {route === 'dashboard' && <DashboardPage />}
          {route === 'pages' && <PagesPage onNavigateToSections={(slug) => handleNavigate('sections', slug)} />}
          {route === 'sections' && <SectionsPage pageSlug={pageSlug} />}
          {route === 'menu' && <MenuPage />}
          {route === 'media' && <MediaPage />}
          {route === 'reservations' && <ReservationsPage />}
          {route === 'preview' && <LivePreviewPage />}
          {route === 'offers' && <SpecialOffersPage />}
          {route === 'blog-categories' && <BlogCategoriesPage />}
          {route === 'blog-posts' && <BlogPostsPage />}
          {route === 'settings' && <SettingsPage />}
        </motion.div>
      </AnimatePresence>
    </Layout>
	);
}

export default App;
