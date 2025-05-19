import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card component with default styling (background, shadow, padding)
 */
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg ${className}`}>
    {children}
  </div>
);

export default Card;