
import { v4 as uuidv4 } from 'uuid';

// Global declaration for window.aistudio
// FIX: Defined an AIStudio interface and used it for window.aistudio. This resolves
// the "Subsequent property declarations must have the same type" error by ensuring
// consistency with other declarations that expect the 'AIStudio' type.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface ImageFile {
  base64: string;
  mimeType: string;
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

export type GenerateInput = 
  | { type: 'text'; value: string }
  | { type: 'file'; file: File; tips?: string }
  | { type: 'url'; url: string };

// Helper function to create a placeholder AssetIdea
export const createPlaceholderIdea = (): AssetIdea => ({
    id: uuidv4(),
    section: 'Generating Idea...',
    description: 'Please wait while we come up with a new creative concept.',
    prompt: '',
    animationPrompt: '',
});
