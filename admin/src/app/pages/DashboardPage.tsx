import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { reservationsApi } from '../api';
import type { Reservation } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    totalSections: 0,
    mediaAssets: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const reservations = await reservationsApi.list();
      setRecentReservations(reservations.slice(0, 5));
      setStats({
        totalReservations: reservations.length,
        pendingReservations: reservations.filter((r) => r.status === 'PENDING').length,
        totalSections: 0, // Will be populated later
        mediaAssets: 0, // Will be populated later
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { icon: 'ri-calendar-check-line', label: 'Total Reservations', value: stats.totalReservations, color: tokens.color.primary },
    { icon: 'ri-time-line', label: 'Pending', value: stats.pendingReservations, color: '#f59e0b' },
    { icon: 'ri-layout-grid-line', label: 'Sections', value: stats.totalSections, color: '#8b5cf6' },
    { icon: 'ri-image-2-line', label: 'Media Assets', value: stats.mediaAssets, color: '#10b981' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: tokens.color.text, fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>
            Welcome to Admin Dashboard
          </h2>
          <p style={{ color: tokens.color.muted, fontSize: 16 }}>
            Manage your restaurant website content, reservations, and more.
          </p>
        </div>
        <motion.div
          animate={{ 
            boxShadow: ['0 0 0 0 rgba(245,211,147,0.4)', '0 0 0 10px rgba(245,211,147,0)', '0 0 0 0 rgba(245,211,147,0)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            padding: '12px 20px',
            background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
            borderRadius: tokens.radius.md,
            color: '#111',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="ri-tv-line" style={{ fontSize: 18 }} />
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Landing Page</div>
            <div>localhost:4200</div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hoverable>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: tokens.color.muted, fontSize: 14, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ color: tokens.color.text, fontSize: 32, fontWeight: 700 }}>{stat.value}</div>
                </div>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: tokens.radius.md,
                    background: `${stat.color}20`,
                    border: `1px solid ${stat.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    color: stat.color,
                  }}
                >
                  <i className={stat.icon} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Reservations */}
      <Card title="Recent Reservations" icon="ri-calendar-check-line">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: tokens.color.muted }}>
            <motion.i
              className="ri-loader-4-line"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 32, display: 'block', marginBottom: 12 }}
            />
            Loading...
          </div>
        ) : recentReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: tokens.color.muted }}>
            <i className="ri-calendar-line" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.5 }} />
            No reservations yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentReservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                whileHover={{ x: 4 }}
                style={{
                  padding: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: tokens.color.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      color: '#111',
                      fontWeight: 600,
                    }}
                  >
                    {reservation.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: tokens.color.text, fontWeight: 500 }}>{reservation.name}</div>
                    <div style={{ color: tokens.color.muted, fontSize: 13 }}>
                      {new Date(reservation.date).toLocaleDateString()} · {reservation.time} · {reservation.partySize} guests
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 12px',
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
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { icon: 'ri-add-circle-line', label: 'Add Section', color: tokens.color.primary },
          { icon: 'ri-image-add-line', label: 'Upload Media', color: '#8b5cf6' },
          { icon: 'ri-calendar-line', label: 'View Reservations', color: '#f59e0b' },
          { icon: 'ri-percent-line', label: 'Create Offer', color: '#10b981' },
        ].map((action) => (
          <Button key={action.label} variant="secondary" icon={action.icon} fullWidth>
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

