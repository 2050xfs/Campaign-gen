
import React, { useState, useEffect, useRef } from 'react';
import { AssetState } from '../types';
import { Loader } from './Loader';
import { UploadIcon } from './icons/UploadIcon';

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface EditModalProps {
  asset: AssetState;
  isOpen: boolean;
  onClose: () => void;
  onEditSubmit: (editPrompt: string, file: File | null) => Promise<string>;
}

export const EditModal: React.FC<EditModalProps> = ({ asset, isOpen, onClose, onEditSubmit }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(asset.imageUrl);
  const [originalImageUrl] = useState(asset.imageUrl); // Keep track of original for comparison
  const [viewMode, setViewMode] = useState<'current' | 'compare'>('current');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentImageUrl(asset.imageUrl);
  }, [asset.imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setUploadedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!editPrompt.trim() && !uploadedFile) || isEditing) return;

    setIsEditing(true);
    setError(null);

    try {
      const newImageUrl = await onEditSubmit(editPrompt, uploadedFile);
      setCurrentImageUrl(newImageUrl);
      setEditPrompt('');
      handleRemoveFile();
      setViewMode('compare'); // Auto switch to compare after edit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit image.');
    } finally {
      setIsEditing(false);
    }
  };
  
  if (!isOpen) return null;

  const isModified = currentImageUrl !== originalImageUrl;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-surface rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden fade-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Preview Area */}
        <div className="relative w-full md:w-3/5 bg-black/40 flex flex-col">
            <div className="flex-grow relative flex items-center justify-center p-4 overflow-hidden">
                 {viewMode === 'current' ? (
                     <img src={currentImageUrl} alt="Current" className="max-h-full max-w-full object-contain shadow-lg rounded-lg" />
                 ) : (
                     <div className="flex gap-2 w-full h-full">
                         <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-lg p-2">
                             <span className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Original</span>
                             <img src={originalImageUrl} alt="Original" className="max-h-[calc(100%-20px)] max-w-full object-contain" />
                         </div>
                         <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-lg p-2 relative">
                             <span className="text-xs text-[var(--accent-cyan)] mb-1 uppercase tracking-wider font-bold">Edited</span>
                             <img src={currentImageUrl} alt="Edited" className="max-h-[calc(100%-20px)] max-w-full object-contain" />
                         </div>
                     </div>
                 )}

                {isEditing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                    <Loader message="Applying AI Edits..." />
                    </div>
                )}
            </div>
            
            {/* View Controls */}
            {isModified && (
                <div className="p-4 border-t border-[var(--border-glass)] flex justify-center gap-4">
                    <button 
                        onClick={() => setViewMode('current')}
                        className={`px-4 py-2 text-sm rounded-full transition-colors ${viewMode === 'current' ? 'bg-[var(--primary-blue)] text-white' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'}`}
                    >
                        Single View
                    </button>
                     <button 
                        onClick={() => setViewMode('compare')}
                        className={`px-4 py-2 text-sm rounded-full transition-colors ${viewMode === 'compare' ? 'bg-[var(--primary-blue)] text-white' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'}`}
                    >
                        Compare
                    </button>
                </div>
            )}
        </div>
        
        {/* Controls Area */}
        <div className="flex flex-col w-full md:w-2/5 border-l border-[var(--border-glass)]">
          <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-[var(--accent-cyan)]">Edit Asset</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{asset.idea.section}</p>
                </div>
                <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-white">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="edit-prompt" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Magic Edit Instruction
                </label>
                <textarea
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe what to change (e.g., 'Make it sunny', 'Change background to office', 'Add a laptop')"
                  rows={4}
                  className="w-full p-3 rounded-xl bg-black/20 border border-[var(--border-glass)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--accent-cyan)]/50 focus:ring-1 focus:ring-[var(--accent-cyan)]/50 transition-all resize-none"
                  disabled={isEditing}
                />
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {['Remove background', 'Make it darker', 'Add neon glow', 'Minimalist style'].map(suggestion => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => setEditPrompt(suggestion)}
                            className="whitespace-nowrap px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Reference Image (Optional)
                </label>
                <div className="relative">
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                    {!uploadedFile ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isEditing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--border-glass)] hover:border-[var(--accent-cyan)]/50 text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <UploadIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm">Upload Reference</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-[var(--border-glass)]">
                            <img src={URL.createObjectURL(uploadedFile)} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                            <div className="flex-grow min-w-0">
                                <p className="text-sm text-[var(--text-primary)] truncate">{uploadedFile.name}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{(uploadedFile.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button type="button" onClick={handleRemoveFile} className="p-2 text-[var(--text-secondary)] hover:text-red-400">
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
              </div>

              {error && <p className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">{error}</p>}
              
              <div className="pt-4">
                <button
                    type="submit"
                    disabled={isEditing || (!editPrompt.trim() && !uploadedFile)}
                    className="w-full py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-blue-900/20 text-white bg-gradient-to-r from-[var(--primary-blue)] to-blue-600 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                    {isEditing ? 'Applying Magic...' : 'Generate Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
