/**
 * @file This component renders the entire results panel for the application.
 * It displays the generated image, loading and error states, the refinement form,
 * and the gallery of previously generated images. It is a "dumb" component that
 * receives its state and handlers from the parent `App` component.
 */
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import DownloadIcon from './icons/DownloadIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';

// --- Component Props Interface ---

interface ResultsPanelProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  generatedImagesHistory: string[];
  refinementPrompt: string;
  canRefine: boolean;
  setRefinementPrompt: (value: string) => void;
  onRefine: () => void;
  openPreview: (index: number) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  isLoading,
  error,
  generatedImage,
  generatedImagesHistory,
  refinementPrompt,
  canRefine,
  setRefinementPrompt,
  onRefine,
  openPreview,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/20 p-px rounded-xl shadow-2xl shadow-slate-950/40">
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[11px] flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Resultado</h2>
            <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-lg">
                {/* Loading State */}
                {isLoading && (
                    <div className="h-96 flex items-center justify-center text-center text-slate-400 p-4">
                        <div role="status">
                            <svg aria-hidden="true" className="inline w-10 h-10 text-slate-600 animate-spin fill-cyan-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-4">Generando tu fotografía...</p>
                    </div>
                )}
                {/* Initial Empty State */}
                {!isLoading && !generatedImage && !error && (
                    <div className="h-96 flex flex-col items-center justify-center text-center text-slate-500 p-4 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/30">
                        <div className="relative mb-4">
                            <div className="absolute -inset-2 bg-cyan-500/10 rounded-full blur-xl"></div>
                            <SparklesIcon className="w-12 h-12 text-cyan-400 relative" />
                        </div>
                        <p className="font-medium text-slate-300 text-lg">Tu obra de arte te espera</p>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">Sigue los pasos del panel de control para crear tu primera imagen.</p>
                    </div>
                )}
                {/* Error State */}
                {error && !isLoading && (
                    <div className="h-96 flex items-center justify-center p-4">
                        <div className="text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                            <p className="font-bold">Error</p>
                            <p className="text-sm mt-2">{error}</p>
                        </div>
                    </div>
                )}
                {/* Success State */}
                {generatedImage && !isLoading && (
                    <div className="flex flex-col animate-fade-in-scale" key={generatedImage}>
                        {/* Image Display */}
                        <div className="relative group p-2">
                            <img src={generatedImage} alt="Generated artistic photo" className="object-contain w-full rounded-md" />
                            <button onClick={() => openPreview(generatedImagesHistory.indexOf(generatedImage))} className="absolute top-3 right-3 bg-slate-900/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110" aria-label="Preview image">
                                <MagnifyingGlassIcon className="w-6 h-6"/>
                            </button>
                        </div>
                        {/* Actions and Refinement Form */}
                        <div className="flex flex-col gap-4 p-4 border-t border-slate-700">
                            <a
                                href={generatedImage}
                                download={`aristic-photo-lab-${Date.now()}.png`}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-slate-600 text-center"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                Descargar
                            </a>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-white">Refina tu Imagen</h3>
                                <p className="text-sm text-slate-400">Describe los cambios que quieres hacer a la imagen generada.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <textarea
                                        value={refinementPrompt}
                                        onChange={(e) => setRefinementPrompt(e.target.value)}
                                        placeholder="Ej: 'cambia el pelo a rojo', 'haz el fondo más oscuro'..."
                                        className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                        rows={1}
                                        aria-label="Refinement instructions"
                                    />
                                    <button
                                        onClick={onRefine}
                                        disabled={!canRefine}
                                        className="sm:w-32 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed enabled:hover:bg-cyan-500"
                                    >
                                        Refinar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Image History Gallery */}
            {generatedImagesHistory.length > 0 && (
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-700">
                    <h3 className="text-xl font-bold text-white">Galería</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 -mr-2">
                        {generatedImagesHistory.map((imageSrc, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img src={imageSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-2">
                                    <button
                                        onClick={() => openPreview(index)}
                                        className="bg-slate-700/80 p-2 rounded-full text-white hover:bg-slate-600 transition-colors"
                                        aria-label="Preview image"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    </button>
                                    <a
                                        href={imageSrc}
                                        download={`aristic-photo-lab-${Date.now()}-${index}.png`}
                                        className="bg-slate-700/80 p-2 rounded-full text-white hover:bg-slate-600 transition-colors"
                                        aria-label="Download image"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ResultsPanel;