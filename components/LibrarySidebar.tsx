import React from 'react';
import { AssetState } from '../types';
import { Loader } from './Loader';

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
  onDownloadAll: () => void;
  onBulkRemoveBackground: () => void;
  isBulkProcessing: boolean;
}

const handleDownloadSingle = async (asset: AssetState) => {
    const url = asset.videoUrl || asset.imageUrl;
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileExtension = asset.videoUrl ? 'mp4' : asset.mimeType.split('/')[1] || 'png';
    link.download = `${asset.idea.section.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}


export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ assets, isOpen, onClose, onRemove, onDownloadAll, onBulkRemoveBackground, isBulkProcessing }) => {
  const imageAssetsCount = assets.filter(a => !a.videoUrl).length;
    
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#1E293B] shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
            <h2 className="text-xl font-bold text-teal-300">Asset Library</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
              <CloseIcon className="h-6 w-6" />
            </button>
          </header>
          
          {assets.length > 0 ? (
            <>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg">
                    <div className="relative w-16 h-16 bg-gray-900 rounded-md flex-shrink-0 flex items-center justify-center">
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
                      <p className="text-sm font-semibold text-gray-200 truncate">{asset.idea.section}</p>
                      <p className="text-xs text-gray-500 truncate">{asset.idea.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                       <button onClick={() => handleDownloadSingle(asset)} className="p-2 text-gray-400 hover:text-blue-400" aria-label="Download asset">
                           <DownloadIcon className="h-5 w-5" />
                       </button>
                       <button onClick={() => onRemove(asset.id)} className="p-2 text-gray-400 hover:text-red-400" aria-label="Remove asset from library">
                           <TrashIcon className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              <footer className="p-4 border-t border-gray-700/50 flex-shrink-0 space-y-2">
                <button 
                  onClick={onDownloadAll}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download All (.zip)
                </button>
                <button 
                  onClick={onBulkRemoveBackground}
                  disabled={isBulkProcessing || imageAssetsCount === 0}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
                >
                  {isBulkProcessing ? <Loader size="small" /> : null}
                  {isBulkProcessing ? 'Processing...' : `Remove Backgrounds (${imageAssetsCount})`}
                </button>
              </footer>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-4">
              <div>
                <p className="text-gray-400">Your library is empty.</p>
                <p className="text-sm text-gray-500">Add generated assets to see them here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};