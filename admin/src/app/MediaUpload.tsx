import { useRef, useState } from 'react';

export function MediaUpload({ onUploaded }: { onUploaded: (asset: { id: string; url: string }) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const res = await fetch('http://localhost:4202/media', { method: 'POST', body: form, credentials: 'include' });
      if (!res.ok) throw new Error('Upload failed');
      const asset = (await res.json()) as { id: string; url: string };
      onUploaded(asset);
    } catch {
      setError('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button disabled={busy} onClick={pick} style={{ padding: '6px 10px', borderRadius: 6, background: '#111827', color: 'white', border: 0 }}>
          {busy ? 'Uploading…' : 'Upload image'}
        </button>
        {error && <span style={{ color: '#ef4444' }}>{error}</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) upload(f);
      }} />
    </div>
  );
}


