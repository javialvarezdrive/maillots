import React from 'react';
import type { ColorPalette } from '../data/palettes';

interface ColorPaletteSelectorProps {
  title: string;
  description: string;
  palettes: ColorPalette[];
  selectedPaletteId: string;
  onSelect: (paletteId: string) => void;
}

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({ title, description, palettes, selectedPaletteId, onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{description}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            onClick={() => onSelect(palette.id)}
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${
              selectedPaletteId === palette.id
                ? 'bg-slate-600 text-white ring-2 ring-cyan-500'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            aria-pressed={selectedPaletteId === palette.id}
          >
            <div className="flex flex-shrink-0">
                {palette.colors.length > 0 ? (
                    palette.colors.slice(0, 4).map((color, index) => (
                        <div 
                            key={index} 
                            style={{ backgroundColor: color }} 
                            className={`w-5 h-5 rounded-full border-2 border-slate-800 ${index > 0 ? '-ml-2' : ''}`}
                        ></div>
                    ))
                ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-500 bg-slate-800 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                )}
            </div>
            <span className="truncate text-left">{palette.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPaletteSelector;
