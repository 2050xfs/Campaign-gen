
import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium';
}

export const Loader: React.FC<LoaderProps> = ({ message, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4" aria-live="polite" aria-busy="true">
      <div className={`border-t-transparent border-[var(--accent-cyan)] rounded-full animate-spin ${sizeClasses[size]}`}></div>
      {message && <p className="mt-3 text-sm font-medium text-[var(--text-secondary)] animate-pulse">{message}</p>}
    </div>
  );
};
