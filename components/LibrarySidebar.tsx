
import React, { useState, useMemo } from 'react';
import { AssetState } from '../types';
import { Loader } from './Loader';
import { downloadZip, downloadSingleAsset } from '../utils/downloadUtils';

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);


interface LibrarySidebarProps {
  assets: AssetState[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (assetId: string) => void;
  onBulkRemoveBackground: () => void;
  isBulkProcessing: boolean;
}

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ assets, isOpen, onClose, onRemove, onBulkRemoveBackground, isBulkProcessing }) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
        const typeMatch = filter === 'all' ||
            (filter === 'image' && !asset.videoUrl) ||
            (filter === 'video' && !!asset.videoUrl);
        
        const searchMatch = !searchTerm || 
            asset.idea.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.idea.description.toLowerCase().includes(searchTerm.toLowerCase());

        return typeMatch && searchMatch;
    });
  }, [assets, filter, searchTerm]);
  
  const imageAssetsCount = filteredAssets.filter(a => !a.videoUrl).length;
    
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md glass-surface shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-[var(--border-glass)] flex-shrink-0">
            <h2 className="text-xl font-bold text-[var(--accent-cyan)]">Asset Library</h2>
            <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-white/10 hover:text-white">
              <CloseIcon className="h-6 w-6" />
            </button>
          </header>
          
          {assets.length > 0 ? (
            <>
              <div className="p-4 border-b border-[var(--border-glass)] flex-shrink-0 space-y-3">
                    <input 
                        type="text" 
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white/5 border border-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 focus:border-[var(--accent-cyan)]/50 focus:ring-0"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Show:</span>
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-[var(--primary-blue)] text-white' : 'bg-white/10 hover:bg-white/20 text-[var(--text-secondary)]'}`}>All</button>
                        <button onClick={() => setFilter('video')} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'video' ? 'bg-[var(--primary-blue)] text-white' : 'bg-white/10 hover:bg-white/20 text-[var(--text-secondary)]'}`}>With Video</button>
                        <button onClick={() => setFilter('image')} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'image' ? 'bg-[var(--primary-blue)] text-white' : 'bg-white/10 hover:bg-white/20 text-[var(--text-secondary)]'}`}>Images Only</button>
                    </div>
                </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors">
                    <div className="relative w-16 h-16 bg-black/20 rounded-md flex-shrink-0 flex items-center justify-center">
                        {asset.videoUrl ? (
                             <video src={asset.videoUrl} loop muted autoPlay playsInline className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                             <img src={asset.imageUrl} alt={asset.idea.section} className="max-h-full max-w-full object-contain rounded-md" />
                        )}
                        {asset.isRemovingBackground && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{asset.idea.section}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{asset.idea.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                       <button onClick={() => downloadSingleAsset(asset)} className="p-2 text-[var(--text-secondary)] hover:text-blue-400" aria-label="Download asset">
                           <DownloadIcon className="h-5 w-5" />
                       </button>
                       <button onClick={() => onRemove(asset.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-400" aria-label="Remove asset from library">
                           <TrashIcon className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              <footer className="p-4 border-t border-[var(--border-glass)] flex-shrink-0 space-y-2">
                <button 
                  onClick={() => downloadZip(filteredAssets)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-blue)]"
                >
                  Download Filtered ({filteredAssets.length})
                </button>
                <button 
                  onClick={onBulkRemoveBackground}
                  disabled={isBulkProcessing || imageAssetsCount === 0}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-slate-900 bg-[var(--accent-cyan)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-cyan)] disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {isBulkProcessing ? <Loader size="small" /> : null}
                  {isBulkProcessing ? 'Processing...' : `Remove Backgrounds (${imageAssetsCount})`}
                </button>
              </footer>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-4">
              <div>
                <p className="text-[var(--text-secondary)]">Your library is empty.</p>
                <p className="text-sm text-gray-500">Add generated assets to see them here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
