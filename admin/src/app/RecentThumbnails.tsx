import { useRecentUploads } from './RecentUploads';

function getMediaUrl(path: string): string {
  // API returns url like /media/<filename>
  if (path.startsWith('http')) return path;
  return `http://localhost:4202${path}`;
}

export function RecentThumbnails({ onPick }: { onPick?: (id: string) => void }) {
  const { items } = useRecentUploads();
  if (!items.length) return <div style={{ color: '#6b7280' }}>Chưa có ảnh nào. Hãy upload ở tab Media.</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
      {items.map((a) => (
        <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
          <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 6, background: '#f3f4f6', marginBottom: 6 }}>
            <img src={getMediaUrl(a.url)} alt={a.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ padding: '4px 8px' }} onClick={async () => { await navigator.clipboard?.writeText(a.id); }}>
              Copy ID
            </button>
            {onPick && (
              <button style={{ padding: '4px 8px' }} onClick={() => onPick(a.id)}>
                Use
              </button>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>{a.id}</div>
        </div>
      ))}
    </div>
  );
}


