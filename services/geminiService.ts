/**
 * @file Service for interacting with the Google Gemini API.
 * This module abstracts the API calls for generating and refining artistic photos.
 * It handles prompt construction, API requests, and response processing.
 */

import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { ImageData } from '../types';

// Ensure the API key is available, logging an error if not.
// The app's functionality depends on this key.
if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Defines the parameters required to generate an artistic photo.
 */
export interface GenerationParams {
  garmentImage: ImageData;
  modelImage: ImageData;
  instructions: string;
  background: string;
  modelAge: string;
  aspectRatio: string;
  paletteColors?: string[];
  backgroundImage?: ImageData;
}

/**
 * Constructs the detailed textual prompt for the Gemini API based on user inputs.
 * The prompt is structured to give the AI a clear role and directives.
 * @param params - The generation parameters.
 * @returns The fully constructed prompt string.
 */
const getAgeInstruction = (modelAge: string): string => {
    const ageInstructionMap: { [key: string]: string } = {
        'child': 'a child, approximately 6-9 years old',
        'pre-teen': 'a pre-teen, approximately 10-12 years old',
        'teenager': 'a teenager, approximately 13-16 years old',
        'young-adult': 'a young adult, approximately 18-25 years old'
    };
    const ageText = ageInstructionMap[modelAge];
    return ageText ? `- **Age Adjustment:** Crucially, interpret the model with the appearance of ${ageText}.` : "";
};

const getGarmentApplicationInstruction = (paletteColors?: string[]): string => {
    const intro = "Meticulously replicate the garment's design from Image 1: its cut, shape, patterns, and any embellishments like sequins.";
    const fit = "The garment must fit the model's body naturally and realistically.";
    let colorInstruction = "Crucially, the garment's original colors from Image 1 MUST be preserved accurately.";

    if (paletteColors && paletteColors.length > 0) {
        colorInstruction = `Crucially, the garment's colors MUST be changed to use only this palette: ${paletteColors.join(', ')}.`;
    }
    
    return `- **Garment Application:** ${intro} ${colorInstruction} ${fit}`;
};

const getBackgroundInstruction = (background: string, hasBackgroundImage?: boolean): string => {
    return hasBackgroundImage
        ? "Use the background from Image 3. Integrate the model naturally."
        : `The background must be strictly: '${background}'.`;
};

const buildPrompt = (params: Omit<GenerationParams, 'garmentImage' | 'modelImage'>): string => {
    const { instructions, background, aspectRatio, paletteColors, backgroundImage, modelAge } = params;

    const promptSections = [
        "You are a professional AI photography director. Your task is to generate a photorealistic image based on several input images and instructions. The final image must be of professional quality, suitable for a design portfolio.",
        "",
        "**Input Assets:**",
        "- Image 1: A 'garment design' to be applied to the model.",
        "- Image 2: A 'model reference' of the person to be featured.",
        backgroundImage ? "- Image 3: A 'background reference' to be used as the scene." : null,
        "",
        "**Core Task:**",
        "Create a single, photorealistic image of the person from Image 2, making them wear the garment design from Image 1, and placing them in the specified background.",
        "",
        "**Key Directives:**",
        "- **Model Fidelity:** The person in the final image MUST be based on Image 2. If Image 2 is a photo, replicate the person accurately. If Image 2 is a drawing or sketch, transform it into a photorealistic person, but faithfully keeping the facial features, body type, and hair from the drawing.",
        getAgeInstruction(modelAge),
        getGarmentApplicationInstruction(paletteColors),
        "- **Pose:** The model's pose must be calm and relaxed, with arms down, looking confidently at the camera with a gentle smile.",
        getBackgroundInstruction(background, !!backgroundImage),
        `- **Aspect Ratio:** The final image MUST be generated in a ${aspectRatio} aspect ratio.`,
        instructions ? `- **Additional Instructions:** ${instructions}` : null,
    ];

    return promptSections.filter(line => line !== null).join('\n');
};


