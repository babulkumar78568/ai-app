import { GoogleGenAI } from "@google/genai";
import { ModelId } from '../types';

/**
 * Validates and creates a GoogleGenAI instance.
 * Note: The API key comes from user settings in this app context, not process.env
 */
const createClient = (apiKey: string) => {
  if (!apiKey) throw new Error("API Key is missing. Please add one in settings.");
  return new GoogleGenAI({ apiKey });
};

export const generateTextResponse = async (
  apiKey: string,
  modelId: string,
  prompt: string
): Promise<string> => {
  const ai = createClient(apiKey);
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    // Safety fallback
    const text = response.text;
    if (!text) return "No response generated.";
    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate text.");
  }
};

export const generateImageResponse = async (
  apiKey: string,
  prompt: string
): Promise<string> => {
  const ai = createClient(apiKey);

  try {
    // Using gemini-2.5-flash-image (Nano Banana) logic
    // The prompt requires an object wrapper often for better results, but string works too.
    const response = await ai.models.generateContent({
      model: ModelId.IMAGE,
      contents: prompt,
      // No specific imageConfig needed for standard generation unless requested
    });

    let imageUrl = '';
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData) {
                const base64Data = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64Data}`;
                break; 
            }
        }
    }

    if (!imageUrl) {
        throw new Error("No image data returned from the model.");
    }
    return imageUrl;
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};