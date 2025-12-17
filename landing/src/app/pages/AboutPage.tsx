import { Component, ReactNode } from 'react';
import { LazySection } from '../components/LazySection';
import { renderSection } from '../sections/render';
import type { PageData } from '../types';

// Error boundary to catch section render errors
class SectionErrorBoundary extends Component<
  { children: ReactNode; sectionId: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; sectionId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Section ${this.props.sectionId} error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export function AboutPage({ page }: { page: PageData }) {
  return (
    <section style={{ 
      minHeight: '100vh',
      background: 'transparent',
      paddingTop: 80
    }}>
      {/* Render sections from page data */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 24px'
      }}>
        {page.sections
            ?.filter((s) => 
              s.kind !== 'FAB_ACTIONS' // FAB rendered separately in app.tsx
            )
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((s, index) => {
              // Lazy load sections after first 2
              const shouldLazy = index >= 2;
              const content = (
                <SectionErrorBoundary sectionId={s.id}>
                  <div style={{ marginBottom: 40 }}>{renderSection(s)}</div>
                </SectionErrorBoundary>
              );
              
              return shouldLazy ? (
                <LazySection key={s.id} rootMargin="300px">
                  {content}
                </LazySection>
              ) : (
                <div key={s.id}>{content}</div>
              );
            })}
      </div>
    </section>
  );
}
