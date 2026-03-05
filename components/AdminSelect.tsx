'use client';

import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

/**
 * AdminSelect component with proper dark mode styling
 * Ensures text is visible in both light and dark modes
 * Provides proper contrast for dropdown options
 */
export default function AdminSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  className = '',
  required = false,
  name,
  id,
}: AdminSelectProps) {
  const selectId = id || name || `select-${Math.random()}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          dark:focus:ring-emerald-500 dark:focus:border-emerald-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
      <style jsx>{`
        /* Improve option visibility in dropdown */
        select option {
          background-color: white;
          color: #1e293b;
          padding: 6px 8px;
        }

        /* Dark mode styles for option dropdown */
        @media (prefers-color-scheme: dark) {
          select option {
            background-color: #1e293b;
            color: #f1f5f9;
          }
        }
      `}</style>
    </div>
  );
}
