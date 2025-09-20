/**
 * @file This component was not in the original file list but seems to be a logical part of the application.
 * It displays a gallery of sample images that the user can select.
 * It was likely intended to be part of the SampleSelectionModal or used directly.
 * For this refactoring, it is assumed this is a missing file and has been created with best practices.
 */
import React, { useState, useEffect } from 'react';
import type { ImageData } from '../types';
import type { Sample } from '../data/samples';
import { urlToImageData } from '../utils/imageUtils';

/**
 * Props for the SampleGallery component.
 */
interface SampleGalleryProps {
  samples: Sample[];
  onSelect: (sample: Sample) => void;
}

const SampleGallery: React.FC<SampleGalleryProps> = ({ samples, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
      {samples.map((sample) => (
        <button
          key={sample.id}
          onClick={() => onSelect(sample)}
          className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
          aria-label={`Select ${sample.name}`}
        >
          <img
            src={sample.url}
            alt={sample.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
            <p className="text-white text-xs font-medium text-left">{sample.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SampleGallery;
