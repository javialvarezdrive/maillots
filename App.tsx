import React, { useState, useMemo } from 'react';
import type { Option, ImageData } from './types';
import type { Sample } from './data/samples';
import ImageUploader from './components/ImageUploader';
import OptionSelector from './components/OptionSelector';
import ColorPaletteSelector from './components/ColorPaletteSelector';
import CameraIcon from './components/icons/CameraIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import MagnifyingGlassIcon from './components/icons/MagnifyingGlassIcon';
import ImagePreviewModal from './components/ImagePreviewModal';
import SampleSelectionModal from './components/SampleSelectionModal';
import { leotardSamples, modelSamples } from './data/samples';
import { colorPalettes } from './data/palettes';
import { generateArtisticPhoto, refineArtisticPhoto } from './services/geminiService';
import { urlToImageData } from './utils/imageUtils';

const shotTypeOptions: Option[] = [
  { id: 'full body', label: 'Cuerpo entero' },
  { id: 'from knees up', label: 'Rodillas a cabeza' },
];

const backgroundOptions: Option[] = [
  { id: 'minimalist urban', label: 'Urbano minimalista' },
  { id: 'solid color (Gray, White, or Black)', label: 'Color sólido (Gris, Blanco o Negro)' },
  { id: 'abstract studio', label: 'Estudio abstracto' },
];

const aspectRatioOptions: Option[] = [
  { id: '1:1', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '4:3', label: '4:3' },
  { id: '3:4', label: '3:4' },
];

