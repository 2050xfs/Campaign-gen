import React from 'react';
import { Loader } from './Loader';

export const AssetPlaceholder: React.FC = () => {
  return (
    <div className="glass-surface rounded-2xl overflow-hidden shadow-lg flex flex-col animate-pulse">
        <div className="aspect-square w-full bg-white/10"></div>
        <div className="p-4 flex-grow flex flex-col justify-between">
            <div className="space-y-3">
                <div className="h-5 bg-white/10 rounded w-2/3"></div>
                <div className="h-3 bg-white/10 rounded w-full"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
                <div className="h-7 w-7 bg-white/10 rounded-full"></div>
                <div className="h-7 w-7 bg-white/10 rounded-full"></div>
                <div className="h-7 w-7 bg-white/10 rounded-full"></div>
                <div className="h-7 w-7 bg-white/10 rounded-full"></div>
            </div>
        </div>
      </div>
  );
};

export const GeneratingPlaceholder: React.FC<{section: string}> = ({ section }) => {
    return (
      <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
        <div className="w-24 h-24 bg-gray-900/50 rounded-md flex-shrink-0 flex items-center justify-center">
            <Loader size="medium" />
        </div>
        <div className="flex-grow">
          <p className="text-lg font-semibold text-gray-200">{section}</p>
          <p className="text-sm text-gray-400">The creative robots are at work...</p>
        </div>
      </div>
    );
};