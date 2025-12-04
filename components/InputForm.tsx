import React, { useState, useRef } from 'react';
import { GenerateInput, GuidedBrief } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { LinkIcon } from './icons/LinkIcon';
import { Loader } from './Loader';
import { PaletteIcon } from './icons/PaletteIcon';
import { TagIcon } from './icons/TagIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';

interface InputFormProps {
  onFormSubmit: (input: GenerateInput) => void;
  isGenerating: boolean;
}

const ALL_STYLES = ["Photorealistic", "Illustration", "Line Art", "3D Render", "Vintage", "Minimalist", "Abstract", "Corporate"];

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const InputForm: React.FC<InputFormProps> = ({ onFormSubmit, isGenerating }) => {
  const [instructions, setInstructions] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleAddColor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && currentColor.trim() && colors.length < 5) {
      e.preventDefault();
      const newColor = currentColor.trim();
      if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
          if (!colors.includes(newColor)) {
            setColors([...colors, newColor]);
          }
          setCurrentColor('');
      }
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setColors(colors.filter(c => c !== colorToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    const brief: GuidedBrief = {
        keywords,
        styles: selectedStyles,
        colors,
        instructions
    };

    if (file) {
      onFormSubmit({ type: 'file', file, brief });
    } else if (url.trim()) {
      onFormSubmit({ type: 'url', url: url.trim(), brief });
    } else if (Object.values(brief).some(v => (Array.isArray(v) ? v.length > 0 : !!v))) {
      onFormSubmit({ type: 'text', brief });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl(''); 
      setShowUrlInput(false);
    }
  };

  const handleUrlToggle = () => {
      setShowUrlInput(prev => !prev);
      if (!showUrlInput) {
          setFile(null);
      }
  }

  const getButtonText = () => {
      if (isGenerating) return 'Generating...';
      if (file) return 'Generate from Screenshot';
      if (url.trim() && showUrlInput) return 'Generate from URL';
      return 'Generate Ideas';
  }
  
  const isBriefEmpty = !instructions.trim() && !keywords.trim() && selectedStyles.length === 0 && colors.length === 0;
  const isSubmitDisabled = isGenerating || (!file && !url.trim() && isBriefEmpty);

  return (
    <div className="glass-surface p-6 rounded-2xl shadow-lg mb-8">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-[var(--accent-cyan)] mb-2">Create Visual Assets</h2>
            <p className="text-[var(--text-secondary)] mb-6">
                Start with a creative brief, or provide a screenshot/URL for context-aware generation.
            </p>
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-semibold text-[var(--primary-blue)] hover:text-[var(--primary-blue-hover)] transition-colors">
            {showAdvanced ? 'Simple Brief' : 'Advanced Brief'}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="brief" className="sr-only">
            {file ? 'Creative Brief (optional)' : 'Creative Brief'}
          </label>
          <textarea
            id="brief"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Describe your app, component, or the primary goal for the visual assets..."
            rows={3}
            className="w-full p-3 rounded-lg bg-white/5 border border-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 focus:border-[var(--accent-cyan)]/50 focus:ring-0 transition-all duration-300"
            disabled={isGenerating}
          />
        </div>

        {showAdvanced && (
            <div className="space-y-4 p-4 bg-black/10 rounded-lg fade-in">
                {/* Keywords */}
                <div>
                    <label htmlFor="keywords" className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                        <TagIcon className="h-5 w-5 text-[var(--accent-cyan)]" />
                        Brand Essence Keywords
                    </label>
                    <input
                        id="keywords"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., minimalist, playful, corporate, luxurious"
                        className="w-full p-2 rounded-lg bg-white/5 border border-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 focus:border-[var(--accent-cyan)]/50 focus:ring-0"
                        disabled={isGenerating}
                    />
                </div>
                {/* Styles */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                        <PaintBrushIcon className="h-5 w-5 text-[var(--accent-cyan)]" />
                        Visual Styles
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_STYLES.map(style => (
                            <button
                                type="button"
                                key={style}
                                onClick={() => handleStyleToggle(style)}
                                disabled={isGenerating}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedStyles.includes(style) ? 'bg-[var(--primary-blue)] text-white' : 'bg-white/10 hover:bg-white/20 text-[var(--text-secondary)]'}`}
                            >{style}</button>
                        ))}
                    </div>
                </div>
                {/* Colors */}
                <div>
                    <label htmlFor="colors" className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                        <PaletteIcon className="h-5 w-5 text-[var(--accent-cyan)]" />
                        Color Palette (Hex Codes)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                        {colors.map(color => (
                            <div key={color} className="flex items-center gap-1 bg-white/10 rounded-full pl-2 pr-1">
                                <span style={{ backgroundColor: color }} className="w-4 h-4 rounded-full border border-white/20"></span>
                                <span className="text-xs font-mono">{color}</span>
                                <button type="button" onClick={() => handleRemoveColor(color)} className="p-0.5 rounded-full hover:bg-white/20"><CloseIcon className="h-3 w-3" /></button>
                            </div>
                        ))}
                         <input
                            id="colors"
                            value={currentColor}
                            onChange={(e) => setCurrentColor(e.target.value)}
                            onKeyDown={handleAddColor}
                            placeholder="#17F5F5"
                            className="w-24 p-2 rounded-lg bg-white/5 border border-transparent text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 focus:border-[var(--accent-cyan)]/50 focus:ring-0"
                            disabled={isGenerating || colors.length >= 5}
                        />
                    </div>
                </div>
            </div>
        )}

        {showUrlInput && (
            <div className="relative">
                <LinkIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="url"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        if(e.target.value) setFile(null);
                    }}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 focus:border-[var(--accent-cyan)]/50 focus:ring-0 transition-all duration-300"
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
                    className={`p-2 rounded-full transition-all duration-300 text-[var(--text-secondary)] hover:text-white ${file ? 'bg-[var(--primary-blue)]/30 text-[var(--accent-cyan)]' : 'bg-white/10 hover:bg-white/20'}`}
                    aria-label="Upload screenshot"
                >
                    <UploadIcon className="h-5 w-5"/>
                </button>
                <button
                    type="button"
                    onClick={handleUrlToggle}
                    disabled={isGenerating}
                    className={`p-2 rounded-full transition-all duration-300 text-[var(--text-secondary)] hover:text-white ${showUrlInput ? 'bg-[var(--primary-blue)]/30 text-[var(--accent-cyan)]' : 'bg-white/10 hover:bg-white/20'}`}
                    aria-label="Analyze URL"
                >
                    <LinkIcon className="h-5 w-5"/>
                </button>
                {file && <span className="text-sm text-[var(--text-secondary)] truncate max-w-xs">{file.name}</span>}
            </div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-blue)] disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {isGenerating ? <Loader size="small" /> : <UploadIcon className="h-5 w-5" />}
            {getButtonText()}
          </button>
        </div>
      </form>
    </div>
  );
};