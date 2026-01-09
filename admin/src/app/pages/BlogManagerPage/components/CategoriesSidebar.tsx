import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../../../theme';
import type { BlogCategory } from '../../../types';

interface CategoriesSidebarProps {
  categories: BlogCategory[];
  loading: boolean;
  selectedId: string | null;
  totalPosts: number;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  onEdit: (cat: BlogCategory) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

export function CategoriesSidebar({
  categories,
  loading,
  selectedId,
  totalPosts,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  isMobile,
}: CategoriesSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Mobile: collapsible categories
  if (isMobile) {
    return (
      <div style={{ background: tokens.color.surface, borderBottom: `1px solid ${tokens.color.border}` }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: '100%', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ri-price-tag-3-line" style={{ fontSize: 18, color: tokens.color.primary }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: tokens.color.text }}>
              Danh mục ({categories.length})
            </span>
          </div>
          <motion.i
            className="ri-arrow-down-s-line"
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            style={{ fontSize: 20, color: tokens.color.muted }}
          />
        </button>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 8px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <CategoryChip label="Tất cả" count={totalPosts} isSelected={selectedId === null}
                  onClick={() => { onSelect(null); setIsCollapsed(true); }} />
                {categories.map((cat) => (
                  <CategoryChip key={cat.id} label={cat.name} count={cat._count?.posts || 0}
                  color={cat.color || undefined} isSelected={selectedId === cat.id}
                    onClick={() => { onSelect(cat.id); setIsCollapsed(true); }} />
                ))}
                <button onClick={onAdd} style={{
                  padding: '6px 12px', borderRadius: tokens.radius.pill,
                  background: `${tokens.color.primary}15`, border: `1px dashed ${tokens.color.primary}50`,
                  color: tokens.color.primary, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <i className="ri-add-line" /> Thêm
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div style={{ background: tokens.color.surface, minHeight: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px', borderBottom: `1px solid ${tokens.color.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: tokens.radius.md,
            background: `${tokens.color.primary}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: tokens.color.primary, fontSize: 16,
          }}>
            <i className="ri-price-tag-3-line" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: tokens.color.text }}>Danh mục</span>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onAdd}
          style={{
            width: 28, height: 28, borderRadius: tokens.radius.md,
            background: tokens.color.primary, border: 'none', color: '#111',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }} title="Thêm danh mục">
          <i className="ri-add-line" />
        </motion.button>
      </div>

      <CategoryListItem label="Tất cả bài viết" count={totalPosts} icon="ri-article-line"
        isSelected={selectedId === null} onClick={() => onSelect(null)} />

      <div style={{ height: 1, background: tokens.color.border, margin: '8px 16px' }} />

      {loading && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <motion.i className="ri-loader-4-line" animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: 24, color: tokens.color.muted }} />
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {!loading && categories.map((cat) => (
          <CategoryItem key={cat.id} category={cat} isSelected={selectedId === cat.id}
            onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {!loading && categories.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <i className="ri-folder-line" style={{ fontSize: 32, color: tokens.color.border, marginBottom: 8, display: 'block' }} />
            <p style={{ fontSize: 13, color: tokens.color.muted, margin: '0 0 12px' }}>Chưa có danh mục</p>
            <button onClick={onAdd} style={{
              padding: '8px 16px', borderRadius: tokens.radius.md,
              background: `${tokens.color.primary}15`, border: `1px solid ${tokens.color.primary}30`,
              color: tokens.color.primary, fontSize: 13, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <i className="ri-add-line" /> Tạo danh mục đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({ label, count, color, isSelected, onClick }: {
  label: string; count: number; color?: string; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: tokens.radius.pill,
      background: isSelected ? `${tokens.color.primary}20` : tokens.color.surfaceAlt,
      border: `1px solid ${isSelected ? tokens.color.primary : tokens.color.border}`,
      color: isSelected ? tokens.color.primary : tokens.color.text,
      fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      fontWeight: isSelected ? 600 : 400,
    }}>
      {color && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      {label}
      <span style={{ fontSize: 11, color: tokens.color.muted, background: tokens.color.surfaceHover, padding: '1px 6px', borderRadius: 8 }}>
        {count}
      </span>
    </button>
  );
}

function CategoryListItem({ label, count, icon, isSelected, onClick }: {
  label: string; count: number; icon: string; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
      background: isSelected ? `${tokens.color.primary}10` : 'transparent', border: 'none',
      borderLeft: isSelected ? `3px solid ${tokens.color.primary}` : '3px solid transparent',
      cursor: 'pointer', transition: 'all 0.2s',
    }}>
      <i className={icon} style={{ fontSize: 18, color: isSelected ? tokens.color.primary : tokens.color.muted }} />
      <span style={{
        fontSize: 14, color: isSelected ? tokens.color.primary : tokens.color.text,
        fontWeight: isSelected ? 600 : 400, flex: 1, textAlign: 'left',
      }}>{label}</span>
      <span style={{
        fontSize: 12, color: tokens.color.muted, background: tokens.color.surfaceAlt,
        padding: '2px 8px', borderRadius: tokens.radius.pill, fontWeight: 500,
      }}>{count}</span>
    </button>
  );
}

function CategoryItem({ category, isSelected, onSelect, onEdit, onDelete }: {
  category: BlogCategory; isSelected: boolean;
  onSelect: (id: string | null) => void; onEdit: (cat: BlogCategory) => void; onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button onClick={() => onSelect(category.id)} style={{
        width: '100%', padding: '12px 16px', paddingRight: isHovered ? 70 : 16,
        display: 'flex', alignItems: 'center', gap: 10,
        background: isSelected ? `${tokens.color.primary}10` : 'transparent', border: 'none',
        borderLeft: isSelected ? `3px solid ${tokens.color.primary}` : '3px solid transparent',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: category.color || tokens.color.primary, flexShrink: 0,
          boxShadow: `0 0 0 2px ${category.color || tokens.color.primary}30`,
        }} />
        <span style={{
          fontSize: 14, color: isSelected ? tokens.color.primary : tokens.color.text,
          fontWeight: isSelected ? 600 : 400, flex: 1, textAlign: 'left',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{category.name}</span>
        <span style={{
          fontSize: 12, color: tokens.color.muted, background: tokens.color.surfaceAlt,
          padding: '2px 8px', borderRadius: tokens.radius.pill, fontWeight: 500,
        }}>{category._count?.posts || 0}</span>
      </button>

      <AnimatePresence>
        {isHovered && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onEdit(category); }}
              style={{
                width: 26, height: 26, borderRadius: tokens.radius.sm,
                background: tokens.color.surfaceHover, border: `1px solid ${tokens.color.border}`,
                color: tokens.color.text, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }} title="Sửa danh mục">
              <i className="ri-edit-line" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
              style={{
                width: 26, height: 26, borderRadius: tokens.radius.sm,
                background: `${tokens.color.error}15`, border: `1px solid ${tokens.color.error}30`,
                color: tokens.color.error, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }} title="Xóa danh mục">
              <i className="ri-delete-bin-line" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
