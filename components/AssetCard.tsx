import React from 'react';
import { AssetIdea, AssetState } from '../types';
import { Loader } from './Loader';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';

// Define some icons locally for simplicity
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
  
const AnimateIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
);

interface AssetCardProps {
  idea: AssetIdea;
  asset?: AssetState;
  onGenerate: (idea: AssetIdea) => void;
  onEdit: (asset: AssetState) => void;
  onAnimate: (asset: AssetState) => void;
  onToggleBookmark: (assetId: string) => void;
  onRemoveBackground: (assetId: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ idea, asset, onGenerate, onEdit, onAnimate, onToggleBookmark, onRemoveBackground }) => {
    const isGenerated = asset && asset.status === 'completed';
    const isProcessing = asset?.isAnimating || asset?.isRemovingBackground;

    const renderAssetContent = () => {
        if (!asset || asset.status === 'pending') {
            return (
                <div className="w-full h-full bg-gray-900/50 flex flex-col items-center justify-center p-4 text-center">
                    <button
                        onClick={() => onGenerate(idea)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                        Generate Asset
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Click to generate this visual</p>
                </div>
            );
        }

        if (asset.status === 'generating') {
            return (
                <div className="w-full h-full bg-gray-900/50 flex flex-col items-center justify-center p-4">
                    <Loader size="medium" />
                    <p className="text-sm text-gray-400 mt-2">Generating...</p>
                </div>
            );
        }

        if (asset.status === 'error') {
            return (
                <div className="w-full h-full bg-red-900/30 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-sm font-semibold text-red-300">Generation Failed</p>
                    <p className="text-xs text-red-400 mt-1">{asset.error}</p>
                    <button
                        onClick={() => onGenerate(idea)}
                        className="mt-3 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (asset.status === 'completed') {
            return asset.videoUrl ? (
                <video src={asset.videoUrl} loop muted autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
                <img src={asset.imageUrl} alt={idea.section} className="w-full h-full object-cover" />
            );
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-lg overflow-hidden shadow-lg border border-gray-700/50 flex flex-col">
            <div className="relative aspect-square w-full">
                {renderAssetContent()}
                {isProcessing && (
                     <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-t-lg">
                        <Loader message={asset.isAnimating ? "Animating..." : "Removing background..."} />
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-gray-100">{idea.section}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{idea.description}</p>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                     <button
                        onClick={() => asset && onToggleBookmark(asset.id)}
                        disabled={!isGenerated}
                        className="p-2 rounded-full text-gray-400 hover:text-yellow-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bookmark asset"
                    >
                        <BookmarkIcon filled={asset?.isBookmarked} className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => asset && onRemoveBackground(asset.id)}
                        disabled={!isGenerated || !!asset.videoUrl || isProcessing}
                        className="p-2 rounded-full text-gray-400 hover:text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Remove background"
                    >
                        <SparklesIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => asset && onEdit(asset)}
                        disabled={!isGenerated || !!asset.videoUrl || isProcessing}
                        className="p-2 rounded-full text-gray-400 hover:text-teal-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Edit asset"
                    >
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => asset && onAnimate(asset)}
                        disabled={!isGenerated || !!asset.videoUrl || isProcessing}
                        className="p-2 rounded-full text-gray-400 hover:text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Animate asset"
                    >
                        <AnimateIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};