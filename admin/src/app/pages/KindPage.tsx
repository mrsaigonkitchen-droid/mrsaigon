import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionFormFactory, FormKind } from '../forms/SectionForms';
import { useRecentUploads } from '../RecentUploads';
import type { Page, Section } from '../types';

export function KindPage({ kind }: { kind: FormKind }) {
  const [page, setPage] = useState<Page | null>(null);
  const { items } = useRecentUploads();
  const idToUrl = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i.url])), [items]);
  useEffect(() => {
    fetch('http://localhost:4202/pages/home').then(r=>r.json()).then(setPage);
  }, []);
  const refresh = async () => {
    const refreshed = await fetch('http://localhost:4202/pages/home').then(r=>r.json());
    setPage(refreshed);
  };
  const onlyKind: Section[] = (page?.sections ?? []).filter((s) => s.kind === kind);

  function getMediaIdsFromSection(section: Section): string[] {
    try {
      const data = section.data as Record<string, unknown>;
      if (section.kind === 'HERO') {
        const id = data?.backgroundMediaId as string | undefined;
        return id ? [id] : [];
      }
      if (section.kind === 'FEATURED_MENU') {
        const items = data?.items as Array<{ mediaId?: string }> | undefined;
        const id = items?.[0]?.mediaId;
        return id ? [id] : [];
      }
      if (section.kind === 'BANNER') {
        const id = data?.mediaId as string | undefined;
        return id ? [id] : [];
      }
      if (section.kind === 'GALLERY') {
        const arr = (data?.items ?? []) as Array<{ mediaId?: string }>;
        return arr.map((i) => i.mediaId).filter(Boolean) as string[];
      }
      return [];
    } catch {
      return [];
    }
  }

  const draggingIndex = useRef<number | null>(null);
  async function commitReorder(newList: Section[]) {
    // Reindex order starting at 1 for this kind subset, preserving other kinds
    await Promise.all(newList.map((s, idx) => fetch(`http://localhost:4202/sections/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ order: idx + 1 })
    })));
    await refresh();
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ color: '#6b7280' }}>Quản lý loại: {kind}</div>
      <SectionFormFactory kind={kind} onSubmit={async (data) => {
        await fetch('http://localhost:4202/pages/home/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ kind, data })
        });
        await refresh();
      }} />
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {onlyKind
            .sort((a, b) => a.order - b.order)
            .map((s, index) => {
              const urls = getMediaIdsFromSection(s)
                .map((id) => idToUrl[id])
                .filter(Boolean)
                .map((u) => (u.startsWith('http') ? u : `http://localhost:4202${u}`));
              return (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => (draggingIndex.current = index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async () => {
                    if (draggingIndex.current === null) return;
                    const from = draggingIndex.current;
                    const to = index;
                    if (from === to) return;
                    const list = [...onlyKind].sort((a, b) => a.order - b.order);
                    const [moved] = list.splice(from, 1);
                    list.splice(to, 0, moved);
                    await commitReorder(list);
                    draggingIndex.current = null;
                  }}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#0b1220', color: '#e5e7eb', padding: 8, borderRadius: 6 }}
                >
                  <span style={{ minWidth: 36, color: '#93a3b8' }}>#{s.order}</span>
                  <span style={{ minWidth: 120, padding: '2px 8px', borderRadius: 9999, background: '#111827', border: '1px solid #1f2937' }}>{s.kind}</span>
                  {urls.length > 0 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {urls.slice(0, 3).map((u, i) => (
                        <img key={i} src={u} alt={`preview-${i}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          {onlyKind.length === 0 && <div style={{ color: '#6b7280' }}>Chưa có section nào cho loại này.</div>}
        </div>
      </div>
    </div>
  );
}


