import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium';
}

export const Loader: React.FC<LoaderProps> = ({ message, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center my-4" aria-live="polite" aria-busy="true">
      <div className={`border-t-transparent border-blue-400 rounded-full animate-spin ${sizeClasses[size]}`}></div>
      {message && <p className="mt-4 text-gray-400 text-center">{message}</p>}
    </div>
  );
};
