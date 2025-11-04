
import React from 'react';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';

interface LayoutSwitcherProps {
  currentLayout: 'grid' | 'table';
  onLayoutChange: (layout: 'grid' | 'table') => void;
}

export const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({ currentLayout, onLayoutChange }) => {
  return (
    <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
      <button
        onClick={() => onLayoutChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          currentLayout === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
        aria-label="Grid view"
      >
        <GridIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onLayoutChange('table')}
        className={`p-2 rounded-md transition-colors ${
          currentLayout === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
        aria-label="List view"
      >
        <ListIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
