
import React, { useState, useEffect } from 'react';
import type { ImageData } from '../types';
import type { Sample } from '../data/samples';
import { urlToImageData } from '../utils/imageUtils';

interface SampleGalleryProps {
  title: string;
  samples: Sample[];
  onSelect: (imageData: ImageData) => void;
  selectedImage: ImageData | null;
}

// FIX: This component was refactored to handle the `Sample` type correctly.
// It now fetches image data from the `url` property of each sample and uses the `name` property for alt text.
// This resolves multiple errors related to accessing non-existent `imageData` and `alt` properties on the `Sample` object.
const SampleGallery: React.FC<SampleGalleryProps> = ({ title, samples, onSelect, selectedImage }) => {
  const [samplesWithData, setSamplesWithData] = useState<(Sample & { imageData: ImageData | null })[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadSamplesData = async () => {
      const loadedSamples = await Promise.all(
        samples.map(async (sample) => {
          try {
            const imageData = await urlToImageData(sample.url);
            return { ...sample, imageData };
          } catch (error) {
            console.error(`Failed to load image data for ${sample.name}:`, error);
            return { ...sample, imageData: null };
          }
        })
      );
      if (isMounted) {
        setSamplesWithData(loadedSamples);
      }
    };
    
    loadSamplesData();

    return () => {
      isMounted = false;
    };
  }, [samples]);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-md font-semibold text-slate-300">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 gap-3">
        {samplesWithData.map((sample) => {
          if (!sample.imageData) {
            return null; // Don't render if image data couldn't be loaded
          }
          const isSelected = selectedImage?.base64 === sample.imageData.base64;
          const thumbnailUrl = `data:${sample.imageData.mimeType};base64,${sample.imageData.base64}`;
          return (
            <button
              key={sample.id}
              onClick={() => onSelect(sample.imageData!)}
              className={`relative aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all duration-200 hover:scale-105 group ${
                isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'ring-1 ring-slate-700 hover:ring-slate-500'
              }`}
              aria-label={`Select ${sample.name}`}
              aria-pressed={isSelected}
            >
              <img src={thumbnailUrl} alt={sample.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SampleGallery;
