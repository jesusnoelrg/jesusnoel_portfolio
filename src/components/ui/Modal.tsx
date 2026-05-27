import { X } from 'lucide-react';
import '../../styles/animations.css'
import { useState } from 'react';

interface PropsModal {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  desc?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode
}

export default function Modal ({isOpen, onClose, title = "", desc = "", size = "md", children }: PropsModal){
  const [isClosing, setIsClosing] = useState(false);

  const sizes = {
    xs: "w-70",
    sm: "w-90",
    md: "w-125",
    lg: "w-200",
    xl: "w-300"
  } as const

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300)
  }

  if(!isOpen && !isClosing) return true;

  return (
    <div className={`
      modal-overlay ${isClosing ? 'closing' : ''}
      fixed top-0 left-0 w-full h-screen 
      flex justify-center items-center
      bg-black/80 text-black dark:text-white z-100`}>
      <div className={`
        modal-content
        relative
        ${sizes[size]}
        p-5
        border dark:border-zinc-800 rounded-xl
        dark:bg-zinc-950`}>
        <div className='flex items-start justify-between mb-2'>
          <div className="p-2">
            <h1 className="text-xl font-bold">{title}</h1>
            <p className='text-sm text-zinc-700 dark:text-zinc-300'>{desc}</p>
          </div>
          <button 
            className='
            p-2 rounded-xl
            text-red-400 dark:hover:bg-zinc-900
            transition-all duration-300
            '
            onClick={handleClose}
          >
            <X />
          </button>
        </div>
        <hr className='dark:text-zinc-800 mb-3'></hr>
        {children}
      </div>
    </div>
  )
}
