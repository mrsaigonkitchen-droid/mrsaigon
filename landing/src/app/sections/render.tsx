import { lazy, Suspense } from 'react';
import type { Section } from '../types';
import { tokens } from '@app/shared';
import ReactMarkdown from 'react-markdown';

// Lazy load all sections for better performance
const EnhancedHero = lazy(() => import('./EnhancedHero').then(m => ({ default: m.EnhancedHero })));
const EnhancedTestimonials = lazy(() => import('./EnhancedTestimonials').then(m => ({ default: m.EnhancedTestimonials })));
const StatsSection = lazy(() => import('./StatsSection').then(m => ({ default: m.StatsSection })));
const SpecialOffers = lazy(() => import('./SpecialOffers').then(m => ({ default: m.SpecialOffers })));
const ReservationForm = lazy(() => import('./ReservationForm').then(m => ({ default: m.ReservationForm })));
const ContactInfo = lazy(() => import('./ContactInfo').then(m => ({ default: m.ContactInfo })));
const GallerySlideshow = lazy(() => import('./GallerySlideshow').then(m => ({ default: m.GallerySlideshow })));
const Gallery = lazy(() => import('./Gallery').then(m => ({ default: m.Gallery })));
const FeaturedMenu = lazy(() => import('./FeaturedMenu').then(m => ({ default: m.FeaturedMenu })));
const FeaturedBlogPosts = lazy(() => import('./FeaturedBlogPosts').then(m => ({ default: m.FeaturedBlogPosts })));
const OpeningHours = lazy(() => import('./OpeningHours').then(m => ({ default: m.OpeningHours })));
const SocialMedia = lazy(() => import('./SocialMedia').then(m => ({ default: m.SocialMedia })));
const Features = lazy(() => import('./Features').then(m => ({ default: m.Features })));
const MissionVision = lazy(() => import('./MissionVision').then(m => ({ default: m.MissionVision })));
const FooterSocial = lazy(() => import('./FooterSocial').then(m => ({ default: m.FooterSocial })));

// Loading fallback component
const SectionLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    opacity: 0.5,
  }}>
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: `3px solid ${tokens.color.border}`,
      borderTopColor: tokens.color.primary,
      animation: 'spin 0.8s linear infinite',
    }} />
  </div>
);

/**
 * Central section renderer
 * Matches section types defined in admin/src/app/types.ts
 */
export function renderSection(section: Section) {
  // Parse JSON data if it's a string
  const data = typeof section.data === 'string' 
    ? JSON.parse(section.data) 
    : (section.data || {});

  switch (section.kind) {
    case 'HERO':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <EnhancedHero data={data} />
        </Suspense>
      );

    case 'GALLERY':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <Gallery data={data} />
        </Suspense>
      );

    case 'FEATURED_MENU':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <FeaturedMenu data={data} />
        </Suspense>
      );

    case 'TESTIMONIALS':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <EnhancedTestimonials data={data} />
        </Suspense>
      );

    case 'STATS':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <StatsSection data={data} />
        </Suspense>
      );

    case 'SPECIAL_OFFERS':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <SpecialOffers data={data} />
        </Suspense>
      );

    case 'RESERVATION_FORM':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <ReservationForm data={data} />
        </Suspense>
      );

    case 'CONTACT_INFO':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <ContactInfo data={data} />
        </Suspense>
      );

    case 'GALLERY_SLIDESHOW':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <GallerySlideshow data={data} />
        </Suspense>
      );

    case 'FEATURED_BLOG_POSTS':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <FeaturedBlogPosts data={data} />
        </Suspense>
      );

    case 'OPENING_HOURS':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <OpeningHours data={data} />
        </Suspense>
      );

    case 'SOCIAL_MEDIA':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <SocialMedia data={data} />
        </Suspense>
      );

    case 'FEATURES':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <Features data={data} />
        </Suspense>
      );

    case 'MISSION_VISION':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <MissionVision data={data} />
        </Suspense>
      );

    case 'FAB_ACTIONS':
      // FAB is rendered separately in app.tsx with fixed position
      // Don't render it in page flow to avoid layout issues
      return null;

    case 'FOOTER_SOCIAL':
      return (
        <Suspense key={section.id} fallback={<SectionLoader />}>
          <FooterSocial data={data} />
        </Suspense>
      );

    case 'RICH_TEXT':
      return (
        <section 
          key={section.id}
          style={{
            padding: '60px 20px',
            background: tokens.color.background,
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: '0 auto',
              lineHeight: 1.8,
              color: tokens.color.text,
              fontSize: 16,
            }}
            className="markdown-content"
          >
            <ReactMarkdown>{data.content || ''}</ReactMarkdown>
          </div>
        </section>
      );

    case 'BANNER':
      return (
        <div
          key={section.id}
          style={{
            padding: 16,
            background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
            color: '#111',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 15,
            borderRadius: tokens.radius.md,
            marginBottom: 20,
          }}
        >
          {data.href ? (
            <a
              href={data.href}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {data.text}
            </a>
          ) : (
            data.text
          )}
        </div>
      );

    case 'CTA':
      return (
        <div
          key={section.id}
          style={{
            padding: '60px 40px',
            background: `linear-gradient(135deg, ${tokens.color.surface}, rgba(19,19,22,0.8))`,
            borderRadius: tokens.radius.xl,
            border: `2px solid ${tokens.color.primary}40`,
            textAlign: 'center',
            margin: '40px 0',
          }}
        >
          {data.title && (
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                color: tokens.color.primary,
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              {data.title}
            </h2>
          )}
          {data.description && (
            <p
              style={{
                fontSize: 18,
                color: tokens.color.muted,
                marginBottom: 32,
                maxWidth: 600,
                margin: '0 auto 32px',
                lineHeight: 1.7,
              }}
            >
              {data.description}
            </p>
          )}
          {data.buttonText && (
            <a
              href={data.buttonLink || '#'}
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                color: '#111',
                textDecoration: 'none',
                borderRadius: tokens.radius.pill,
                fontSize: 18,
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
              {data.buttonText}
            </a>
          )}
        </div>
      );

    default:
      // Silently skip unknown/unsupported section types
      // This prevents errors when admin creates new section types
      // that landing hasn't implemented yet
      return null;
  }
}


