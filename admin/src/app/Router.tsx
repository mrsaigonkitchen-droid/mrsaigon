import { useEffect, useState } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'kind', kind: 'HERO'|'GALLERY'|'FEATURED_MENU'|'CTA'|'TESTIMONIALS'|'RICH_TEXT'|'BANNER' };

function parseHash(): Route {
  const h = window.location.hash.replace('#/', '');
  if (!h) return { name: 'dashboard' };
  const [seg, param] = h.split('/');
  type KindType = Extract<Route, { name: 'kind' }>['kind'];
  const validKinds: KindType[] = ['HERO', 'GALLERY', 'FEATURED_MENU', 'CTA', 'TESTIMONIALS', 'RICH_TEXT', 'BANNER'];
  if (seg === 'kind' && param && validKinds.includes(param as KindType)) {
    return { name: 'kind', kind: param as KindType };
  }
  return { name: 'dashboard' };
}

export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parseHash());
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (r: Route) => {
    if (r.name === 'dashboard') window.location.hash = '#/';
    if (r.name === 'kind') window.location.hash = `#/kind/${r.kind}`;
  };
  return [route, navigate];
}