const App: React.FC = () => {
  const [leotardImage, setLeotardImage] = useState<ImageData | null>(null);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [specificInstructions, setSpecificInstructions] = useState('');
  const [shotType, setShotType] = useState('full body');
  const [background, setBackground] = useState('minimalist urban');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(colorPalettes[0].id);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [isLeotardSampleModalOpen, setIsLeotardSampleModalOpen] = useState(false);
  const [isModelSampleModalOpen, setIsModelSampleModalOpen] = useState(false);
  const [isLeotardLoading, setIsLeotardLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const canGenerate = useMemo(() => leotardImage && modelImage && !isLoading, [leotardImage, modelImage, isLoading]);
  const canRefine = useMemo(() => generatedImage && refinementPrompt.trim() !== '' && !isLoading, [generatedImage, refinementPrompt, isLoading]);

  const handleSampleSelect = async (sample: Sample, type: 'leotard' | 'model') => {
    if (type === 'leotard') {
      setIsLeotardSampleModalOpen(false);
      setIsLeotardLoading(true);
    } else {
      setIsModelSampleModalOpen(false);
      setIsModelLoading(true);
    }
    setError(null);

    try {
      const imageData = await urlToImageData(sample.url);
      if (type === 'leotard') {
        setLeotardImage(imageData);
      } else {
        setModelImage(imageData);
      }
    } catch (err) {
      setError(err instanceof Error ? `Failed to load sample: ${err.message}` : 'Failed to load sample image.');
    } finally {
      if (type === 'leotard') {
        setIsLeotardLoading(false);
      } else {
        setIsModelLoading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const selectedPalette = colorPalettes.find(p => p.id === selectedPaletteId);
      const result = await generateArtisticPhoto({
        leotardImage: leotardImage!,
        modelImage: modelImage!,
        instructions: specificInstructions,
        shotType,
        background,
        aspectRatio,
        paletteColors: selectedPalette?.colors,
      });
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefine = async () => {
    if (!canRefine) return;

    setIsLoading(true);
    setError(null);

    const base64 = generatedImage!.split(',')[1];
    const mimeType = generatedImage!.match(/:(.*?);/)![1];
    const baseImageData: ImageData = { base64, mimeType };

    try {
      const result = await refineArtisticPhoto(baseImageData, refinementPrompt);
      setGeneratedImage(result);
      setRefinementPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="bg-slate-900 min-h-screen text-slate-300 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CameraIcon className="w-10 h-10 text-cyan-400" />
              <h1 className="text-4xl font-bold text-white tracking-tight">Photo Studio Skate</h1>
            </div>
            <p className="text-lg text-slate-400">Tu director IA de fotografía</p>
          </header>
          <hr className="border-slate-700 mb-8" />
          
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-lg shadow-xl flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <ImageUploader 
                  id="leotard-uploader"
                  title="1. Sube el Maillot (Diseño)"
                  description="Esta es la imagen con el diseño a aplicar."
                  value={leotardImage}
                  onChange={setLeotardImage}
                  isLoading={isLeotardLoading}
                />
                <button
                  onClick={() => setIsLeotardSampleModalOpen(true)}
                  className="text-center text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 py-2 rounded-md bg-slate-800 hover:bg-slate-700/50"
                >
                  O elige un diseño de muestra
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <ImageUploader 
                  id="model-uploader"
                  title="2. Sube la Modelo (Referencia)"
                  description="Esta es la modelo que vestirá el maillot."
                  value={modelImage}
                  onChange={setModelImage}
                  isLoading={isModelLoading}
                />
                 <button
                  onClick={() => setIsModelSampleModalOpen(true)}
                  className="text-center text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 py-2 rounded-md bg-slate-800 hover:bg-slate-700/50"
                >
                  O elige una modelo de muestra
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white">3. Añade instrucciones específicas (opcional)</h2>
                <p className="text-sm text-slate-400">Describe cualquier detalle específico que quieras añadir o modificar.</p>
                <textarea
                  value={specificInstructions}
                  onChange={(e) => setSpecificInstructions(e.target.value)}
                  placeholder="Ej: 'en una pose de giro dinámico', 'cambia el color del pelo a rubio'..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  rows={3}
                  aria-label="Specific instructions"
                />
              </div>

              <OptionSelector
                title="4. Elige el tipo de plano"
                description="Selecciona el encuadre de la fotografía."
                options={shotTypeOptions}
                selectedOption={shotType}
                onSelect={setShotType}
              />

              <OptionSelector
                title="5. Elige el fondo"
                description="Selecciona el estilo del fondo."
                options={backgroundOptions}
                selectedOption={background}
                onSelect={setBackground}
              />

              <ColorPaletteSelector
                title="6. Elige una paleta de colores (opcional)"
                description="El diseño del maillot usará estos colores."
                palettes={colorPalettes}
                selectedPaletteId={selectedPaletteId}
                onSelect={setSelectedPaletteId}
              />

              <OptionSelector
                title="7. Elige la relación de aspecto"
                description="Selecciona la proporción de la imagen final."
                options={aspectRatioOptions}
                selectedOption={aspectRatio}
                onSelect={setAspectRatio}
                columns={5}
              />

              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-lg text-lg transition-all duration-300 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-500 disabled:cursor-not-allowed enabled:hover:shadow-lg enabled:hover:shadow-cyan-500/50 enabled:hover:scale-[1.02]"
              >
                {isLoading ? 'Generando...' : 'Generar Fotografía'}
              </button>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg shadow-xl flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white">Resultado</h2>
              <div className="flex-grow flex items-start justify-center bg-slate-800/50 border border-slate-700 rounded-lg min-h-[400px] lg:min-h-[500px] p-2 pt-16">
                {isLoading && (
                  <div className="text-center text-slate-400 animate-pulse">
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
                {!isLoading && !generatedImage && !error && (
                  <div className="text-center text-slate-500">
                    <SparklesIcon className="w-12 h-12 mx-auto mb-3" />
                    <p>La fotografía generada aparecerá aquí.</p>
                    <p className="text-sm">Sube una imagen y describe tu visión para empezar.</p>
                  </div>
                )}
                {error && (
                  <div className="text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <p className="font-bold">Error</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                )}
                {generatedImage && !isLoading && (
                  <div className="relative group w-full h-full">
                    <img src={generatedImage} alt="Generated artistic photo" className="object-contain w-full h-full rounded-md" />
                    <button onClick={() => setIsPreviewOpen(true)} className="absolute top-3 right-3 bg-slate-900/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110" aria-label="Preview image">
                        <MagnifyingGlassIcon className="w-6 h-6"/>
                    </button>
                  </div>
                )}
              </div>
              
              {generatedImage && !isLoading && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={generatedImage}
                      download={`photo-studio-skate-${Date.now()}.png`}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-slate-600 text-center"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Descargar
                    </a>
                  </div>

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
                        onClick={handleRefine}
                        disabled={!canRefine}
                        className="sm:w-32 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed enabled:hover:bg-cyan-500"
                      >
                        Refinar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {isPreviewOpen && generatedImage && (
        <ImagePreviewModal imageUrl={generatedImage} onClose={() => setIsPreviewOpen(false)} />
      )}
      {isLeotardSampleModalOpen && (
        <SampleSelectionModal
          isOpen={isLeotardSampleModalOpen}
          onClose={() => setIsLeotardSampleModalOpen(false)}
          title="Elige un diseño de muestra"
          samples={leotardSamples}
          onSelect={(sample) => handleSampleSelect(sample, 'leotard')}
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
