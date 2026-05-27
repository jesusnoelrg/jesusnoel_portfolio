
import React from 'react';

interface ButtonProps {
  text?: string;
  type?: "submit" | "reset" | "button";
  className?: string;
  children?: React.ReactNode
}

const Button = ({children, type="button", className = ""}: ButtonProps ) => {
  return (
    <button type={type} className={`
      ${className}
      flex items-center justify-center
      gap-2
      px-6 py-2
      rounded-md border border-zinc-300 dark:border-zinc-600
      bg-black hover:bg-zinc-700  dark:bg-zinc-800 dark:hover:bg-zinc-700/80
      text-white
      transition-all duration-300
      `}>
      {children}
    </button>
  )
}

export default Button;