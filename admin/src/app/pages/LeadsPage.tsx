import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const API_URL = 'http://localhost:4202';

interface CustomerLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  content: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CANCELLED';
  source: string;
  quoteData: string | null;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  NEW: { bg: 'rgba(59,130,246,0.2)', text: '#3b82f6' },
  CONTACTED: { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  CONVERTED: { bg: 'rgba(16,185,129,0.2)', text: '#10b981' },
  CANCELLED: { bg: 'rgba(239,68,68,0.2)', text: '#ef4444' },
};

const statusLabels: Record<string, string> = {
  NEW: 'Mới',
  CONTACTED: 'Đã liên hệ',
  CONVERTED: 'Đã chuyển đổi',
  CANCELLED: 'Đã hủy',
};

export function LeadsPage() {
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/leads`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeads();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const filteredLeads = filterStatus === 'ALL' 
    ? leads 
    : leads.filter(l => l.status === filterStatus);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: tokens.color.primary,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: tokens.color.text, fontSize: 28, fontWeight: 700, margin: 0 }}>
            Khách hàng tiềm năng
          </h1>
          <p style={{ color: tokens.color.muted, margin: '8px 0 0' }}>
            Quản lý leads từ form báo giá và liên hệ
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'CANCELLED'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'primary' : 'outline'}
              size="small"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL' ? 'Tất cả' : statusLabels[status]}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {Object.entries(statusLabels).map(([status, label]) => {
          const count = leads.filter(l => l.status === status).length;
          const colors = statusColors[status];
          return (
            <Card key={status} style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{count}</span>
                </div>
                <div>
                  <div style={{ color: tokens.color.muted, fontSize: 13 }}>{label}</div>
                  <div style={{ color: tokens.color.text, fontSize: 18, fontWeight: 600 }}>
                    {count} leads
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Leads Table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.color.border}` }}>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted, fontWeight: 500 }}>Khách hàng</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted, fontWeight: 500 }}>Liên hệ</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted, fontWeight: 500 }}>Nội dung</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted, fontWeight: 500 }}>Nguồn</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted, fontWeight: 500 }}>Trạng thái</th>
                <th style={{ padding: 16, textAlign: 'left', color: tokens.color.muted, fontWeight: 500 }}>Ngày tạo</th>
                <th style={{ padding: 16, textAlign: 'right', color: tokens.color.muted, fontWeight: 500 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => {
                const colors = statusColors[lead.status];
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ borderBottom: `1px solid ${tokens.color.border}` }}
                  >
                    <td style={{ padding: 16 }}>
                      <div style={{ color: tokens.color.text, fontWeight: 500 }}>{lead.name}</div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ color: tokens.color.text }}>{lead.phone}</div>
                      {lead.email && <div style={{ color: tokens.color.muted, fontSize: 13 }}>{lead.email}</div>}
                    </td>
                    <td style={{ padding: 16, maxWidth: 200 }}>
                      <div style={{ color: tokens.color.muted, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.content}
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.05)',
                        color: tokens.color.muted,
                        fontSize: 12,
                      }}>
                        {lead.source}
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: colors.bg,
                        color: colors.text,
                        fontSize: 13,
                        fontWeight: 500,
                      }}>
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td style={{ padding: 16, color: tokens.color.muted, fontSize: 13 }}>
                      {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <Button variant="outline" size="small" onClick={() => setSelectedLead(lead)}>
                        <i className="ri-eye-line" /> Chi tiết
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLead(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: tokens.color.surface,
                borderRadius: 16,
                padding: 32,
                width: '100%',
                maxWidth: 600,
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <h2 style={{ color: tokens.color.text, margin: '0 0 24px' }}>Chi tiết khách hàng</h2>
              
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13 }}>Họ tên</label>
                  <div style={{ color: tokens.color.text, fontSize: 16, marginTop: 4 }}>{selectedLead.name}</div>
                </div>
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13 }}>Số điện thoại</label>
                  <div style={{ color: tokens.color.text, fontSize: 16, marginTop: 4 }}>{selectedLead.phone}</div>
                </div>
                {selectedLead.email && (
                  <div>
                    <label style={{ color: tokens.color.muted, fontSize: 13 }}>Email</label>
                    <div style={{ color: tokens.color.text, fontSize: 16, marginTop: 4 }}>{selectedLead.email}</div>
                  </div>
                )}
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13 }}>Nội dung yêu cầu</label>
                  <div style={{ color: tokens.color.text, fontSize: 16, marginTop: 4, whiteSpace: 'pre-wrap' }}>{selectedLead.content}</div>
                </div>
                {selectedLead.quoteData && (
                  <div>
                    <label style={{ color: tokens.color.muted, fontSize: 13 }}>Dữ liệu báo giá</label>
                    <pre style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: 12,
                      borderRadius: 8,
                      color: tokens.color.text,
                      fontSize: 12,
                      overflow: 'auto',
                      marginTop: 4,
                    }}>
                      {JSON.stringify(JSON.parse(selectedLead.quoteData), null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <label style={{ color: tokens.color.muted, fontSize: 13, marginBottom: 8, display: 'block' }}>Cập nhật trạng thái</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <Button
                        key={status}
                        variant={selectedLead.status === status ? 'primary' : 'outline'}
                        size="small"
                        onClick={() => updateLeadStatus(selectedLead.id, status)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setSelectedLead(null)}>Đóng</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
