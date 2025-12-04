import { v4 as uuidv4 } from 'uuid';

export interface ImageFile {
  base64: string;
  mimeType: string;
}

export interface GuidedBrief {
    keywords: string;
    styles: string[];
    colors: string[];
    instructions: string;
}

export interface DesignAnalysis {
    score: number;
    detectedStyle: string;
    colorPalette: string[];
    critique: string;
    suggestions: string[];
}

export interface AssetIdea {
  id: string;
  section: string;
  description: string;
  prompt: string;
  animationPrompt: string;
}

export interface AssetState {
  id: string; // Corresponds to AssetIdea ID
  idea: AssetIdea;
  imageUrl: string;
  mimeType: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
  isBookmarked: boolean;
  videoUrl?: string;
  isAnimating?: boolean;
  isRemovingBackground?: boolean;
}

export interface GenerationResult {
    analysis: DesignAnalysis;
    ideas: AssetIdea[];
}

export type GenerateInput = 
  | { type: 'text'; brief: GuidedBrief }
  | { type: 'file'; file: File; brief: GuidedBrief }
  | { type: 'url'; url: string; brief: GuidedBrief };

// Helper function to create a placeholder AssetIdea
export const createPlaceholderIdea = (): AssetIdea => ({
    id: uuidv4(),
    section: 'Generating Idea...',
    description: 'Please wait while we come up with a new creative concept.',
    prompt: '',
    animationPrompt: '',
});

// Global declaration for window.aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
