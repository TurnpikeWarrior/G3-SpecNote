import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0d1117] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500 border border-gray-600",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-100 focus:ring-gray-500",
    icon: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-100 p-1 rounded-md"
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-4 py-2"
  };

  const finalClass = `${baseStyles} ${variants[variant]} ${variant !== 'icon' ? sizes[size] : ''} ${className}`;

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
};