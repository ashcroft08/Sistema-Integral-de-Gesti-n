import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false, type = 'button', variant = 'primary' }) => {
  const baseClasses = 'flex items-center justify-center rounded-lg text-base font-bold transition-opacity hover:opacity-90';
  const variantClasses = {
    primary: 'bg-primary text-white',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
  };
  const sizeClasses = className.includes('h-') ? '' : 'h-14';
  const widthClasses = className.includes('w-') || className.includes('min-w-') ? '' : 'w-full';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses} ${widthClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;