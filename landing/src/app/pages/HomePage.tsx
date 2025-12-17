import { Component, ReactNode } from 'react';
import { renderSection } from '../sections/render';
import { LazySection } from '../components/LazySection';
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
      // Return empty div instead of crashing the whole page
      return null;
    }
    return this.props.children;
  }
}

export function HomePage({ page }: { page: PageData }) {
  // Sort sections by order and filter out empty/null renders
  const sortedSections = [...(page.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return (
    <>
      {sortedSections.map((s, index) => {
        // First 2 sections: render immediately (Hero + first content section)
        // Rest: lazy load on scroll for better initial load performance
        const shouldLazy = index >= 2;
        
        const content = (
          <SectionErrorBoundary sectionId={s.id}>
            {renderSection(s)}
          </SectionErrorBoundary>
        );
        
        return shouldLazy ? (
          <LazySection key={s.id} rootMargin="300px">
            <section>{content}</section>
          </LazySection>
        ) : (
          <section key={s.id}>{content}</section>
        );
      })}
    </>
  );
}


