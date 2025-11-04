import React from 'react';
import { Loader } from './Loader';

export const AssetPlaceholder: React.FC = () => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 animate-pulse">
      <div className="w-24 h-24 bg-gray-700 rounded-md flex-shrink-0"></div>
      <div className="flex-grow space-y-3">
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="h-9 w-9 bg-gray-700 rounded-md"></div>
        <div className="h-9 w-9 bg-gray-700 rounded-md"></div>
        <div className="h-9 w-9 bg-gray-700 rounded-md"></div>
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
