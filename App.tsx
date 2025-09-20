/**
 * @file The main application component.
 * This component manages the application's state and orchestrates the interactions
 * between the user controls and the image generation service. It has been refactored
 * to act as a container, delegating UI rendering to `ControlsPanel` and `ResultsPanel`.
 */
import React, { useState, useMemo } from 'react';

// Component Imports
import ControlsPanel from './components/ControlsPanel';
import ResultsPanel from './components/ResultsPanel';
import ImagePreviewModal from './components/ImagePreviewModal';
import SampleSelectionModal from './components/SampleSelectionModal';
import CameraIcon from './components/icons/CameraIcon';
import WhatsAppIcon from './components/icons/WhatsAppIcon';
import HeartIcon from './components/icons/HeartIcon';

// Service and Utility Imports
import { generateArtisticPhoto, refineArtisticPhoto } from './services/geminiService';
import { urlToImageData } from './utils/imageUtils';

// Type and Data Imports
import type { ImageData } from './types';
import type { Sample } from './data/samples';
import type { GenerationParams } from './services/geminiService';
import { garmentSamples, modelSamples } from './data/samples';

// --- Webhook Integration ---
const WEBHOOK_URL = 'https://hook.eu2.make.com/57trxn7xu5tiai4oimn6zr5v5n3no3yh';

/**
 * Sends the generated image data URL to a webhook.
 * This is a fire-and-forget function that logs errors to the console without blocking the UI.
 * @param imageUrl The data URL of the generated image (e.g., "data:image/png;base64,...").
 */
