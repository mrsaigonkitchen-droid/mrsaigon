import { useEffect } from 'react';

export function TopBar({ onUndo, onRedo, onSave, onPublish, dirty }: { onUndo: () => void; onRedo: () => void; onSave: () => void; onPublish: () => void; dirty: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); onUndo(); }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); onRedo(); }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); onSave(); }
      if (mod && e.key === 'Enter') { e.preventDefault(); onPublish(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUndo, onRedo, onSave, onPublish]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={onUndo} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}>Undo</button>
      <button onClick={onRedo} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}>Redo</button>
      <button onClick={onSave} style={{ padding: '6px 10px', borderRadius: 6, background: '#111827', color: 'white', border: 0 }}>{dirty ? 'Save (dirty)' : 'Saved'}</button>
      <button onClick={onPublish} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}>Publish</button>
      <a href="#/" style={{ marginLeft: 'auto', color: '#111827', textDecoration: 'none' }}>View Site</a>
      <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}>Help</button>
    </div>
  );
}


