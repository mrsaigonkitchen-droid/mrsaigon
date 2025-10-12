import { motion } from 'framer-motion';
import { tokens } from '@app/shared';
import { StatCard } from '../components/AnimatedCounter';
import { renderSection } from '../sections/render';
import type { PageData } from '../types';

export function AboutPage({ page }: { page: PageData }) {
  return (
    <section style={{ 
      minHeight: '100vh',
      background: 'transparent',
      paddingTop: 80
    }}>
      {/* Hero Section - Similar to BlogPage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          background: 'radial-gradient(1000px 400px at 50% 0%, rgba(245,211,147,0.08) 0%, transparent 70%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 'clamp(80px, 14vh, 120px)',
          paddingBottom: 'clamp(80px, 14vh, 120px)',
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontFamily: 'Playfair Display, serif',
              color: '#F5D393',
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            Về Chúng Tôi
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Hành trình mang đến những trải nghiệm ẩm thực tuyệt vời
          </motion.p>
        </div>
      </motion.div>

      {/* Content Container */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '60px 24px'
      }}>
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            marginBottom: 80,
          }}
        >
          <StatCard
            icon="ri-calendar-check-fill"
            value={15}
            label="Năm kinh nghiệm"
            suffix="+"
            color="#10b981"
          />
          <StatCard
            icon="ri-team-fill"
            value={50}
            label="Đội ngũ chuyên nghiệp"
            suffix="+"
            color="#3b82f6"
          />
          <StatCard
            icon="ri-award-fill"
            value={25}
            label="Giải thưởng"
            suffix="+"
            color="#f59e0b"
          />
          <StatCard
            icon="ri-star-smile-fill"
            value={10000}
            label="Khách hàng hài lòng"
            suffix="+"
            color={tokens.color.primary}
          />
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            marginBottom: 60,
          }}
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(12px)',
              padding: 48,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
              }}
            >
              <i className="ri-target-line" style={{ fontSize: 36, color: '#111' }} />
            </div>
            <h3 style={{ 
              fontSize: 28, 
              color: '#F5D393', 
              marginBottom: 16, 
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
            }}>
              Sứ Mệnh
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              lineHeight: 1.8, 
              fontSize: 16 
            }}>
              Mang đến những trải nghiệm ẩm thực đẳng cấp, kết hợp hương vị truyền thống và hiện đại,
              phục vụ với tâm huyết và sự tận tâm cao nhất.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(12px)',
              padding: 48,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(245,211,147,0.3)',
              }}
            >
              <i className="ri-eye-line" style={{ fontSize: 36, color: '#111' }} />
            </div>
            <h3 style={{ 
              fontSize: 28, 
              color: '#F5D393', 
              marginBottom: 16, 
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
            }}>
              Tầm Nhìn
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              lineHeight: 1.8, 
              fontSize: 16 
            }}>
              Trở thành điểm đến hàng đầu cho những ai yêu thích ẩm thực tinh tế,
              không gian sang trọng và dịch vụ chuyên nghiệp.
            </p>
          </motion.div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'radial-gradient(800px 400px at 50% 50%, rgba(245,211,147,0.05) 0%, transparent 70%)',
            borderRadius: 24,
            padding: '60px 40px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'Playfair Display, serif',
            color: '#F5D393',
            marginBottom: 40,
            textAlign: 'center',
            fontWeight: 700,
          }}>
            Giá Trị Cốt Lõi
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
          }}>
            {[
              { icon: 'ri-checkbox-circle-line', title: 'Chất Lượng', desc: 'Cam kết nguyên liệu tươi ngon, chế biến chuẩn vị' },
              { icon: 'ri-heart-3-line', title: 'Tận Tâm', desc: 'Phục vụ bằng cả trái tim, mang đến trải nghiệm tốt nhất' },
              { icon: 'ri-lightbulb-flash-line', title: 'Sáng Tạo', desc: 'Không ngừng đổi mới, kết hợp truyền thống và hiện đại' },
              { icon: 'ri-user-smile-line', title: 'Khách Hàng', desc: 'Luôn đặt sự hài lòng của khách hàng lên hàng đầu' },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  padding: 24,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.04)',
                  textAlign: 'center',
                }}
              >
                <i className={value.icon} style={{ 
                  fontSize: 40, 
                  color: '#F5D393', 
                  marginBottom: 16,
                  display: 'block',
                }} />
                <h4 style={{ 
                  fontSize: 18, 
                  color: 'white', 
                  marginBottom: 8,
                  fontWeight: 600,
                }}>
                  {value.title}
                </h4>
                <p style={{ 
                  fontSize: 14, 
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.6,
                }}>
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Render sections from page data */}
        <div style={{ marginTop: 60 }}>
          {page.sections
            ?.filter((s) => 
              s.kind !== 'HERO' && 
              s.kind !== 'FAB_ACTIONS' // FAB rendered separately in app.tsx
            )
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((s) => {
              const rendered = renderSection(s);
              if (!rendered) return null;
              return <div key={s.id} style={{ marginBottom: 40 }}>{rendered}</div>;
            })}
        </div>
      </div>
    </section>
  );
}
