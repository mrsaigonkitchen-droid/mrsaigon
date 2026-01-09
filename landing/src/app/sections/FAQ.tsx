import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';

interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
}

interface FAQData {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
}

interface FAQProps {
  data: FAQData;
}

export function FAQ({ data }: FAQProps) {
  const { title, subtitle, items = [] } = data;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section
      style={{
        padding: 'clamp(60px, 10vw, 100px) clamp(16px, 5vw, 40px)',
        background: tokens.color.surface,
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            {title && (
              <h2
                style={{
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 700,
                  color: tokens.color.text,
                  marginBottom: 12,
                  fontFamily: tokens.font.display,
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 'clamp(15px, 2vw, 17px)',
                  color: tokens.color.muted,
                }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* FAQ Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: tokens.color.background,
                  border: `1px solid ${isOpen ? tokens.color.primary : tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                  overflow: 'hidden',
                  transition: 'border-color 0.3s',
                }}
              >
                {/* Question */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'clamp(15px, 2vw, 17px)',
                      fontWeight: 600,
                      color: isOpen ? tokens.color.primary : tokens.color.text,
                      transition: 'color 0.3s',
                    }}
                  >
                    {item.question}
                  </span>
                  <motion.i
                    className="ri-arrow-down-s-line"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: 24,
                      color: isOpen ? tokens.color.primary : tokens.color.muted,
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 20px 20px',
                          fontSize: 'clamp(14px, 2vw, 16px)',
                          color: tokens.color.muted,
                          lineHeight: 1.7,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
