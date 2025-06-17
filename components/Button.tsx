
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  // 'aria-label' is already part of ButtonHTMLAttributes
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  icon, 
  onClick, // Explicitly destructure onClick
  disabled, // Explicitly destructure disabled
  type = 'button', // Default type if not specified
  ...rest // Other HTML button attributes
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-default transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed leading-tight';
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-theme-accent-blue text-theme-accent-blue-text hover:bg-theme-accent-blue-hover focus:ring-theme-accent-blue';
      break;
    case 'secondary':
      variantStyles = 'bg-theme-bg-subtle text-theme-text-default border border-theme-border-default hover:bg-theme-border-default focus:ring-theme-accent-blue';
      break;
    case 'danger':
      variantStyles = 'bg-theme-accent-red text-theme-accent-red-text hover:bg-theme-accent-red-hover focus:ring-theme-accent-red';
      break;
    case 'outline': 
      variantStyles = 'bg-transparent text-theme-text-default border border-theme-border-default hover:bg-theme-bg-subtle focus:ring-theme-accent-blue';
      break;
    case 'ghost': 
      variantStyles = 'bg-transparent text-theme-text-default hover:bg-theme-bg-subtle focus:ring-theme-accent-blue';
      break;
    case 'custom':
      variantStyles = ''; // Will be fully overridden by className
      break;
  }

  let sizeStyles = '';
  let iconSizeClass = 'w-4 h-4'; 

  switch (size) {
    case 'sm':
      sizeStyles = `py-1.5 px-3 text-xs ${icon && children ? 'space-x-1.5' : ''}`;
      iconSizeClass = 'w-3.5 h-3.5';
      break;
    case 'md':
      sizeStyles = `py-2 px-4 text-sm ${icon && children ? 'space-x-2' : ''}`;
      break;
    case 'lg':
      sizeStyles = `py-2.5 px-6 text-base ${icon && children ? 'space-x-2' : ''}`;
      iconSizeClass = 'w-5 h-5';
      break;
  }
  
  const widthStyles = fullWidth ? 'w-full' : '';

  // Determine aria-label: use provided 'aria-label' prop, fallback to children if string, else undefined.
  // The 'aria-label' from ...rest will be used if not explicitly provided in props.
  const finalAriaLabel = rest['aria-label'] || (typeof children === 'string' ? children : undefined);


  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={finalAriaLabel}
      {...rest} // Spread remaining attributes (like id, title, etc.)
    >
      {icon && <span className={`inline-block ${iconSizeClass}`} aria-hidden="true">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
