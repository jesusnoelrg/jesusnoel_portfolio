import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  labelClass?: string;
  type?: "text" | "password" | "checkbox" | "email";
  required?: boolean;
  className?: string;
}

export default function Input ({
  name = "", label = "", labelClass = "", type = "text", required = false, className = "", ...props
}: InputProps){
  return (
    <label className={`flex flex-col ${labelClass}`}>
      <div>
        {label}{required as boolean ? <span className="ms-2 text-red-800">*</span> : null}
      </div>
      <input type={type} name={name} required={required}
        className={`
          px-3 py-2 
          rounded-md outline-0 border-2 border-zinc-200 dark:border-zinc-800 focus:border-purple-500/60 active:border-purple-500/60
          bg-white dark:bg-zinc-900/30
          dark:text-zinc-400
          transition-all duration-300
          ${className}`} 
        
        {...props}
      />
    </label>
  )
}

