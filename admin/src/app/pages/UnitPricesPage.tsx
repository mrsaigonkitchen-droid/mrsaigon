import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

const API_URL = 'http://localhost:4202';

interface UnitPrice {
  id: string;
  category: string;
  name: string;
  price: number;
  tag: string;
  unit: string;
  description: string | null;
  isActive: boolean;
}

const categoryOptions = ['Nhân công', 'Vật liệu', 'Thiết bị', 'Khác'];

export function UnitPricesPage() {
  const [unitPrices, setUnitPrices] = useState<UnitPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<UnitPrice | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const [form, setForm] = useState({
    category: 'Nhân công',
    name: '',
    price: 0,
    tag: '',
    unit: 'm²',
    description: '',
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/unit-prices`, { credentials: 'include' });
      if (res.ok) setUnitPrices(await res.json());
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
    setForm({ category: 'Nhân công', name: '', price: 0, tag: '', unit: 'm²', description: '', isActive: true });
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleEdit = (item: UnitPrice) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      name: item.name,
      price: item.price,
      tag: item.tag,
      unit: item.unit,
      description: item.description || '',
      isActive: item.isActive,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? `${API_URL}/unit-prices/${editingItem.id}` : `${API_URL}/unit-prices`;
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
    if (!confirm('Bạn có chắc muốn xóa đơn giá này?')) return;
    try {
      const res = await fetch(`${API_URL}/unit-prices/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const filteredItems = filterCategory === 'ALL' ? unitPrices : unitPrices.filter(p => p.category === filterCategory);

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
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: tokens.color.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Bảng đơn giá</h1>
          <p style={{ color: tokens.color.muted, margin: '8px 0 0' }}>Quản lý đơn giá nhân công và vật liệu</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', ...categoryOptions].map(cat => (
            <Button key={cat} variant={filterCategory === cat ? 'primary' : 'outline'} size="small" onClick={() => setFilterCategory(cat)}>
              {cat === 'ALL' ? 'Tất cả' : cat}
            </Button>
          ))}
          <Button onClick={() => { resetForm(); setIsCreating(true); }}>
            <i className="ri-add-line" /> Thêm đơn giá
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.color.border}` }}>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted }}>Tên</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted }}>Loại</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted }}>TAG</th>
                <th style={{ padding: 16, textAlign: 'right', color: tokens.color.muted }}>Đơn giá</th>
                <th style={{ padding: 16, textAlign: 'center', color: tokens.color.muted }}>Đơn vị</th>
                <th style={{ padding: 16, textAlign: 'center', color: tokens.color.muted }}>Trạng thái</th>
                <th style={{ padding: 16, textAlign: 'right', color: tokens.color.muted }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${tokens.color.border}` }}>
                  <td style={{ padding: 16 }}>
                    <div style={{ color: tokens.color.text, fontWeight: 500 }}>{item.name}</div>
                    {item.description && <div style={{ color: tokens.color.muted, fontSize: 12 }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: tokens.color.muted, fontSize: 12 }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <code style={{ background: 'rgba(245,211,147,0.1)', color: tokens.color.primary, padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                      {item.tag}
                    </code>
                  </td>
                  <td style={{ padding: 16, textAlign: 'right', color: tokens.color.primary, fontWeight: 600 }}>
                    {formatPrice(item.price)}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center', color: tokens.color.muted }}>{item.unit}</td>
                  <td style={{ padding: 16, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: 12,
                      background: item.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: item.isActive ? '#10b981' : '#ef4444', fontSize: 12,
                    }}>
                      {item.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td style={{ padding: 16, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="outline" size="small" onClick={() => handleEdit(item)}><i className="ri-edit-line" /></Button>
                      <Button variant="outline" size="small" onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }}><i className="ri-delete-bin-line" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
              style={{ background: tokens.color.surface, borderRadius: 16, padding: 32, width: '100%', maxWidth: 500 }}
            >
              <h2 style={{ color: tokens.color.text, margin: '0 0 24px' }}>{editingItem ? 'Sửa đơn giá' : 'Thêm đơn giá mới'}</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <Input label="Tên" value={form.name} onChange={val => setForm({ ...form, name: val })} placeholder="VD: Công sơn" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Select
                    label="Loại"
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val })}
                    options={categoryOptions}
                  />
                  <Input label="TAG (dùng trong công thức)" value={form.tag} onChange={val => setForm({ ...form, tag: val.toUpperCase() })} placeholder="VD: CONG_SON" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <Input label="Đơn giá (VNĐ)" type="number" value={form.price} onChange={val => setForm({ ...form, price: parseInt(val) || 0 })} />
                  <Input label="Đơn vị" value={form.unit} onChange={val => setForm({ ...form, unit: val })} placeholder="m², kg, công" />
                </div>
                <Input label="Mô tả" value={form.description} onChange={val => setForm({ ...form, description: val })} />
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
