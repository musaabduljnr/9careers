import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  const hoverStyles = hoverEffect 
    ? 'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-emerald-950/20' 
    : '';

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm transition-all duration-300 ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
