import { useMemo, useState } from 'react';
import type { Section } from './types';
import { getSchema } from './schemas';
import { useRecentUploads } from './RecentUploads';

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

function mediaUrlFromRecent(id: string | undefined, idToUrl: Record<string, string>): string | undefined {
  if (!id) return undefined;
  const url = idToUrl[id];
  if (!url) return undefined;
  return url.startsWith('http') ? url : `http://localhost:4202${url}`;
}

export function SectionInspector({ section, onRefresh, onOrderChange, onDelete, onEdit }: {
  section: Section;
  onRefresh: () => Promise<void> | void;
  onOrderChange: (delta: number) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onEdit: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<'preview' | 'data' | 'actions'>('preview');
  const { items } = useRecentUploads();
  const idToUrl = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i.url])), [items]);
  const mediaIds = getMediaIdsFromSection(section);
  const mediaUrls = mediaIds
    .map((id) => ({ id, url: mediaUrlFromRecent(id, idToUrl) }))
    .filter((x) => !!x.url) as Array<{ id: string; url: string }>;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Inspector</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { k: 'preview', label: 'Preview' },
            { k: 'data', label: 'Data' },
            { k: 'actions', label: 'Actions' },
          ] as const).map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: tab === t.k ? '#111827' : 'white', color: tab === t.k ? 'white' : '#111827' }}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === 'preview' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: '#6b7280' }}>Kind: {section.kind} — Order: {section.order}</div>
          {mediaUrls.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {mediaUrls.map((m) => (
                <div key={m.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                  <img src={m.url} alt={m.id} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{m.id}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280' }}>Không có ảnh liên kết hoặc ảnh chưa nằm trong danh sách Recent uploads.</div>
          )}
        </div>
      )}

      {tab === 'data' && (
        <InlineEditor section={section} onSaved={onRefresh} />
      )}

      {tab === 'actions' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => onOrderChange(-1)} style={{ padding: '6px 10px' }}>Move Up</button>
          <button onClick={() => onOrderChange(+1)} style={{ padding: '6px 10px' }}>Move Down</button>
          <button onClick={() => onEdit()} style={{ padding: '6px 10px' }}>Edit</button>
          <button onClick={() => onDelete()} style={{ padding: '6px 10px', color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>Delete</button>
          <button onClick={() => onRefresh()} style={{ padding: '6px 10px' }}>Refresh</button>
        </div>
      )}
    </div>
  );
}

function InlineEditor({ section, onSaved }: { section: Section; onSaved: () => Promise<void> | void }) {
  const [value, setValue] = useState<string>(JSON.stringify(section.data, null, 2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ color: '#6b7280' }}>Chỉnh sửa JSON</div>
      <textarea rows={14} value={value} onChange={(e)=>setValue(e.target.value)} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button disabled={busy} onClick={async () => {
          setBusy(true); setError(null);
          try {
            const raw = JSON.parse(value);
            const schema = getSchema(section.kind);
            const parsed = schema.parse(raw);
            await fetch(`http://localhost:4202/sections/${section.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ data: parsed }) });
            await onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}>Save</button>
        {error && <span style={{ color: '#ef4444' }}>{error}</span>}
      </div>
    </div>
  );
}