/**
 * Processes the response from the Gemini API.
 * It handles both successful image generation and various error cases, such as safety blocks.
 * @param response - The raw response object from `ai.models.generateContent`.
 * @returns A data URL string for the generated image.
 * @throws An error if the request was blocked or if no image was returned.
 */
const processApiResponse = (response: GenerateContentResponse): string => {
    // Check if the generation was blocked by safety filters.
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        const safetyRatings = response.candidates[0].safetyRatings;
        const blockedCategories = safetyRatings
            .filter((r: any) => r.blocked)
            .map((r: any) => r.category)
            .join(', ');
        throw new Error(`The request was blocked due to safety policies regarding: ${blockedCategories || 'unspecified category'}. Please adjust your images or prompts.`);
    }

    // On success, find the image data in the response parts.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }
    
    // If no image is found, use the convenience 'text' accessor to find a reason.
    const reason = response.text?.trim();
    
    throw new Error(`The AI did not return an image. Reason: ${reason || "No specific reason provided."}`);
}

/**
 * A shared function to execute content generation requests to the Gemini API.
 * This encapsulates the common logic for making the API call and handling errors.
 * @param parts - The array of parts (text, images) for the multimodal request.
 * @param taskDescription - A string describing the task (e.g., "generation", "refinement") for error logging.
 * @returns A promise that resolves to the data URL of the generated image.
 */
const executeContentGeneration = async (
    parts: (({ text: string } | { inlineData: { data: string; mimeType: string; } }))[],
    taskDescription: string
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                // We expect the model to be able to return both image and text (for error reasons).
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        return processApiResponse(response);
    } catch (error) {
        console.error(`Error during photo ${taskDescription} with Gemini:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to complete image ${taskDescription}: ${error.message}`);
        }
        throw new Error(`An unknown error occurred during image ${taskDescription}.`);
    }
};

/**
 * Generates a new artistic photo by sending a complex multimodal prompt to the Gemini API.
 * @param params - The complete set of parameters for the image generation.
 * @returns A promise that resolves to the data URL of the generated image.
 */
export const generateArtisticPhoto = async (params: GenerationParams): Promise<string> => {
    const prompt = buildPrompt(params);

    // Assemble the different parts of the multimodal request.
    const textPart = { text: prompt };
    const garmentImagePart = {
        inlineData: { data: params.garmentImage.base64, mimeType: params.garmentImage.mimeType },
    };
    const modelImagePart = {
        inlineData: { data: params.modelImage.base64, mimeType: params.modelImage.mimeType },
    };
    
    const imageParts = [garmentImagePart, modelImagePart];

    // Add the background image if one was provided.
    if (params.backgroundImage) {
        const backgroundImagePart = {
            inlineData: { data: params.backgroundImage.base64, mimeType: params.backgroundImage.mimeType },
        };
        imageParts.push(backgroundImagePart);
    }

    const parts = [...imageParts, textPart];

    return executeContentGeneration(parts, 'generation');
};

/**
 * Refines an existing image based on a textual instruction.
 * @param baseImage - The image to be refined.
 * @param refinementPrompt - The user's instruction for what to change.
 * @returns A promise that resolves to the data URL of the refined image.
 */
export const refineArtisticPhoto = async (baseImage: ImageData, refinementPrompt: string): Promise<string> => {
    const professionalRefinementPrompt = `You are a professional AI photo editor. Your task is to artistically refine the provided image based on the user's instruction.
Context: This image is for a professional sportswear design portfolio. All modifications must maintain a photorealistic and high-quality standard.
Instruction: "${refinementPrompt}"`;
    
    const textPart = { text: professionalRefinementPrompt };
    const imagePart = {
        inlineData: { data: baseImage.base64, mimeType: baseImage.mimeType },
    };
    
    const parts = [imagePart, textPart];

    return executeContentGeneration(parts, 'refinement');
};