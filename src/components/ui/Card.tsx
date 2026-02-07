import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'gradient' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const variantStyles = {
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    solid: 'bg-[#1A2332]',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10',
    outline: 'bg-transparent border-2 border-white/10',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-5 md:p-6',
  };
  
  return (
    <div
      className={`
        rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]}
        ${hover ? 'hover:bg-white/8 hover:border-white/15 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
