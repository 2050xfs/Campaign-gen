
import { useState, useCallback, useMemo } from 'react';
import { AssetIdea, AssetState, GenerateInput, createPlaceholderIdea, ImageFile, DesignAnalysis } from '../types';
import * as geminiService from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

export const useAssetStudio = () => {
    // State management
    const [assetIdeas, setAssetIdeas] = useState<AssetIdea[]>([]);
    const [assets, setAssets] = useState<Record<string, AssetState>>({});
    const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
    
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [editingAsset, setEditingAsset] = useState<AssetState | null>(null);
    const [animatingAsset, setAnimatingAsset] = useState<AssetState | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [layout, setLayout] = useState<'grid' | 'table'>('grid');
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Store the last input to allow "Load More" functionality
    const [lastInput, setLastInput] = useState<GenerateInput | null>(null);

    const bookmarkedAssets = useMemo(() => {
        return (Object.values(assets) as AssetState[]).filter(asset => asset.isBookmarked && asset.status === 'completed');
    }, [assets]);

    const hasIdeas = assetIdeas.length > 0;
    
    // Handlers
    const handleFormSubmit = useCallback(async (input: GenerateInput) => {
        setIsGeneratingIdeas(true);
        setError(null);
        setLastInput(input);
        setAnalysis(null);
        
        const placeholders = Array.from({ length: 4 }, createPlaceholderIdea);
        setAssetIdeas(placeholders);
        setAssets({}); 
        
        try {
            const result = await geminiService.generateAssetIdeas(input, 0);
            setAnalysis(result.analysis);
            setAssetIdeas(result.ideas);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while generating ideas.');
            setAssetIdeas([]);
        } finally {
            setIsGeneratingIdeas(false);
        }
    }, []);

    const handleLoadMore = useCallback(async () => {
        if (!lastInput) return;
        
        setIsLoadingMore(true);
        setError(null);
        
        try {
            const currentCount = assetIdeas.length;
            const result = await geminiService.generateAssetIdeas(lastInput, currentCount);
            
            if (result.analysis) setAnalysis(result.analysis);
            setAssetIdeas(prev => [...prev, ...result.ideas]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more ideas.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [lastInput, assetIdeas.length]);

    const handleGenerateAsset = useCallback(async (idea: AssetIdea) => {
        setAssets(prev => ({
            ...prev,
            [idea.id]: {
                id: idea.id,
                idea,
                imageUrl: '',
                mimeType: '',
                status: 'generating',
                isBookmarked: false,
                videoUrl: undefined,
            }
        }));

        try {
            const imageFile = await geminiService.generateSingleAsset(idea.prompt);
            const imageUrl = `data:${imageFile.mimeType};base64,${imageFile.base64}`;

            setAssets(prev => ({
                ...prev,
                [idea.id]: {
                    ...prev[idea.id],
                    imageUrl,
                    mimeType: imageFile.mimeType,
                    status: 'completed'
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
                [assetId]: { ...asset, isBookmarked: !asset.isBookmarked }
            };
        });
    }, []);

    const handleEditSubmit = useCallback(async (editPrompt: string, uploadedFile: File | null): Promise<string> => {
        if (!editingAsset) throw new Error("No asset selected.");
        
        const currentAsset = assets[editingAsset.id];
        if (!currentAsset) throw new Error("Asset not found.");

        const response = await fetch(currentAsset.imageUrl);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                try {
                    let uploadedImageFile: ImageFile | null = null;
                    if (uploadedFile) {
                        uploadedImageFile = await fileToBase64(uploadedFile);
                    }

                    const editedImage = await geminiService.editImage(
                        { base64: base64String, mimeType: currentAsset.mimeType },
                        editPrompt,
                        uploadedImageFile
                    );
                    const newImageUrl = `data:${editedImage.mimeType};base64,${editedImage.base64}`;
                    
                    setAssets(prev => ({
                        ...prev,
                        [currentAsset.id]: {
                            ...prev[currentAsset.id],
                            imageUrl: newImageUrl,
                            mimeType: editedImage.mimeType,
                            videoUrl: undefined,
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
        if (!animatingAsset) throw new Error("No asset selected.");
        const currentAsset = assets[animatingAsset.id];
        
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
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, [animatingAsset, assets]);
    
    const handleRemoveBackground = useCallback(async (assetId: string) => {
        const currentAsset = assets[assetId];
        if (!currentAsset || currentAsset.status !== 'completed') return;
    
        setAssets(prev => ({ ...prev, [assetId]: { ...prev[assetId], isRemovingBackground: true, error: undefined } }));
    
        try {
            const response = await fetch(currentAsset.imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
    
            await new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64String = (reader.result as string).split(',')[1];
                    try {
                        const editedImage = await geminiService.editImage(
                            { base64: base64String, mimeType: currentAsset.mimeType },
                            "Remove background. Return transparent PNG."
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
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            setAssets(prev => ({ ...prev, [assetId]: { ...prev[assetId], isRemovingBackground: false, error: 'BG Removal Failed' } }));
        }
    }, [assets]);
    
    const handleBulkRemoveBackground = useCallback(async () => {
        setIsBulkProcessing(true);
        const imageAssetsToProcess = bookmarkedAssets.filter(asset => !asset.videoUrl);
        try {
            await Promise.all(imageAssetsToProcess.map(asset => handleRemoveBackground(asset.id)));
        } catch (err) {
            setError("Bulk processing encountered errors.");
        } finally {
            setIsBulkProcessing(false);
        }
    }, [bookmarkedAssets, handleRemoveBackground]);

    return {
        assetIdeas,
        assets,
        analysis,
        isGeneratingIdeas,
        isLoadingMore,
        error,
        editingAsset,
        setEditingAsset,
        animatingAsset,
        setAnimatingAsset,
        isLibraryOpen,
        setIsLibraryOpen,
        layout,
        setLayout,
        isBulkProcessing,
        bookmarkedAssets,
        handleFormSubmit,
        handleLoadMore,
        handleGenerateAsset,
        handleToggleBookmark,
        handleEditSubmit,
        handleAnimateSubmit,
        handleRemoveBackground,
        handleBulkRemoveBackground,
        hasIdeas,
    };
};
