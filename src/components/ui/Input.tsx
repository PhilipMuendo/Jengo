'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/format';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const describedById = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm',
            'transition-colors duration-150',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
              : 'border-gray-300 hover:border-gray-400 focus:border-brand-500 focus:ring-brand-500/50',
            className
          )}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="text-sm text-red-600">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
