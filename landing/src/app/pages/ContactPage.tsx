import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { fadeInUp } from '@app/ui';
import { renderSection } from '../sections/render';
import type { PageData } from '../types';

export function ContactPage({ page }: { page: PageData }) {
  const contactMethods = [
    {
      icon: 'ri-phone-fill',
      title: 'Điện thoại',
      value: '+84 123 456 789',
      href: 'tel:+84123456789',
      color: '#10b981',
    },
    {
      icon: 'ri-mail-fill',
      title: 'Email',
      value: 'info@restaurant.com',
      href: 'mailto:info@restaurant.com',
      color: '#3b82f6',
    },
    {
      icon: 'ri-map-pin-fill',
      title: 'Địa chỉ',
      value: '123 Đường ABC, Quận XYZ, TP.HCM',
      href: 'https://maps.google.com',
      color: '#f59e0b',
    },
    {
      icon: 'ri-time-fill',
      title: 'Giờ mở cửa',
      value: 'Thứ 2 - CN: 10:00 - 22:00',
      color: tokens.color.primary,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <motion.div
        variants={fadeInUp}
        style={{
          textAlign: 'center',
          padding: '60px 0 40px',
          position: 'relative',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
            color: '#111',
            padding: '12px 28px',
            borderRadius: tokens.radius.pill,
            fontSize: 14,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          <i className="ri-customer-service-fill" style={{ fontSize: 20 }} />
          Liên Hệ
        </motion.div>

        <h1
          className="heroTitle"
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontFamily: tokens.font.display,
            color: tokens.color.primary,
            marginBottom: 20,
            lineHeight: 1.2,
          }}
        >
          Hãy Liên Hệ Với Chúng Tôi
        </h1>

        <motion.p
          variants={fadeInUp}
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: tokens.color.muted,
            maxWidth: 700,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
        >
          Chúng tôi luôn sẵn sàng lắng nghe và phục vụ bạn
        </motion.p>
      </motion.div>

      {/* Quick Contact Methods */}
      <motion.div
        variants={fadeInUp}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 60,
        }}
      >
        {contactMethods.map((method, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            style={{
              background: `linear-gradient(135deg, ${tokens.color.surface} 0%, rgba(19,19,22,0.8) 100%)`,
              padding: 32,
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.color.border}`,
              textAlign: 'center',
              boxShadow: tokens.shadow.md,
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: `${method.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className={method.icon} style={{ fontSize: 32, color: method.color }} />
            </div>
            <h3 style={{ fontSize: 16, color: tokens.color.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              {method.title}
            </h3>
            {method.href ? (
              <a
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{
                  fontSize: 18,
                  color: tokens.color.text,
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'block',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = tokens.color.primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = tokens.color.text)}
              >
                {method.value}
              </a>
            ) : (
              <div style={{ fontSize: 18, color: tokens.color.text, fontWeight: 600 }}>
                {method.value}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Reservation Form & Contact Info Sections */}
      {page.sections
        ?.filter((s) => 
          s.kind === 'RESERVATION_FORM' || 
          s.kind === 'CONTACT_INFO' || 
          s.kind === 'CTA' || 
          s.kind === 'RICH_TEXT'
        )
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((s) => {
          const rendered = renderSection(s);
          if (!rendered) return null;
          return <section key={s.id}>{rendered}</section>;
        })}

      {/* Social Media Section */}
      <motion.div
        variants={fadeInUp}
        style={{
          marginTop: 60,
          padding: 48,
          background: `linear-gradient(135deg, ${tokens.color.surface} 0%, rgba(19,19,22,0.8) 100%)`,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.color.border}`,
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: 28, color: tokens.color.primary, marginBottom: 16, fontWeight: 700 }}>
          Kết Nối Với Chúng Tôi
        </h3>
        <p style={{ color: tokens.color.muted, marginBottom: 32, fontSize: 16 }}>
          Theo dõi chúng tôi trên mạng xã hội để cập nhật những món ăn mới và ưu đãi đặc biệt
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['facebook', 'instagram', 'youtube', 'twitter', 'tiktok'].map((social, idx) => (
            <motion.a
              key={social}
              href={`https://${social}.com`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#111',
                fontSize: 24,
                textDecoration: 'none',
                boxShadow: tokens.shadow.md,
                transition: 'all 0.3s ease',
              }}
            >
              <i className={`ri-${social}-fill`} />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}


