import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageData } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface GenerationParams {
  leotardImage: ImageData;
  modelImage: ImageData;
  instructions: string;
  shotType: string;
  background: string;
  aspectRatio: string;
  paletteColors?: string[];
}

const buildPrompt = (params: Omit<GenerationParams, 'leotardImage' | 'modelImage'>): string => {
  const { instructions, shotType, background, aspectRatio, paletteColors } = params;

  let shotTypeInstruction = '';
  if (shotType === 'full body') {
    shotTypeInstruction = "The final photograph MUST be a full-body shot, capturing the model from head to toe.";
  } else if (shotType === 'from knees up') {
    shotTypeInstruction = "The photograph must show the model from their knees up to their head.";
  }

  let aspectRatioInstruction = '';
  switch (aspectRatio) {
    case '1:1':
      aspectRatioInstruction = 'a square format (1:1 aspect ratio).';
      break;
    case '16:9':
      aspectRatioInstruction = 'a wide, landscape format (16:9 aspect ratio).';
      break;
    case '9:16':
      aspectRatioInstruction = 'a tall, vertical format (9:16 aspect ratio).';
      break;
    case '4:3':
      aspectRatioInstruction = 'a standard landscape format (4:3 aspect ratio).';
      break;
    case '3:4':
      aspectRatioInstruction = 'a standard portrait format (3:4 aspect ratio).';
      break;
    default:
      aspectRatioInstruction = `an aspect ratio of ${aspectRatio}.`;
  }

  let prompt = `Task: Create a photorealistic image of the person from the second image (model reference) wearing a leotard that has the design from the first image (leotard design).

**Primary Instructions:**
1.  **Model Integrity:** The person in the final image must be the same person from the second image. Faithfully reproduce their facial features, body type, skin tone, and hair.
2.  **Leotard Application:** Take the complete design (pattern, colors, details) from the first image and apply it to a new leotard worn by the model. The leotard must fit the model's body realistically, with natural folds, shadows, and lighting that match the scene.

**Compositional Requirements:**
3.  **Pose:** The model's pose must be calm and relaxed, with arms down. They should look confidently into the camera with a gentle smile.
4.  **Shot Type:** ${shotType}. ${shotTypeInstruction}
5.  **Background:** The background must be strictly: '${background}'.
6.  **Aspect Ratio:** The final image MUST be generated in ${aspectRatioInstruction} This is a critical, non-negotiable requirement.
`;

    if (paletteColors && paletteColors.length > 0) {
        prompt += `
**Color Constraint:**
7.  **IMPORTANT:** The leotard's design must be recolored to strictly use only the following colors: **${paletteColors.join(', ')}**. These colors must dominate the final leotard design.
`;
    }

    if (instructions) {
        prompt += `
**Additional Instructions:**
8.  ${instructions}
`;
    }

  prompt += `\nGenerate ONLY the image as the output. Do not include any text, descriptions, or commentary.`;

  return prompt;
};


const processApiResponse = (response: any): string => {
    // Check for safety blocks
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("The request was blocked due to safety policies. Please adjust your images or prompts.");
    }

    // Happy path: find and return the generated image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }
    
    // Unhappy path: no image was returned, try to find out why
    const textParts = response.candidates?.[0]?.content?.parts
        ?.filter((part: any) => part.text)
        .map((part: any) => part.text) || [];

    const reason = textParts.join(' ').trim();
    
    throw new Error(`The AI did not return an image. Reason: ${reason || "No specific reason provided."}`);
}


export const generateArtisticPhoto = async (params: GenerationParams): Promise<string> => {
    try {
        const prompt = buildPrompt(params);

        const leotardImagePart = {
            inlineData: { data: params.leotardImage.base64, mimeType: params.leotardImage.mimeType },
        };
        const modelImagePart = {
            inlineData: { data: params.modelImage.base64, mimeType: params.modelImage.mimeType },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [leotardImagePart, modelImagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        return processApiResponse(response);

    } catch (error) {
        console.error("Error generating photo with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};

export const refineArtisticPhoto = async (baseImage: ImageData, refinementPrompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: { data: baseImage.base64, mimeType: baseImage.mimeType },
        };
        const textPart = { 
            text: `Based on the provided image, apply the following change: "${refinementPrompt}". Generate a new high-quality, photorealistic image with this modification.` 
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        return processApiResponse(response);

    } catch (error) {
        console.error("Error refining photo with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to refine image: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image refinement.");
    }
};