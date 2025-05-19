import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant: primary, secondary or link style */
  variant?: 'primary' | 'secondary' | 'link';
  className?: string;
}

/**
 * Button with basic variants for primary, secondary or link styles
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const baseClasses = 'px-4 py-2 rounded';
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-indigo-600 text-white hover:bg-indigo-700';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      break;
    case 'link':
      variantClasses = 'text-indigo-600 hover:underline bg-transparent p-0';
      break;
  }
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2';
  const ringColor = variant === 'primary'
    ? 'focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-800'
    : variant === 'secondary'
      ? 'focus:ring-gray-400 focus:ring-offset-white dark:focus:ring-offset-gray-800'
      : '';
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${focusClasses} ${ringColor} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;