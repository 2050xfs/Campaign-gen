
import React from 'react';
import { AssetPlaceholder } from './components/AssetPlaceholder';
import { EditModal } from './components/EditModal';
import { AnimateModal } from './components/AnimateModal';
import { LibrarySidebar } from './components/LibrarySidebar';
import { LibraryIcon } from './components/icons/LibraryIcon';
import { LayoutSwitcher } from './components/LayoutSwitcher';
import { DesignAnalysisDisplay } from './components/DesignAnalysis';
import { InputForm } from './components/InputForm';
import { AssetGrid } from './components/AssetGrid';
import { AssetTable } from './components/AssetTable';
import { Loader } from './components/Loader';
import { useAssetStudio } from './hooks/useAssetStudio';

const App: React.FC = () => {
    const {
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
    } = useAssetStudio();
    
    return (
        <div className="bg-transparent min-h-screen text-[var(--text-primary)] font-sans pb-20">
            <div className="container mx-auto px-4 py-8">
                <header className="flex justify-between items-center mb-6 fade-slide-up">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--primary-blue)]">
                                Feng Shui
                            </span> for Web
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">AI-powered design audit & asset generation studio.</p>
                    </div>
                    <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="relative p-3 rounded-full glass-surface text-[var(--text-secondary)] hover:text-white transition-all duration-300 hover:border-[var(--accent-cyan)]/50 hover:shadow-[0_0_15px_rgba(23,245,245,0.3)]"
                        aria-label="Open asset library"
                    >
                        <LibraryIcon className="h-6 w-6"/>
                        {bookmarkedAssets.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-blue)] text-xs font-bold text-white animate-pulse">
                                {bookmarkedAssets.length}
                            </span>
                        )}
                    </button>
                </header>

                <main>
                    <InputForm onFormSubmit={handleFormSubmit} isGenerating={isGeneratingIdeas} />
                    
                    {error && (
                        <div className="bg-red-900/20 border border-red-700/50 text-red-300 px-6 py-4 rounded-xl my-6 backdrop-blur-sm fade-in" role="alert">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <strong className="font-bold block">System Alert</strong>
                                    <span>{error}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {analysis && !isGeneratingIdeas && (
                        <DesignAnalysisDisplay analysis={analysis} />
                    )}

                    {hasIdeas && !isGeneratingIdeas && (
                        <div className="flex justify-between items-center mb-4 fade-in">
                            <h2 className="text-xl font-semibold text-white">Generated Assets</h2>
                            <LayoutSwitcher currentLayout={layout} onLayoutChange={setLayout} />
                        </div>
                    )}

                    {isGeneratingIdeas ? (
                        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                            {Array.from({ length: 4 }).map((_, index) => <AssetPlaceholder key={index} />)}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {layout === 'grid' ? (
                                <AssetGrid 
                                    ideas={assetIdeas}
                                    assets={assets}
                                    onGenerate={handleGenerateAsset}
                                    onEdit={asset => setEditingAsset(asset)}
                                    onAnimate={asset => setAnimatingAsset(asset)}
                                    onToggleBookmark={handleToggleBookmark}
                                    onRemoveBackground={handleRemoveBackground}
                                />
                            ) : (
                                <AssetTable
                                    ideas={assetIdeas}
                                    assets={assets}
                                    onGenerate={handleGenerateAsset}
                                    onEdit={asset => setEditingAsset(asset)}
                                    onAnimate={asset => setAnimatingAsset(asset)}
                                    onToggleBookmark={handleToggleBookmark}
                                    onRemoveBackground={handleRemoveBackground}
                                />
                            )}

                            {hasIdeas && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="group relative px-6 py-3 rounded-full glass-surface hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-2 text-[var(--accent-cyan)] font-semibold">
                                            {isLoadingMore ? <Loader size="small" /> : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                </svg>
                                            )}
                                            <span>{isLoadingMore ? 'Dreaming up more ideas...' : 'Generate More Ideas'}</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
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
                onRemove={assetId => handleToggleBookmark(assetId)}
                onBulkRemoveBackground={handleBulkRemoveBackground}
                isBulkProcessing={isBulkProcessing}
            />
        </div>
    );
};

export default App;
