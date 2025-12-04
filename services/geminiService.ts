
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageFile, AssetIdea, GenerateInput, GuidedBrief, GenerationResult } from "../types";
import { fileToBase64 } from "../utils/fileUtils";
import { v4 as uuidv4 } from 'uuid';

const IDEAS_PER_BATCH = 4;

// Helper to safely parse JSON from a model's response
const parseJsonResponse = (responseString: string): any => {
    try {
        const markdownMatch = responseString.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            return JSON.parse(markdownMatch[1]);
        }
        const jsonMatch = responseString.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(responseString);
    } catch (e) {
        console.error("Failed to parse JSON from response:", responseString);
        throw new Error("The model returned an invalid format. Please try again.");
    }
};

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const fullResponseSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "A score from 1-100 rating the current design aesthetic or brief potential." },
                detectedStyle: { type: Type.STRING, description: "The dominant visual style detected (e.g., 'Minimalist', 'Brutalist')." },
                colorPalette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hex codes of the 5 dominant colors." },
                critique: { type: Type.STRING, description: "A 2-sentence professional design critique highlighting strengths and weaknesses." },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific, actionable bullet points to improve the design." }
            },
            required: ["score", "detectedStyle", "colorPalette", "critique", "suggestions"]
        },
        ideas: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    section: { type: Type.STRING, description: "A short, descriptive name for the UI section or component." },
                    description: { type: Type.STRING, description: "A one-sentence summary of the asset's purpose and visual style." },
                    prompt: { type: Type.STRING, description: "A detailed, studio-quality image generation prompt for this asset." },
                    animationPrompt: { type: Type.STRING, description: "A creative prompt for a subtle, professional animation." }
                },
                required: ["section", "description", "prompt", "animationPrompt"]
            }
        }
    },
    required: ["analysis", "ideas"]
};

const constructPromptFromBrief = (brief: GuidedBrief): string => {
    let briefText = `\n--- Creative Brief ---\n`;
    if (brief.instructions) briefText += `Primary Goal: ${brief.instructions}\n`;
    if (brief.keywords) briefText += `Brand Keywords: ${brief.keywords}\n`;
    if (brief.styles.length > 0) briefText += `Visual Styles: ${brief.styles.join(', ')}\n`;
    if (brief.colors.length > 0) briefText += `Color Palette: ${brief.colors.join(', ')}\n`;
    briefText += `----------------------\n`;
    return briefText;
};

const generateContent = async (contents: any, schema: any, tools: any[] = []): Promise<GenerationResult> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: contents,
        config: { 
            responseMimeType: "application/json", 
            responseSchema: schema,
            tools: tools.length > 0 ? tools : undefined
        }
    });
    const result = parseJsonResponse(response.text);
    return {
        analysis: result.analysis,
        ideas: result.ideas.map((idea: any) => ({ ...idea, id: uuidv4() }))
    };
};

export const generateAssetIdeas = async (input: GenerateInput, existingIdeasCount: number): Promise<GenerationResult> => {
    const briefText = constructPromptFromBrief(input.brief);
    
    const basePrompt = `
        You are a world-class "Digital Feng Shui" Master and Creative Director. 
        Your goal is to analyze the input, provide a "Design Audit", and then generate specific visual assets to improve the product.
        
        Step 1: Analyze the input (Brief, Image, or URL). Determine the current vibe, flaws, and opportunities. Assign a "Feng Shui Score" (1-100).
        Step 2: Generate ${IDEAS_PER_BATCH} distinct, high-quality visual asset ideas that solve the problems identified or enhance the brief.
        
        ${briefText}
        Current idea count: ${existingIdeasCount} (If > 0, ensure new ideas are unique).
    `;

    if (input.type === 'text') {
        return generateContent(basePrompt, fullResponseSchema);
    } else if (input.type === 'file') {
        const imageFile = await fileToBase64(input.file);
        return generateContent(
            { parts: [{ inlineData: { data: imageFile.base64, mimeType: imageFile.mimeType } }, { text: basePrompt }] },
            fullResponseSchema
        );
    } else if (input.type === 'url') {
        const urlPrompt = `
            ${basePrompt}
            Target URL: ${input.url}
            First, browse the URL to understand its design language. Then perform the audit and generation.
        `;
        return generateContent(urlPrompt, fullResponseSchema, [{ googleSearch: {} }]);
    }
    
    throw new Error('Invalid input type');
};

export const generateSingleAsset = async (prompt: string): Promise<ImageFile> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: { aspectRatio: "1:1" }
        },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
      }
    }
    throw new Error("No image was generated in the response.");
};

export const editImage = async (image: ImageFile, prompt: string, editImageFile?: ImageFile | null): Promise<ImageFile> => {
    const ai = getAiClient();
    const parts: any[] = [{ inlineData: { data: image.base64, mimeType: image.mimeType } }];
    if (editImageFile) {
        parts.push({ inlineData: { data: editImageFile.base64, mimeType: editImageFile.mimeType } });
    }
    const finalPrompt = prompt || "Enhance this image based on the visual style.";
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
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
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await freshAi.operations.getVideosOperation({ operation });
    }
    
    if (operation.error) {
         if (operation.error.message.includes("Requested entity was not found") && window.aistudio) {
             await window.aistudio.openSelectKey();
             throw new Error("API Key session expired. Please re-select your key.");
        }
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No download link found.");
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
