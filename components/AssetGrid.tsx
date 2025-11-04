import React from 'react';
import { AssetIdea, AssetState } from '../types';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
  ideas: AssetIdea[];
  assets: Record<string, AssetState>;
  onGenerate: (idea: AssetIdea) => void;
  onEdit: (asset: AssetState) => void;
  onAnimate: (asset: AssetState) => void;
  onToggleBookmark: (assetId: string) => void;
  onRemoveBackground: (assetId: string) => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({ ideas, assets, onGenerate, onEdit, onAnimate, onToggleBookmark, onRemoveBackground }) => {
    if (ideas.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">No ideas generated yet. Start by filling out the form above.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ideas.map((idea) => (
            <AssetCard
                key={idea.id}
                idea={idea}
                asset={assets[idea.id]}
                onGenerate={onGenerate}
                onEdit={onEdit}
                onAnimate={onAnimate}
                onToggleBookmark={onToggleBookmark}
                onRemoveBackground={onRemoveBackground}
            />
        ))}
        </div>
    );
};