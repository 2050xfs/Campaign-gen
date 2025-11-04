
import React, { useState, useCallback, useMemo } from 'react';
import { AssetIdea, AssetState, GenerateInput, createPlaceholderIdea } from './types';
import * as geminiService from './services/geminiService';
import { InputForm } from './components/InputForm';
import { AssetGrid } from './components/AssetGrid';
import { AssetTable } from './components/AssetTable';
import { AssetPlaceholder } from './components/AssetPlaceholder';
import { EditModal } from './components/EditModal';
import { AnimateModal } from './components/AnimateModal';
import { LibrarySidebar } from './components/LibrarySidebar';
import { downloadZip } from './utils/downloadUtils';
import { LibraryIcon } from './components/icons/LibraryIcon';
import { LayoutSwitcher } from './components/LayoutSwitcher';

const App: React.FC = () => {
    // State management
    const [assetIdeas, setAssetIdeas] = useState<AssetIdea[]>([]);
    const [assets, setAssets] = useState<Record<string, AssetState>>({});
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingAsset, setEditingAsset] = useState<AssetState | null>(null);
    const [animatingAsset, setAnimatingAsset] = useState<AssetState | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [layout, setLayout] = useState<'grid' | 'table'>('grid');
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const bookmarkedAssets = useMemo(() => {
        // FIX: Cast Object.values(assets) to AssetState[] to resolve an issue where
        // the inferred type was 'unknown[]', preventing access to asset properties.
        return (Object.values(assets) as AssetState[]).filter(asset => asset.isBookmarked && asset.status === 'completed');
    }, [assets]);
    
    // Handlers
    const handleFormSubmit = useCallback(async (input: GenerateInput) => {
        setIsGeneratingIdeas(true);
        setError(null);
        
        const placeholders = Array.from({ length: 4 }, createPlaceholderIdea);
        setAssetIdeas(placeholders);
        setAssets({}); // Clear previous assets
        
        try {
            const newIdeas = await geminiService.generateAssetIdeas(input, 0);
            setAssetIdeas(newIdeas);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while generating ideas.');
            setAssetIdeas([]);
        } finally {
            setIsGeneratingIdeas(false);
        }
    }, []);

    const handleGenerateAsset = useCallback(async (idea: AssetIdea) => {
        setAssets(prev => ({
            ...prev,
            [idea.id]: {
                id: idea.id,
                idea,
                imageUrl: '',
                mimeType: '',
                status: 'generating',
                isBookmarked: false
            }
        }));

        try {
            const { base64, mimeType } = await geminiService.generateSingleAsset(idea.prompt);
            setAssets(prev => ({
                ...prev,
                [idea.id]: {
                    ...prev[idea.id],
                    imageUrl: `data:${mimeType};base64,${base64}`,
                    mimeType: mimeType,
                    status: 'completed',
                }
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate asset.';
            setAssets(prev => ({
                ...prev,
                [idea.id]: {
                    ...prev[idea.id],
                    status: 'error',
                    error: errorMessage,
                }
            }));
        }
    }, []);
    
    const handleToggleBookmark = useCallback((assetId: string) => {
        setAssets(prev => {
            const asset = prev[assetId];
            if (!asset || asset.status !== 'completed') return prev;
            return {
                ...prev,
                [assetId]: {
                    ...asset,
                    isBookmarked: !asset.isBookmarked
                }
            };
        });
    }, []);

    const handleEditSubmit = useCallback(async (editPrompt: string): Promise<string> => {
        if (!editingAsset) {
            throw new Error("No asset selected for editing.");
        }
        
        const currentAsset = assets[editingAsset.id];
        if (!currentAsset || currentAsset.status !== 'completed') {
            throw new Error("Asset is not ready for editing.");
        }

        const response = await fetch(currentAsset.imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                try {
                    const editedImage = await geminiService.editImage(
                        { base64: base64String, mimeType: currentAsset.mimeType },
                        editPrompt
                    );
                    const newImageUrl = `data:${editedImage.mimeType};base64,${editedImage.base64}`;
                    setAssets(prev => ({
                        ...prev,
                        [currentAsset.id]: {
                            ...prev[currentAsset.id],
                            imageUrl: newImageUrl,
                            mimeType: editedImage.mimeType,
                        }
                    }));
                    resolve(newImageUrl);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, [editingAsset, assets]);
    
    const handleAnimateSubmit = useCallback(async (animationPrompt: string): Promise<string> => {
        if (!animatingAsset) throw new Error("No asset selected for animation.");
        
        const currentAsset = assets[animatingAsset.id];
        if (currentAsset.status !== 'completed') throw new Error("Asset not ready for animation.");
        
        setAssets(prev => ({
            ...prev,
            [currentAsset.id]: { ...prev[currentAsset.id], isAnimating: true }
        }));
        
        const response = await fetch(currentAsset.imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                try {
                    const videoUrl = await geminiService.animateImage(
                        { base64: base64String, mimeType: currentAsset.mimeType },
                        animationPrompt
                    );
                    setAssets(prev => ({
                        ...prev,
                        [currentAsset.id]: { ...prev[currentAsset.id], videoUrl, isAnimating: false }
                    }));
                    resolve(videoUrl);
                } catch (err) {
                     setAssets(prev => ({
                        ...prev,
                        [currentAsset.id]: { ...prev[currentAsset.id], isAnimating: false }
                    }));
                    reject(err);
                }
            };
            reader.onerror = (error) => {
                 setAssets(prev => ({
                        ...prev,
                        [currentAsset.id]: { ...prev[currentAsset.id], isAnimating: false }
                    }));
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    }, [animatingAsset, assets]);
    
    const handleRemoveBackground = useCallback(async (assetId: string) => {
        const currentAsset = assets[assetId];
        if (!currentAsset || currentAsset.status !== 'completed' || currentAsset.videoUrl) {
            console.error("Asset not ready for background removal.");
            return;
        }
    
        setAssets(prev => ({
            ...prev,
            [assetId]: { ...prev[assetId], isRemovingBackground: true, error: undefined },
        }));
    
        try {
            const response = await fetch(currentAsset.imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
    
            await new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64String = (reader.result as string).split(',')[1];
                    try {
                        const editPrompt = "Remove the background from this image, making it transparent. The output must be a high-quality PNG with a transparent background.";
                        const editedImage = await geminiService.editImage(
                            { base64: base64String, mimeType: currentAsset.mimeType },
                            editPrompt
                        );
                        const newImageUrl = `data:${editedImage.mimeType};base64,${editedImage.base64}`;
                        setAssets(prev => ({
                            ...prev,
                            [assetId]: {
                                ...prev[assetId],
                                imageUrl: newImageUrl,
                                mimeType: editedImage.mimeType,
                                isRemovingBackground: false,
                            }
                        }));
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove background.';
            setError(`Failed to remove background for asset ${currentAsset.idea.section}.`);
            setAssets(prev => ({
                ...prev,
                [assetId]: { ...prev[assetId], isRemovingBackground: false, error: errorMessage },
            }));
        }
    }, [assets]);
    
    const handleBulkRemoveBackground = useCallback(async () => {
        setIsBulkProcessing(true);
        const imageAssetsToProcess = bookmarkedAssets.filter(asset => !asset.videoUrl);
        
        try {
            await Promise.all(imageAssetsToProcess.map(asset => handleRemoveBackground(asset.id)));
        } catch (err) {
            console.error(err);
            setError("An error occurred during bulk background removal. Some images may not have been processed.");
        } finally {
            setIsBulkProcessing(false);
        }
    }, [bookmarkedAssets, handleRemoveBackground]);

    const handleRemoveFromLibrary = useCallback((assetId: string) => {
        handleToggleBookmark(assetId);
    }, [handleToggleBookmark]);

    const handleDownloadAll = useCallback(() => {
        downloadZip(bookmarkedAssets);
    }, [bookmarkedAssets]);

    // Render logic
    const displayedIdeas = assetIdeas;
    const hasIdeas = displayedIdeas.length > 0;
    
    return (
        <div className="bg-[#0F172A] min-h-screen text-white font-sans">
            <div className="container mx-auto px-4 py-8">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
                                AssetGen Studio
                            </span>
                        </h1>
                        <p className="text-gray-400 mt-1">AI-powered visual asset generation for modern web applications.</p>
                    </div>
                    <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="relative p-2 rounded-full bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label="Open asset library"
                    >
                        <LibraryIcon className="h-6 w-6"/>
                        {bookmarkedAssets.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                {bookmarkedAssets.length}
                            </span>
                        )}
                    </button>
                </header>

                <main>
                    <InputForm onFormSubmit={handleFormSubmit} isGenerating={isGeneratingIdeas} />
                    
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg my-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {hasIdeas && !isGeneratingIdeas && (
                        <div className="flex justify-end mb-4">
                            <LayoutSwitcher currentLayout={layout} onLayoutChange={setLayout} />
                        </div>
                    )}

                    {isGeneratingIdeas ? (
                        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {Array.from({ length: 4 }).map((_, index) => <AssetPlaceholder key={index} />)}
                        </div>
                    ) : layout === 'grid' ? (
                        <AssetGrid 
                            ideas={displayedIdeas}
                            assets={assets}
                            onGenerate={handleGenerateAsset}
                            onEdit={asset => setEditingAsset(asset)}
                            onAnimate={asset => setAnimatingAsset(asset)}
                            onToggleBookmark={handleToggleBookmark}
                            onRemoveBackground={handleRemoveBackground}
                        />
                    ) : (
                        <AssetTable
                            ideas={displayedIdeas}
                            assets={assets}
                            onGenerate={handleGenerateAsset}
                            onEdit={asset => setEditingAsset(asset)}
                            onAnimate={asset => setAnimatingAsset(asset)}
                            onToggleBookmark={handleToggleBookmark}
                            onRemoveBackground={handleRemoveBackground}
                        />
                    )}
                </main>
            </div>
            
            {editingAsset && (
                <EditModal 
                    asset={editingAsset} 
                    isOpen={!!editingAsset}
                    onClose={() => setEditingAsset(null)}
                    onEditSubmit={handleEditSubmit}
                />
            )}
            
            {animatingAsset && (
                <AnimateModal
                    asset={animatingAsset}
                    isOpen={!!animatingAsset}
                    onClose={() => setAnimatingAsset(null)}
                    onAnimateSubmit={handleAnimateSubmit}
                />
            )}

            <LibrarySidebar
                assets={bookmarkedAssets}
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onRemove={handleRemoveFromLibrary}
                onDownloadAll={handleDownloadAll}
                onBulkRemoveBackground={handleBulkRemoveBackground}
                isBulkProcessing={isBulkProcessing}
            />
        </div>
    );
};

export default App;
