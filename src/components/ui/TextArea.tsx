// src/components/ui/Textarea.tsx
import React from 'react';

interface TextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  name: string;
  rows?: number;
  cols?: number;
  placeholder?: string;
  maxLength?: number;
  minLength?: number; 
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  wrap?: "hard" | "soft" | "off";
  autoFocus?: boolean;
  form?: string;
  className?: string;
  labelClass?: string;
}

export default function Textarea({
  label = "",
  name,
  rows,
  cols,
  placeholder,
  maxLength,
  minLength,
  required = false,
  readOnly = false,
  disabled = false,
  wrap,
  autoFocus = false,
  form,
  className = "",
  labelClass = "",
  ...props
}: TextareaProps) {
  return (
    <label className="flex flex-col text-black dark:text-white">
      <div className="mb-2 font-medium">
        {label}
        {required ? <span className="ms-1 text-red-500">*</span> : null}
      </div>
      
      <textarea
        name={name}
        rows={rows}
        cols={cols}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        wrap={wrap}
        autoFocus={autoFocus}
        form={form}
        className={`
          ${className}
          px-3 py-2
          rounded-md outline-none border-2 border-zinc-200 dark:border-zinc-800 
          bg-white dark:bg-zinc-900/30
          text-zinc-800 dark:text-zinc-400
          focus:border-purple-500/60 transition-colors duration-200
          
        `}

        {...props}
      />
    </label>
  );
}