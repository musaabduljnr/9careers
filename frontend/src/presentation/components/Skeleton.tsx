import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantStyles = {
    text: 'h-4 rounded-md',
    rectangular: 'rounded-2xl',
    circular: 'rounded-full',
  };

  return (
    <div
      role="status"
      aria-label="Loading content..."
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${variantStyles[variant]} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <Skeleton width="40%" height={20} />
      <Skeleton variant="circular" width={24} height={24} />
    </div>
    <Skeleton height={14} width="80%" />
    <Skeleton height={14} width="60%" />
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
      <Skeleton width="30%" height={16} />
      <Skeleton width="20%" height={16} />
    </div>
  </div>
);

export const SkeletonStat: React.FC = () => (
  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex flex-col justify-between h-[100px]">
    <div className="flex justify-between items-center">
      <Skeleton width="50%" height={12} />
      <Skeleton variant="circular" width={16} height={16} />
    </div>
    <Skeleton width="60%" height={32} />
  </div>
);

export const PageSkeletonLoader: React.FC = () => (
  <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-4">
    <div className="w-full h-36 bg-slate-200 dark:bg-slate-800/80 rounded-3xl animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SkeletonStat />
      <SkeletonStat />
      <SkeletonStat />
      <SkeletonStat />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
