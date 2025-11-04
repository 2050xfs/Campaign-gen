import React from 'react';
import { AssetIdea, AssetState } from '../types';
import { Loader } from './Loader';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';

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


interface AssetTableProps {
  ideas: AssetIdea[];
  assets: Record<string, AssetState>;
  onGenerate: (idea: AssetIdea) => void;
  onEdit: (asset: AssetState) => void;
  onAnimate: (asset: AssetState) => void;
  onToggleBookmark: (assetId: string) => void;
  onRemoveBackground: (assetId: string) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({ ideas, assets, onGenerate, onEdit, onAnimate, onToggleBookmark, onRemoveBackground }) => {
    if (ideas.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">No ideas generated yet. Start by filling out the form above.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_100px] md:grid-cols-[120px_1fr_2fr_120px] gap-4 p-4 font-bold text-gray-400 text-sm border-b border-gray-700/50">
                <div className="hidden md:block">Preview</div>
                <div>Section</div>
                <div>Description</div>
                <div className="text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-700/50">
                {ideas.map((idea) => {
                    const asset = assets[idea.id];
                    const isGenerated = asset && asset.status === 'completed';
                    const isProcessing = asset?.isAnimating || asset?.isRemovingBackground;

                    return (
                        <div key={idea.id} className="grid grid-cols-[1fr_2fr_100px] md:grid-cols-[120px_1fr_2fr_120px] gap-4 p-4 items-center">
                            <div className="hidden md:block aspect-square w-full bg-gray-900/50 rounded-md flex items-center justify-center">
                                {!asset ? (
                                    <span className="text-xs text-gray-500">Not Generated</span>
                                ) : asset.status === 'generating' || isProcessing ? (
                                    <Loader size="small" />
                                ) : asset.status === 'error' ? (
                                    <span className="text-xs text-red-400 p-2 text-center">Failed</span>
                                ) : asset.videoUrl ? (
                                    <video src={asset.videoUrl} loop muted autoPlay playsInline className="max-h-full max-w-full object-contain rounded-md" />
                                ) : (
                                    <img src={asset.imageUrl} alt={idea.section} className="max-h-full max-w-full object-contain rounded-md" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-200">{idea.section}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 line-clamp-2">{idea.description}</p>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                {!asset ? (
                                    <button onClick={() => onGenerate(idea)} className="px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700">Generate</button>
                                ) : asset.status === 'error' ? (
                                    <button onClick={() => onGenerate(idea)} className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700">Retry</button>
                                ) : (
                                    <>
                                        <button onClick={() => asset && onToggleBookmark(asset.id)} disabled={!isGenerated} className="p-2 rounded-full text-gray-400 hover:text-yellow-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"><BookmarkIcon filled={asset?.isBookmarked} className="h-5 w-5" /></button>
                                        <button onClick={() => asset && onRemoveBackground(asset.id)} disabled={!isGenerated || !!asset.videoUrl || isProcessing} className="p-2 rounded-full text-gray-400 hover:text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"><SparklesIcon className="h-5 w-5" /></button>
                                        <button onClick={() => asset && onEdit(asset)} disabled={!isGenerated || !!asset.videoUrl || isProcessing} className="p-2 rounded-full text-gray-400 hover:text-teal-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => asset && onAnimate(asset)} disabled={!isGenerated || !!asset.videoUrl || isProcessing} className="p-2 rounded-full text-gray-400 hover:text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"><AnimateIcon className="h-5 w-5" /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};