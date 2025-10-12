import { CSSProperties } from 'react';
import { tokens } from '@app/shared';

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'date' | 'time';
  label?: string;
  error?: string;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  error,
  icon,
  disabled = false,
  required = false,
  fullWidth = false,
  style,
}: InputProps) {
  return (
    <div 
      style={{ width: fullWidth ? '100%' : 'auto', ...style }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {label && (
        <label
          style={{
            display: 'block',
            color: tokens.color.text,
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {label}
          {required && <span style={{ color: tokens.color.error, marginLeft: 4 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <i
            className={icon}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: tokens.color.muted,
              fontSize: 18,
            }}
          />
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            // Prevent Enter key from submitting form
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          onInput={(e) => e.stopPropagation()}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: icon ? '12px 16px 12px 44px' : '12px 16px',
            background: 'rgba(12,12,16,0.6)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${error ? tokens.color.error : tokens.color.border}`,
            borderRadius: '12px',
            color: tokens.color.text,
            fontSize: 14,
            fontWeight: 400,
            outline: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = tokens.color.primary;
              e.target.style.boxShadow = '0 4px 16px rgba(245,211,147,0.2)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = tokens.color.border;
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }}
        />
      </div>
      {error && (
        <div style={{ color: tokens.color.error, fontSize: 12, marginTop: 4 }}>
          <i className="ri-error-warning-line" style={{ marginRight: 4 }} />
          {error}
        </div>
      )}
    </div>
  );
}

interface TextAreaProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  fullWidth?: boolean;
  style?: CSSProperties;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  fullWidth = false,
  style,
}: TextAreaProps) {
  return (
    <div 
      style={{ width: fullWidth ? '100%' : 'auto', ...style }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {label && (
        <label
          style={{
            display: 'block',
            color: tokens.color.text,
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {label}
          {required && <span style={{ color: tokens.color.error, marginLeft: 4 }}>*</span>}
        </label>
      )}
      <textarea
        value={value ?? ''}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onKeyPress={(e) => e.stopPropagation()}
        onInput={(e) => e.stopPropagation()}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(12,12,16,0.6)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${error ? tokens.color.error : tokens.color.border}`,
          borderRadius: '12px',
          color: tokens.color.text,
          fontSize: 14,
          fontWeight: 400,
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = tokens.color.primary;
            e.target.style.boxShadow = '0 4px 16px rgba(245,211,147,0.2)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = tokens.color.border;
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
      />
      {error && (
        <div style={{ color: tokens.color.error, fontSize: 12, marginTop: 4 }}>
          <i className="ri-error-warning-line" style={{ marginRight: 4 }} />
          {error}
        </div>
      )}
    </div>
  );
}