const sendImageToWebhook = async (imageUrl: string): Promise<void> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      // Log the error but don't throw, as this is a background task.
      console.error(`Webhook failed with status: ${response.status}`, await response.text());
    } else {
      console.log('Image successfully sent to webhook.');
    }
  } catch (error) {
    console.error('Error sending image to webhook:', error);
  }
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  
  // Input state: Raw materials for generation
  const [garmentImage, setGarmentImage] = useState<ImageData | null>(null);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [customBackground, setCustomBackground] = useState<ImageData | null>(null);

  // Input state: Generation parameters and options
  const [specificInstructions, setSpecificInstructions] =useState('');
  const [modelAge, setModelAge] = useState('none');
  const [background, setBackground] = useState('minimalist urban');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('none');
  
  // Output state: Results from the API
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImagesHistory, setGeneratedImagesHistory] = useState<string[]>([]);
  
  // UI/Flow state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [isGarmentSampleModalOpen, setIsGarmentSampleModalOpen] = useState(false);
  const [isModelSampleModalOpen, setIsModelSampleModalOpen] = useState(false);
  const [isGarmentLoading, setIsGarmentLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  // --- DERIVED STATE ---
  
  /** Memoized value to determine if the generate button should be enabled. */
  const canGenerate = useMemo(() => garmentImage && modelImage && !isLoading, [garmentImage, modelImage, isLoading]);
  
  /** Memoized value to determine if the refine button should be enabled. */
  const canRefine = useMemo(() => generatedImage && refinementPrompt.trim() !== '' && !isLoading, [generatedImage, refinementPrompt, isLoading]);

  // --- API CALL ORCHESTRATION ---

  /**
   * A wrapper function to handle the lifecycle of an API call (generation or refinement).
   * Manages loading state, error handling, and updates results.
   * @param apiCall - The async function to execute (e.g., `generateArtisticPhoto`).
   * @param options - Configuration for the call, like whether it's a new generation.
   */
  const executeApiCall = async (
    apiCall: () => Promise<string>,
    options: { isNewGeneration: boolean; onComplete?: () => void }
  ) => {
    setIsLoading(true);
    setError(null);
    if (options.isNewGeneration) {
      setGeneratedImage(null);
    }

    try {
      const result = await apiCall();
      setGeneratedImage(result);
      setGeneratedImagesHistory(prev => [result, ...prev]);
      sendImageToWebhook(result);
      options.onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- EVENT HANDLERS ---

  /**
   * Handles selecting a sample image (garment or model).
   * It loads the image data from the provided URL and updates the corresponding state.
   * @param sample - The selected sample object.
   * @param type - The type of sample ('garment' or 'model').
   */
  const handleSampleSelect = async (sample: Sample, type: 'garment' | 'model') => {
    const setLoading = type === 'garment' ? setIsGarmentLoading : setIsModelLoading;
    const setImage = type === 'garment' ? setGarmentImage : setModelImage;
    const closeModal = type === 'garment' ? setIsGarmentSampleModalOpen : setIsModelSampleModalOpen;

    closeModal(false);
    setLoading(true);
    setError(null);

    try {
      const imageData = await urlToImageData(sample.url);
      setImage(imageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? `Failed to load sample: ${err.message}` : 'Failed to load sample image.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Main handler for the "Generate" button.
   * Constructs the generation parameters and calls the Gemini service via the orchestrator.
   */
  const handleGenerate = async () => {
    if (!canGenerate) return;

    if (background === 'custom' && !customBackground) {
      setError("Por favor, sube una imagen de fondo o elige otra opción.");
      return;
    }
    
    const { colorPalettes } = await import('./data/palettes');
    
    const params: GenerationParams = {
      garmentImage: garmentImage!,
      modelImage: modelImage!,
      instructions: specificInstructions,
      background,
      modelAge,
      aspectRatio: '9:16', // Fixed aspect ratio for consistency
      paletteColors: selectedPaletteId !== 'none' 
        ? colorPalettes.find(p => p.id === selectedPaletteId)?.colors
        : undefined,
      backgroundImage: background === 'custom' ? customBackground! : undefined,
    };

    executeApiCall(() => generateArtisticPhoto(params), { isNewGeneration: true });
  };
  
  /**
   * Main handler for the "Refine" button.
   * Sends the current image and a refinement prompt to the Gemini service via the orchestrator.
   */
  const handleRefine = async () => {
    if (!canRefine || !generatedImage) return;

    const base64 = generatedImage.split(',')[1];
    const mimeType = generatedImage.match(/:(.*?);/)![1];
    const baseImageData: ImageData = { base64, mimeType };

    executeApiCall(
      () => refineArtisticPhoto(baseImageData, refinementPrompt),
      {
        isNewGeneration: false,
        onComplete: () => setRefinementPrompt(''),
      }
    );
  }
  
  // --- MODAL AND PREVIEW NAVIGATION HANDLERS ---
  
  const handleNavigatePreview = (direction: 'next' | 'prev') => {
    if (previewImageIndex === null) return;
    const newIndex = direction === 'next'
      ? (previewImageIndex + 1) % generatedImagesHistory.length
      : (previewImageIndex - 1 + generatedImagesHistory.length) % generatedImagesHistory.length;
    setPreviewImageIndex(newIndex);
  };
  
  const handleSetRefinementImage = (index: number) => {
    if (index >= 0 && index < generatedImagesHistory.length) {
      setGeneratedImage(generatedImagesHistory[index]);
      setPreviewImageIndex(null); // Close the modal after selection
    }
  };

  // --- RENDER METHOD ---

  return (
    <>
      <div className="min-h-screen text-slate-300 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CameraIcon className="w-10 h-10 text-cyan-400" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-300">Aristic Photo Lab</h1>
            </div>
            <p className="text-lg text-slate-400">Tu director IA de fotografía</p>
          </header>
          
          {/* Main Content Grid: Controls on the left, Results on the right */}
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
            <ControlsPanel
              // State values
              garmentImage={garmentImage}
              modelImage={modelImage}
              specificInstructions={specificInstructions}
              modelAge={modelAge}
              background={background}
              customBackground={customBackground}
              selectedPaletteId={selectedPaletteId}
              isGarmentLoading={isGarmentLoading}
              isModelLoading={isModelLoading}
              canGenerate={canGenerate}
              isLoading={isLoading}
              // State setters and handlers
              setGarmentImage={setGarmentImage}
              setModelImage={setModelImage}
              setSpecificInstructions={setSpecificInstructions}
              setModelAge={setModelAge}
              setBackground={setBackground}
              setCustomBackground={setCustomBackground}
              setSelectedPaletteId={setSelectedPaletteId}
              onGenerate={handleGenerate}
              openGarmentSamples={() => setIsGarmentSampleModalOpen(true)}
              openModelSamples={() => setIsModelSampleModalOpen(true)}
            />
            
            <ResultsPanel
              // State values
              isLoading={isLoading}
              error={error}
              generatedImage={generatedImage}
              generatedImagesHistory={generatedImagesHistory}
              refinementPrompt={refinementPrompt}
              canRefine={canRefine}
              // State setters and handlers
              setRefinementPrompt={setRefinementPrompt}
              onRefine={handleRefine}
              openPreview={setPreviewImageIndex}
            />
          </main>

          {/* Footer */}
          <footer className="text-center py-6 mt-12 border-t border-slate-800">
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5">
              Creado con <HeartIcon className="w-4 h-4 text-red-500" /> por Javi
              <a 
                href="https://wa.me/34615313779" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Contactar por WhatsApp"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </p>
          </footer>
        </div>
      </div>

      {/* Modals are kept here at the top level */}
      {previewImageIndex !== null && (
        <ImagePreviewModal
            images={generatedImagesHistory}
            currentIndex={previewImageIndex}
            onClose={() => setPreviewImageIndex(null)}
            onNavigate={handleNavigatePreview}
            onSelectForRefinement={handleSetRefinementImage}
        />
      )}
      {isGarmentSampleModalOpen && (
        <SampleSelectionModal
          isOpen={isGarmentSampleModalOpen}
          onClose={() => setIsGarmentSampleModalOpen(false)}
          title="Elige un diseño de prenda de muestra"
          samples={garmentSamples}
          onSelect={(sample) => handleSampleSelect(sample, 'garment')}
        />
      )}
      {isModelSampleModalOpen && (
        <SampleSelectionModal
          isOpen={isModelSampleModalOpen}
          onClose={() => setIsModelSampleModalOpen(false)}
          title="Elige una modelo de muestra"
          samples={modelSamples}
          onSelect={(sample) => handleSampleSelect(sample, 'model')}
        />
      )}
    </>
  );
};

export default App;