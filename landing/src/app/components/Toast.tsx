import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@app/shared';
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const toastIcons: Record<ToastType, { icon: string; color: string }> = {
  success: { icon: 'ri-checkbox-circle-fill', color: '#10b981' },
  error: { icon: 'ri-error-warning-fill', color: '#ef4444' },
  info: { icon: 'ri-information-fill', color: '#3b82f6' },
  warning: { icon: 'ri-alert-fill', color: '#f59e0b' },
};

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastIcons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      style={{
        maxWidth: 400,
        background: 'rgba(11,12,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: tokens.radius.lg,
        border: `1px solid ${config.color}`,
        padding: '16px 20px',
        boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${config.color}40`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `${config.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className={config.icon} style={{ fontSize: 20, color: config.color }} />
      </div>

      {/* Message */}
      <div style={{ flex: 1, color: tokens.color.text, fontSize: 15, lineHeight: 1.5 }}>
        {message}
      </div>

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: tokens.color.muted,
          cursor: 'pointer',
          fontSize: 20,
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i className="ri-close-line" />
      </motion.button>
    </motion.div>
  );
}

// Toast Container để quản lý nhiều toast
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10001, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook để sử dụng toast
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

