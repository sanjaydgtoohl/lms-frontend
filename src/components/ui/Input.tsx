import React, { useState, forwardRef } from 'react';
import type { InputProps } from '../../types';

const Input = forwardRef<
  HTMLInputElement,
  InputProps &
    React.InputHTMLAttributes<HTMLInputElement> & {
      rightElement?: React.ReactNode;
    }
>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  label,
  name,
  rightElement,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputClasses = [
    'app-input',
    error ? 'app-input--error' : '',
    isPassword || rightElement ? 'pr-10' : '',
    disabled ? 'cursor-not-allowed opacity-60' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="app-label">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={name}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={props.onBlur}
          disabled={disabled}
          required={required}
          name={name}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          autoComplete={
            type === 'email' ? 'email' : type === 'password' ? 'current-password' : props.autoComplete
          }
          {...props}
        />
        {rightElement ? (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">{rightElement}</div>
        ) : (
          isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )
        )}
      </div>
      {error && (
        <p
          id={name ? `${name}-error` : undefined}
          className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
