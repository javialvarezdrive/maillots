/**
 * @file This component renders the entire control panel for the application.
 * It includes all user inputs, such as image uploaders, instruction text areas,
 * option selectors, and the main generate button. It is a "dumb" component that
 * receives its state and handlers from the parent `App` component.
 */
import React, { useRef, useState, useEffect } from 'react';
import type { Option, ImageData } from '../types';
import ImageUploader from './ImageUploader';
import ColorPaletteSelector from './ColorPaletteSelector';
import { colorPalettes } from '../data/palettes';
import { photoStudioPrompt, nightCityTerracePrompt, garmentDesignWorkshopPrompt } from '../data/prompts';

// --- Reusable Custom Select Component ---

interface CustomSelectProps {
  options: Option[];
  selectedValue: string;
  onSelect: (optionId: string) => void;
  ariaLabel: string;
  selectedLabel?: string;
}

/**
 * A reusable dropdown component to avoid duplicating state and logic.
 */
const CustomSelect: React.FC<CustomSelectProps> = ({ options, selectedValue, onSelect, ariaLabel, selectedLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.id === selectedValue) || options[0];
  const displayLabel = selectedLabel || selectedOption?.label || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onSelect(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between appearance-none bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="truncate">{displayLabel}</span>
        <div className="pointer-events-none flex items-center text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none animate-fade-in-scale origin-top"
          style={{ animationDuration: '150ms' }}
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full text-left p-3 text-sm font-medium transition-colors duration-150 ${
                selectedValue === option.id
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
              role="option"
              aria-selected={selectedValue === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Constants for Options ---

const backgroundOptions: Option[] = [
  { id: 'minimalist urban', label: 'Urbano minimalista' },
  { id: nightCityTerracePrompt, label: 'Ciudad nocturna' },
  { id: photoStudioPrompt, label: 'Foto estudio' },
  { id: garmentDesignWorkshopPrompt, label: 'Taller moda' },
  { id: 'custom', label: 'Subir mi fondo...' },
];

const ageOptions: Option[] = [
    { id: 'none', label: 'Original' },
    { id: 'child', label: 'Niña (6-9)' },
    { id: 'pre-teen', label: 'Pre-adol. (10-12)' },
    { id: 'teenager', label: 'Adolescente (13-16)' },
    { id: 'young-adult', label: 'Joven (18-25)' },
];

// --- Component Props Interface ---

interface ControlsPanelProps {
  garmentImage: ImageData | null;
  modelImage: ImageData | null;
  specificInstructions: string;
  modelAge: string;
  background: string;
  customBackground: ImageData | null;
  selectedPaletteId: string;
  isGarmentLoading: boolean;
  isModelLoading: boolean;
  canGenerate: boolean;
  isLoading: boolean;
  setGarmentImage: (value: ImageData | null) => void;
  setModelImage: (value: ImageData | null) => void;
  setSpecificInstructions: (value: string) => void;
  setModelAge: (value: string) => void;
  setBackground: (value: string) => void;
  setCustomBackground: (value: ImageData | null) => void;
  setSelectedPaletteId: (value: string) => void;
  onGenerate: () => void;
  openGarmentSamples: () => void;
  openModelSamples: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  garmentImage, setGarmentImage,
  modelImage, setModelImage,
  specificInstructions, setSpecificInstructions,
  modelAge, setModelAge,
  background, setBackground,
  customBackground, setCustomBackground,
  selectedPaletteId, setSelectedPaletteId,
  isGarmentLoading, isModelLoading,
  canGenerate, isLoading,
  onGenerate,
  openGarmentSamples, openModelSamples,
}) => {
  const customBackgroundInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the change event for the custom background file input.
   * Reads the selected file as a base64 string and updates the state.
   */
  const handleCustomBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setCustomBackground({ base64: base64String, mimeType: file.type });
            setBackground('custom'); // Set background type to 'custom'
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert('Por favor, sube un archivo PNG, JPG o WEBP.');
    }
  };
  
  const handleBackgroundSelect = (optionId: string) => {
    if (optionId === 'custom') {
        customBackgroundInputRef.current?.click();
    } else {
        setBackground(optionId);
        setCustomBackground(null);
    }
  };

  const getBackgroundLabel = (): string => {
    if (background === 'custom' && customBackground) {
        return 'Fondo Personalizado';
    }
    return backgroundOptions.find(o => o.id === background)?.label || backgroundOptions[0].label;
  };

  return (
    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/20 p-px rounded-xl shadow-2xl shadow-slate-950/40">
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[11px] flex flex-col gap-8">
            {/* Section 1: Garment Uploader */}
            <div className="flex flex-col gap-2">
                <ImageUploader
                    id="garment-uploader"
                    title="1. Sube la Prenda (Diseño)"
                    description="Esta es la imagen con el diseño a aplicar."
                    value={garmentImage}
                    onChange={setGarmentImage}
                    isLoading={isGarmentLoading}
                />
                <button
                    onClick={openGarmentSamples}
                    className="text-center text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 py-2 rounded-md bg-slate-800 hover:bg-slate-700/50"
                >
                    O elige un diseño de prenda de muestra
                </button>
            </div>

            {/* Section 2: Model Uploader */}
            <div className="flex flex-col gap-2">
                <ImageUploader
                    id="model-uploader"
                    title="2. Sube la Modelo (Referencia)"
                    description="Esta es la modelo que vestirá la prenda."
                    value={modelImage}
                    onChange={setModelImage}
                    isLoading={isModelLoading}
                />
                <button
                    onClick={openModelSamples}
                    className="text-center text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 py-2 rounded-md bg-slate-800 hover:bg-slate-700/50"
                >
                    O elige una modelo de muestra
                </button>
            </div>

            {/* Section 3: Age Adjustment */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white">3. Ajusta la edad de la modelo</h2>
                <p className="text-sm text-slate-400">Selecciona el rango de edad deseado para la modelo.</p>
                <CustomSelect
                    options={ageOptions}
                    selectedValue={modelAge}
                    onSelect={setModelAge}
                    ariaLabel="Selecciona el rango de edad de la modelo"
                />
            </div>

            {/* Section 4: Specific Instructions */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white">4. Añade instrucciones específicas (opcional)</h2>
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

            {/* Section 5: Background Selector */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white">5. Elige el fondo</h2>
                <p className="text-sm text-slate-400">Selecciona el estilo del fondo.</p>
                <CustomSelect
                    options={backgroundOptions}
                    selectedValue={background}
                    onSelect={handleBackgroundSelect}
                    ariaLabel="Selecciona el estilo del fondo"
                    selectedLabel={getBackgroundLabel()}
                />
                 <input
                    type="file"
                    ref={customBackgroundInputRef}
                    onChange={handleCustomBackgroundChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    aria-hidden="true"
                />
                {customBackground && background === 'custom' && (
                    <div className="mt-2 rounded-md overflow-hidden border border-slate-600 relative group animate-fade-in-scale">
                         <img 
                            src={`data:${customBackground.mimeType};base64,${customBackground.base64}`} 
                            alt="Previsualización del fondo personalizado" 
                            className="w-full h-24 object-cover"
                         />
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <p className="text-white font-bold text-sm">Fondo Personalizado</p>
                         </div>
                    </div>
                )}
            </div>

            {/* Section 6: Color Palette Selector */}
            <ColorPaletteSelector
                title="6. Elige una paleta de colores (opcional)"
                description="El diseño de la prenda usará estos colores."
                palettes={colorPalettes}
                selectedPaletteId={selectedPaletteId}
                onSelect={setSelectedPaletteId}
            />

            {/* Generate Button */}
            <button
                onClick={onGenerate}
                disabled={!canGenerate}
                className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-lg text-lg transition-all duration-300 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-500 disabled:cursor-not-allowed enabled:hover:shadow-lg enabled:hover:shadow-cyan-500/50 ${canGenerate ? 'animate-pulse-glow' : ''}`}
            >
                {isLoading ? 'Generando...' : 'Generar Fotografía'}
            </button>
        </div>
    </div>
  );
};

export default ControlsPanel;