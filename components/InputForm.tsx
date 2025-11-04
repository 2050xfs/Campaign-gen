import React, { useState, useRef } from 'react';
import { GenerateInput } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { LinkIcon } from './icons/LinkIcon';
import { Loader } from './Loader';

interface InputFormProps {
  onFormSubmit: (input: GenerateInput) => void;
  isGenerating: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onFormSubmit, isGenerating }) => {
  const [brief, setBrief] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    if (file) {
      onFormSubmit({ type: 'file', file, tips: brief });
    } else if (url.trim()) {
      onFormSubmit({ type: 'url', url: url.trim() });
    } else if (brief.trim()) {
      onFormSubmit({ type: 'text', value: brief.trim() });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl(''); // Prioritize file over URL
      setShowUrlInput(false);
    }
  };

  const handleUrlToggle = () => {
      setShowUrlInput(prev => !prev);
      if (!showUrlInput) {
          setFile(null); // Clear file if switching to URL
      }
  }

  const getButtonText = () => {
      if (isGenerating) return 'Generating...';
      if (file) return 'Generate from Screenshot';
      if (url.trim() && showUrlInput) return 'Generate from URL';
      return 'Generate Ideas';
  }
  
  const isSubmitDisabled = isGenerating || (!file && !url.trim() && !brief.trim());

  return (
    <div className="bg-[#1E293B] p-6 rounded-lg shadow-lg border border-gray-700/50 mb-8">
      <h2 className="text-2xl font-bold text-teal-300 mb-2">Create Visual Assets</h2>
      <p className="text-gray-400 mb-6">
        Start with a creative brief, or provide a screenshot/URL for context-aware generation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="brief" className="sr-only">
            {file ? 'Creative Brief (optional)' : 'Creative Brief'}
          </label>
          <textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={
                file ? "Provide a creative brief for this screenshot (e.g., 'focus on the hero section')..." :
                "Describe your app or a component (e.g., 'A modern, minimalist to-do list app')..."
            }
            rows={3}
            className="w-full p-3 rounded-md bg-gray-900/70 border border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-colors"
            disabled={isGenerating}
          />
        </div>

        {showUrlInput && (
            <div className="relative">
                <LinkIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="url"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        if(e.target.value) setFile(null); // Prioritize URL
                    }}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-900/70 border border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    disabled={isGenerating}
                />
            </div>
        )}

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    className={`p-2 rounded-md transition-colors text-gray-400 hover:text-white ${file ? 'bg-blue-600/30 text-blue-300' : 'bg-gray-700/60 hover:bg-gray-600'}`}
                    aria-label="Upload screenshot"
                >
                    <UploadIcon className="h-5 w-5"/>
                </button>
                <button
                    type="button"
                    onClick={handleUrlToggle}
                    disabled={isGenerating}
                    className={`p-2 rounded-md transition-colors text-gray-400 hover:text-white ${showUrlInput ? 'bg-blue-600/30 text-blue-300' : 'bg-gray-700/60 hover:bg-gray-600'}`}
                    aria-label="Analyze URL"
                >
                    <LinkIcon className="h-5 w-5"/>
                </button>
                {file && <span className="text-sm text-gray-400 truncate max-w-xs">{file.name}</span>}
            </div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? <Loader size="small" /> : <UploadIcon className="h-5 w-5" />}
            {getButtonText()}
          </button>
        </div>
      </form>
    </div>
  );
};
