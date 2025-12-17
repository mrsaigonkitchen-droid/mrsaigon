import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const API_URL = 'http://localhost:4202';

interface Formula {
  id: string;
  name: string;
  expression: string;
  description: string | null;
  isActive: boolean;
}

interface UnitPrice {
  id: string;
  tag: string;
  name: string;
}

export function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [unitPrices, setUnitPrices] = useState<UnitPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Formula | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    name: '',
    expression: '',
    description: '',
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [formulaRes, priceRes] = await Promise.all([
        fetch(`${API_URL}/formulas`, { credentials: 'include' }),
        fetch(`${API_URL}/unit-prices`, { credentials: 'include' }),
      ]);
      if (formulaRes.ok) setFormulas(await formulaRes.json());
      if (priceRes.ok) setUnitPrices(await priceRes.json());
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ name: '', expression: '', description: '', isActive: true });
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleEdit = (item: Formula) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      expression: item.expression,
      description: item.description || '',
      isActive: item.isActive,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? `${API_URL}/formulas/${editingItem.id}` : `${API_URL}/formulas`;
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchData();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa công thức này?')) return;
    try {
      const res = await fetch(`${API_URL}/formulas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const insertTag = (tag: string) => {
    setForm(prev => ({ ...prev, expression: prev.expression + tag }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: tokens.color.primary }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: tokens.color.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Công thức tính giá</h1>
          <p style={{ color: tokens.color.muted, margin: '8px 0 0' }}>Quản lý công thức dùng trong báo giá</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreating(true); }}>
          <i className="ri-add-line" /> Thêm công thức
        </Button>
      </div>

      {/* Info Card */}
      <Card style={{ padding: 20, marginBottom: 24, background: 'rgba(245,211,147,0.05)', border: '1px solid rgba(245,211,147,0.2)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <i className="ri-information-line" style={{ color: tokens.color.primary, fontSize: 20 }} />
          <div>
            <h4 style={{ color: tokens.color.primary, margin: '0 0 8px' }}>Hướng dẫn viết công thức</h4>
            <p style={{ color: tokens.color.muted, margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Sử dụng các TAG từ bảng đơn giá và biến <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>DIEN_TICH</code> (diện tích khách nhập).<br />
              Ví dụ: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>DIEN_TICH * CONG_SON + DIEN_TICH * SON_LOT</code>
            </p>
          </div>
        </div>
      </Card>

      {/* Formulas Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {formulas.map(item => (
          <Card key={item.id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h3 style={{ color: tokens.color.text, margin: 0, fontSize: 18 }}>{item.name}</h3>
              <span style={{
                padding: '4px 8px', borderRadius: 6,
                background: item.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                color: item.isActive ? '#10b981' : '#ef4444', fontSize: 12,
              }}>
                {item.isActive ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
            
            {item.description && (
              <p style={{ color: tokens.color.muted, margin: '0 0 12px', fontSize: 14 }}>{item.description}</p>
            )}
            
            <div style={{
              background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, marginBottom: 16,
              fontFamily: 'monospace', fontSize: 13, color: tokens.color.primary, overflowX: 'auto',
            }}>
              {item.expression}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" size="small" onClick={() => handleEdit(item)}>
                <i className="ri-edit-line" /> Sửa
              </Button>
              <Button variant="outline" size="small" onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }}>
                <i className="ri-delete-bin-line" /> Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetForm}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: tokens.color.surface, borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}
            >
              <h2 style={{ color: tokens.color.text, margin: '0 0 24px' }}>{editingItem ? 'Sửa công thức' : 'Thêm công thức mới'}</h2>
              
              <div style={{ display: 'grid', gap: 16 }}>
                <Input label="Tên công thức" value={form.name} onChange={val => setForm({ ...form, name: val })} placeholder="VD: Công thức sơn cơ bản" />
                
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13, marginBottom: 8, display: 'block' }}>Biểu thức</label>
                  <textarea
                    value={form.expression}
                    onChange={e => setForm({ ...form, expression: e.target.value })}
                    placeholder="VD: DIEN_TICH * CONG_SON"
                    style={{
                      width: '100%', padding: 12, borderRadius: 8, minHeight: 80,
                      background: 'rgba(255,255,255,0.05)', border: `1px solid ${tokens.color.border}`,
                      color: tokens.color.text, fontFamily: 'monospace', fontSize: 14, resize: 'vertical',
                    }}
                  />
                </div>

                {/* Available Tags */}
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13, marginBottom: 8, display: 'block' }}>TAG có sẵn (click để thêm)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button variant="outline" size="small" onClick={() => insertTag('DIEN_TICH')}>
                      DIEN_TICH
                    </Button>
                    {unitPrices.map(p => (
                      <Button key={p.id} variant="outline" size="small" onClick={() => insertTag(p.tag)}>
                        {p.tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Operators */}
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13, marginBottom: 8, display: 'block' }}>Toán tử</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['+', '-', '*', '/', '(', ')'].map(op => (
                      <Button key={op} variant="outline" size="small" onClick={() => insertTag(` ${op} `)}>
                        {op}
                      </Button>
                    ))}
                  </div>
                </div>

                <Input label="Mô tả" value={form.description} onChange={val => setForm({ ...form, description: val })} placeholder="Mô tả công thức" />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  <span style={{ color: tokens.color.text }}>Hoạt động</span>
                </label>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={resetForm}>Hủy</Button>
                <Button onClick={handleSave}>{editingItem ? 'Cập nhật' : 'Tạo mới'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
