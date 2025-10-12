import { useState } from 'react';
import { getSchema } from './schemas';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Section } from './types';

export function SectionList({ sections, onRefresh, onSelect }: { sections: Section[]; onRefresh: () => Promise<void> | void; onSelect?: (s: Section) => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const editData = async (id: string) => {
    const current = sections.find((s) => s.id === id);
    if (!current) return;
    const json = prompt('Edit JSON payload for this section', JSON.stringify(current.data, null, 2));
    if (!json) return;
    try {
      const parsedRaw = JSON.parse(json);
      const parsed = getSchema(current.kind).parse(parsedRaw);
      setBusyId(id);
      await fetch(`http://localhost:4202/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: parsed }),
      });
      await onRefresh();
    } catch (e) {
      alert('Invalid payload: ' + (e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    setBusyId(id);
    try {
      await fetch(`http://localhost:4202/sections/${id}`, { method: 'DELETE', credentials: 'include' });
      await onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const [local, setLocal] = useState(sorted);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function getPrimaryText(s: Section): string {
    try {
      const data = s.data as Record<string, unknown>;
      if (s.kind === 'HERO' && data?.title) return String(data.title);
      if (s.kind === 'FEATURED_MENU') {
        const items = data?.items as Array<{ title?: string }> | undefined;
        if (items?.[0]?.title) return String(items[0].title);
      }
      if (s.kind === 'CTA' && data?.title) return String(data.title);
      if (s.kind === 'TESTIMONIALS') {
        const items = data?.items as Array<{ name?: string }> | undefined;
        if (items?.[0]?.name) return String(items[0].name);
      }
      if (s.kind === 'BANNER' && data?.text) return String(data.text);
      if (s.kind === 'RICH_TEXT' && data?.html) return 'Rich text';
      return '';
    } catch {
      return '';
    }
  }


  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = local.findIndex((i) => i.id === active.id);
    const newIndex = local.findIndex((i) => i.id === over.id);
    const moved = arrayMove(local, oldIndex, newIndex);
    setLocal(moved);
    await Promise.all(moved.map((item: any, idx: number) => fetch(`http://localhost:4202/sections/${item.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ order: idx + 1 })
    })));
    await onRefresh();
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Sections</strong>
        <button onClick={() => onRefresh()} style={{ padding: '6px 10px', borderRadius: 6, background: '#111827', color: 'white', border: 0 }}>Refresh</button>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={local.map(i=>i.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'grid', gap: 8 }}>
            {local.map((s) => {
              const primary = getPrimaryText(s);
              return <SortableItem key={s.id} section={s} primary={primary} onSelect={onSelect} editData={editData} remove={remove} busyId={busyId} />;
            })}
            {local.length === 0 && <div style={{ color: '#6b7280' }}>No sections yet.</div>}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableItemProps {
  section: Section;
  primary: string;
  onSelect?: (s: Section) => void;
  editData: (id: string) => void;
  remove: (id: string) => void;
  busyId: string | null;
}

function SortableItem({ section, primary, onSelect, editData, remove, busyId }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: 12, background: '#0b1220', padding: 8, borderRadius: 6, color: '#e5e7eb' }}>
      <button aria-label="Drag handle" {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px 8px', borderRadius: 6, border: '1px solid #1f2937', background: '#111827' }}>≡</button>
      <span style={{ minWidth: 36, color: '#93a3b8' }}>#{section.order}</span>
      <span style={{ minWidth: 120, padding: '2px 8px', borderRadius: 9999, background: '#111827', border: '1px solid #1f2937' }}>{section.kind}</span>
      {primary && <span style={{ color: '#cbd5e1', maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{primary}</span>}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
        {onSelect && <button onClick={() => onSelect(section)} style={{ padding: '4px 8px' }}>Details</button>}
        <button disabled={busyId === section.id} onClick={() => editData(section.id)} style={{ padding: '4px 8px' }}>Edit</button>
        <button disabled={busyId === section.id} onClick={() => remove(section.id)} style={{ padding: '4px 8px', color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>Delete</button>
      </div>
    </div>
  );
}


