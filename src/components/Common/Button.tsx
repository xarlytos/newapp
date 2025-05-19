import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base button styles
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center';
  
  // Size styles
  const sizeStyles = 'px-4 py-3 text-sm';
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Variant specific styles
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:text-blue-300 disabled:border-blue-300',
  };

  // Disabled state
  const isDisabled = disabled || isLoading;
  
  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${widthStyles} ${variantStyles[variant]} ${className} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;