/**
 * @file A custom dropdown component for selecting a color palette.
 * It displays a list of palettes, each with a name and a visual representation of its colors,
 * in a user-friendly select-style interface.
 */
import React, { useState, useRef, useEffect } from 'react';
import type { ColorPalette } from '../data/palettes';

/**
 * Props for the ColorPaletteSelector component.
 */
interface ColorPaletteSelectorProps {
  title: string;
  description: string;
  palettes: ColorPalette[];
  selectedPaletteId: string;
  onSelect: (paletteId: string) => void;
}

/**
 * A small helper component to render the color swatches and name of a palette.
 * This avoids code duplication between the trigger button and the dropdown options.
 */
const PaletteDisplay: React.FC<{ palette: ColorPalette }> = ({ palette }) => (
    <>
        <div className="flex flex-shrink-0">
            {palette.colors.length > 0 ? (
                palette.colors.slice(0, 4).map((color, index) => (
                    <div
                        key={index}
                        style={{ backgroundColor: color }}
                        className={`w-5 h-5 rounded-full border-2 border-slate-800 ${index > 0 ? '-ml-2' : ''}`}
                        aria-hidden="true" // Decorative
                    ></div>
                ))
            ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-500 bg-slate-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
            )}
        </div>
        <span className="truncate text-left flex-grow">{palette.name}</span>
    </>
);

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({ title, description, palettes, selectedPaletteId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const selectedPalette = palettes.find(p => p.id === selectedPaletteId) || palettes[0];

  // Effect to handle clicks outside the component to close the dropdown.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (paletteId: string) => {
    onSelect(paletteId);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{description}</p>
      <div ref={wrapperRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 appearance-none bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Selected color palette: ${selectedPalette.name}`}
        >
          <PaletteDisplay palette={selectedPalette} />
          <div className="pointer-events-none flex items-center text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
          </div>
        </button>

        {/* Dropdown Options Panel */}
        {isOpen && (
          <div
            className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none animate-fade-in-scale origin-top"
            style={{ animationDuration: '150ms' }}
            role="listbox"
            aria-activedescendant={selectedPaletteId}
          >
            {palettes.map((palette) => (
              <button
                key={palette.id}
                id={palette.id}
                onClick={() => handleSelect(palette.id)}
                className={`w-full flex items-center gap-3 p-3 text-sm font-medium text-left transition-colors duration-150 ${
                  selectedPaletteId === palette.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-300 hover:bg-slate-600'
                }`}
                role="option"
                aria-selected={selectedPaletteId === palette.id}
              >
                <PaletteDisplay palette={palette} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteSelector;
