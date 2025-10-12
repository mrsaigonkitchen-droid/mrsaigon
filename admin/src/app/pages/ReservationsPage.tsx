import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { reservationsApi } from '../api';
import type { Reservation } from '../types';

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      const data = await reservationsApi.list();
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await reservationsApi.update(id, { status });
      await loadReservations();
    } catch (error) {
      alert('Failed to update status: ' + (error as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this reservation?')) return;
    try {
      await reservationsApi.delete(id);
      await loadReservations();
    } catch (error) {
      alert('Failed to delete: ' + (error as Error).message);
    }
  }

  const filteredReservations = filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div>
      <Card
        title="Reservations"
        subtitle={`${reservations.length} total reservations`}
        icon="ri-calendar-check-line"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: tokens.color.muted }}>
            <motion.i
              className="ri-loader-4-line"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 48, display: 'block', marginBottom: 16 }}
            />
            Loading reservations...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: tokens.color.muted }}>
            <i className="ri-calendar-line" style={{ fontSize: 64, display: 'block', marginBottom: 16, opacity: 0.5 }} />
            No {filter !== 'ALL' ? filter.toLowerCase() : ''} reservations
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  padding: 20,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: tokens.color.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: '#111',
                        fontWeight: 600,
                      }}
                    >
                      {reservation.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: tokens.color.text, fontSize: 18, fontWeight: 600 }}>{reservation.name}</div>
                      <div style={{ color: tokens.color.muted, fontSize: 14 }}>{reservation.email}</div>
                      <div style={{ color: tokens.color.muted, fontSize: 14 }}>{reservation.phone}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '6px 16px',
                      borderRadius: tokens.radius.pill,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        reservation.status === 'PENDING'
                          ? 'rgba(245,158,11,0.2)'
                          : reservation.status === 'CONFIRMED'
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(239,68,68,0.2)',
                      color:
                        reservation.status === 'PENDING'
                          ? '#f59e0b'
                          : reservation.status === 'CONFIRMED'
                          ? '#10b981'
                          : '#ef4444',
                    }}
                  >
                    {reservation.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ color: tokens.color.muted, fontSize: 12, marginBottom: 4 }}>Date</div>
                    <div style={{ color: tokens.color.text, fontWeight: 500 }}>
                      {new Date(reservation.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: tokens.color.muted, fontSize: 12, marginBottom: 4 }}>Time</div>
                    <div style={{ color: tokens.color.text, fontWeight: 500 }}>{reservation.time}</div>
                  </div>
                  <div>
                    <div style={{ color: tokens.color.muted, fontSize: 12, marginBottom: 4 }}>Party Size</div>
                    <div style={{ color: tokens.color.text, fontWeight: 500 }}>{reservation.partySize} guests</div>
                  </div>
                </div>

                {reservation.specialRequest && (
                  <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.md, marginBottom: 16 }}>
                    <div style={{ color: tokens.color.muted, fontSize: 12, marginBottom: 4 }}>Special Request</div>
                    <div style={{ color: tokens.color.text }}>{reservation.specialRequest}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {reservation.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="small"
                      icon="ri-check-line"
                      onClick={() => handleUpdateStatus(reservation.id, 'CONFIRMED')}
                    >
                      Confirm
                    </Button>
                  )}
                  {reservation.status !== 'CANCELLED' && (
                    <Button
                      variant="danger"
                      size="small"
                      icon="ri-close-line"
                      onClick={() => handleUpdateStatus(reservation.id, 'CANCELLED')}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button variant="ghost" size="small" icon="ri-delete-bin-line" onClick={() => handleDelete(reservation.id)}>
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

