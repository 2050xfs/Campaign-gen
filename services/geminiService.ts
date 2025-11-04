
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageFile, AssetIdea, GenerateInput } from "../types";
import { fileToBase64 } from "../utils/fileUtils";
import { v4 as uuidv4 } from 'uuid';

const MAX_IDEAS_PER_BATCH = 20;

// Helper to safely parse JSON from a model's response
const parseJsonResponse = (jsonString: string): any => {
    try {
        const cleanedString = jsonString.trim().replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedString);
    } catch (e) {
        console.error("Failed to parse JSON:", jsonString);
        throw new Error("The model returned an invalid format. Please try again.");
    }
};

const getAiClient = () => {
    // FIX: Per coding guidelines, the API key must be sourced exclusively from
    // process.env.API_KEY without any fallback or placeholder logic.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const ideasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            section: { type: Type.STRING, description: "A short, descriptive name for the UI section or component (e.g., 'Hero Section Banner', 'Testimonial Card')." },
            description: { type: Type.STRING, description: "A one-sentence summary of the asset's purpose and visual style." },
            prompt: { type: Type.STRING, description: "A detailed, studio-quality image generation prompt for this asset." },
            animationPrompt: { type: Type.STRING, description: "A creative prompt for a subtle, professional animation (e.g., 'Subtle fade-in and upward drift')." }
        },
        required: ["section", "description", "prompt", "animationPrompt"]
    }
};

const generateAssetIdeasFromText = async (brief: string, existingIdeasCount: number): Promise<AssetIdea[]> => {
    const ai = getAiClient();
    const prompt = `
        You are a creative director for a top-tier web design agency.
        Based on the following application brief, generate a list of ${MAX_IDEAS_PER_BATCH} creative, diverse, and studio-quality visual assets.
        For each asset, provide a section name, a short description, a detailed image generation prompt, and a subtle animation prompt.
        If this is not the first batch of ideas (current count > 0), ensure the new ideas are distinct from what might have been generated before.

        Application Brief: "${brief}"
        Current idea count: ${existingIdeasCount}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: ideasSchema }
    });

    const result = parseJsonResponse(response.text);
    return result.map((idea: any) => ({ ...idea, id: uuidv4() }));
};

const generateAssetIdeasFromImage = async (image: ImageFile, tips: string, existingIdeasCount: number): Promise<AssetIdea[]> => {
    const ai = getAiClient();
    const prompt = `
        You are a creative director for a top-tier web design agency.
        Analyze the provided website screenshot. Based on its design, layout, and content, generate a list of ${MAX_IDEAS_PER_BATCH} NEW and IMPROVED studio-quality visual assets that would enhance this page. Do not just describe what's there; invent better assets.
        Prioritize the user's creative brief if provided.
        For each asset, provide a section name, description, a detailed image generation prompt, and a subtle animation prompt.
        If this is not the first batch (current count > 0), ensure the new ideas are distinct.

        User's Creative Brief: "${tips || 'No specific brief provided. Use your expertise.'}"
        Current idea count: ${existingIdeasCount}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ inlineData: { data: image.base64, mimeType: image.mimeType } }, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: ideasSchema }
    });

    const result = parseJsonResponse(response.text);
    return result.map((idea: any) => ({ ...idea, id: uuidv4() }));
};

const generateAssetIdeasFromUrl = async (url: string, existingIdeasCount: number): Promise<AssetIdea[]> => {
    const ai = getAiClient();
    const prompt = `
        You are a creative director for a top-tier web design agency.
        Access and analyze the content of the website at this URL: ${url}.
        Based on its purpose, audience, and tone, generate a list of ${MAX_IDEAS_PER_BATCH} creative, NEW, and studio-quality visual assets to enhance the site.
        For each asset, provide a section name, description, a detailed image generation prompt, and a subtle animation prompt.
        If this is not the first batch (current count > 0), ensure the new ideas are distinct.
        Return your response ONLY as a valid JSON array matching the provided schema. Do not include any other text or markdown.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });

    const result = parseJsonResponse(response.text);
    return result.map((idea: any) => ({ ...idea, id: uuidv4() }));
};

export const generateAssetIdeas = async (input: GenerateInput, existingIdeasCount: number): Promise<AssetIdea[]> => {
    switch (input.type) {
        case 'text':
            return generateAssetIdeasFromText(input.value, existingIdeasCount);
        case 'url':
            return generateAssetIdeasFromUrl(input.url, existingIdeasCount);
        case 'file':
            const imageFile = await fileToBase64(input.file);
            return generateAssetIdeasFromImage(imageFile, input.tips || '', existingIdeasCount);
        default:
            throw new Error('Invalid input type for asset generation.');
    }
};

export const generateSingleAsset = async (prompt: string): Promise<ImageFile> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
    });
    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No images were generated.");
    }
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return { base64: base64ImageBytes, mimeType: 'image/png' };
};

export const editImage = async (image: ImageFile, prompt: string): Promise<ImageFile> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: image.base64, mimeType: image.mimeType } }, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] }
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            return { base64: base64ImageBytes, mimeType };
        }
    }
    throw new Error("No edited image was returned.");
};

export const animateImage = async (image: ImageFile, prompt: string): Promise<string> => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }

    const freshAi = getAiClient();
    let operation = await freshAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: { imageBytes: image.base64, mimeType: image.mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await freshAi.operations.getVideosOperation({ operation });
    }
    if (operation.error) {
        if (operation.error.message.includes("Requested entity was not found.")) {
             if (window.aistudio) await window.aistudio.openSelectKey();
             throw new Error("API Key error. Please select your key and try again.");
        }
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation completed, but no download link was found.");
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) throw new Error(`Failed to fetch video. Status: ${videoResponse.statusText}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
