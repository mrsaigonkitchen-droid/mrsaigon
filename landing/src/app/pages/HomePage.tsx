import { renderSection } from '../sections/render';
import type { PageData } from '../types';

export function HomePage({ page }: { page: PageData }) {
  // Sort sections by order and filter out empty/null renders
  const sortedSections = [...(page.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return (
    <>
      {sortedSections.map((s) => {
        const rendered = renderSection(s);
        // Skip null/empty sections to prevent blank spaces
        if (!rendered) return null;
        return <section key={s.id}>{rendered}</section>;
      })}
    </>
  );
}


