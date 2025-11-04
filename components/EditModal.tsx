import React, { useState, useEffect } from 'react';
import { AssetState } from '../types';
import { Loader } from './Loader';

interface EditModalProps {
  asset: AssetState;
  isOpen: boolean;
  onClose: () => void;
  onEditSubmit: (editPrompt: string) => Promise<string>;
}

export const EditModal: React.FC<EditModalProps> = ({ asset, isOpen, onClose, onEditSubmit }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(asset.imageUrl);

  useEffect(() => {
    setCurrentImageUrl(asset.imageUrl);
  }, [asset.imageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt || isEditing) return;

    setIsEditing(true);
    setError(null);

    try {
      const newImageUrl = await onEditSubmit(editPrompt);
      setCurrentImageUrl(newImageUrl);
      setEditPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit image.');
    } finally {
      setIsEditing(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1E293B] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row gap-6 p-6 border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full md:w-1/2 flex-shrink-0 bg-gray-900/50 rounded-lg flex items-center justify-center aspect-square">
          <img src={currentImageUrl} alt={asset.idea.section} className="max-h-full max-w-full object-contain rounded-lg"/>
          {isEditing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <Loader message="Regenerating..." />
            </div>
          )}
        </div>
        
        <div className="flex flex-col w-full md:w-1/2">
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-teal-300">{asset.idea.section}</h2>
            <p className="text-sm text-gray-400 mt-2">{asset.idea.description}</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300">
                  Edit Instruction
                </label>
                <textarea
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., 'Add a retro filter', 'Make the background darker'"
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-900/70 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  disabled={isEditing}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={isEditing || !editPrompt}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
              >
                {isEditing ? 'Regenerating...' : 'Regenerate Image'}
              </button>
            </form>
          </div>
          <button 
            onClick={onClose}
            className="mt-4 text-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
