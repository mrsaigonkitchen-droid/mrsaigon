import { tokens } from '@app/shared';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { WizardStep } from './types';

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  completedSteps,
}: StepIndicatorProps) {
  const [tooltipStep, setTooltipStep] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Auto-scroll to current step on mobile
  useEffect(() => {
    const stepElement = stepRefs.current.get(currentStep);
    const navElement = navRef.current;
    
    if (stepElement && navElement) {
      const navRect = navElement.getBoundingClientRect();
      const stepRect = stepElement.getBoundingClientRect();
      
      // Calculate scroll position to center the current step
      const scrollLeft = stepElement.offsetLeft - (navRect.width / 2) + (stepRect.width / 2);
      
      navElement.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  }, [currentStep]);

  return (
    <nav
      ref={navRef}
      className="step-indicator-nav"
      aria-label="Tiến trình báo giá"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
        borderBottom: `1px solid ${tokens.color.border}`,
        gap: 'clamp(0.25rem, 1vw, 0.5rem)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = isCompleted || step.id <= currentStep;
        const showTooltip = tooltipStep === step.id;

        return (
          <div
            key={step.id}
            ref={(el) => {
              if (el) stepRefs.current.set(step.id, el);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {/* Step Circle with Tooltip */}
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => isClickable && onStepClick(step.id)}
                onMouseEnter={() => setTooltipStep(step.id)}
                onMouseLeave={() => setTooltipStep(null)}
                onTouchStart={() => setTooltipStep(step.id)}
                onTouchEnd={() => setTimeout(() => setTooltipStep(null), 1500)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.05 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
                aria-label={`Bước ${step.id}: ${step.label}${isCompleted ? ' (Hoàn thành)' : isCurrent ? ' (Đang thực hiện)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'none',
                  border: 'none',
                  cursor: isClickable ? 'pointer' : 'default',
                  padding: '0.375rem',
                  touchAction: 'manipulation',
                }}
              >
                {/* Step Circle - Glass style */}
                <motion.div
                  animate={{
                    borderColor: isCurrent
                      ? tokens.color.primary
                      : isCompleted
                      ? tokens.color.secondary
                      : tokens.color.border,
                    boxShadow: isCurrent
                      ? `0 0 12px ${tokens.color.primary}40, inset 0 0 8px ${tokens.color.primary}20`
                      : 'none',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 'clamp(36px, 9vw, 44px)',
                    height: 'clamp(36px, 9vw, 44px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isCurrent ? '2px solid' : '1px solid',
                    background: isCurrent
                      ? `linear-gradient(135deg, ${tokens.color.primary}15, ${tokens.color.primary}08)`
                      : isCompleted
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(4px)',
                    color: isCurrent
                      ? tokens.color.primary
                      : isCompleted
                      ? tokens.color.secondary
                      : tokens.color.textMuted,
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {step.id}
                </motion.div>

                {/* Step Label - Desktop only */}
                <span
                  className="step-label-desktop"
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent
                      ? tokens.color.primary
                      : isCompleted
                      ? tokens.color.secondary
                      : tokens.color.textMuted,
                    whiteSpace: 'nowrap',
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {step.label}
                </span>
              </motion.button>

              {/* Tooltip for mobile */}
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="step-tooltip"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.primary}`,
                    borderRadius: tokens.radius.sm,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: tokens.color.primary,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: tokens.shadow.md,
                  }}
                >
                  {step.label}
                  {/* Tooltip arrow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: `6px solid ${tokens.color.primary}`,
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <motion.div
                aria-hidden="true"
                className="step-connector"
                animate={{
                  background: isCompleted
                    ? `linear-gradient(90deg, ${tokens.color.secondary}, ${tokens.color.secondary}80)`
                    : tokens.color.border,
                }}
                style={{
                  width: 'clamp(20px, 5vw, 40px)',
                  height: '1px',
                  margin: '0 clamp(0.25rem, 1vw, 0.5rem)',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}

      <style>{`
        /* Desktop: show labels */
        .step-label-desktop {
          display: block;
        }
        .step-tooltip {
          display: none;
        }
        .step-connector {
          margin-bottom: clamp(1rem, 2.5vw, 1.25rem);
        }
        
        /* Tablet & Mobile: hide labels, show tooltip */
        @media (max-width: 768px) {
          .step-label-desktop {
            display: none;
          }
          .step-tooltip {
            display: block;
          }
          .step-connector {
            margin-bottom: 0;
          }
          .step-indicator-nav {
            justify-content: flex-start !important;
          }
        }
        
        /* Hide scrollbar but keep functionality */
        .step-indicator-nav::-webkit-scrollbar {
          display: none;
        }
        .step-indicator-nav {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </nav>
  );
}

export default StepIndicator;
