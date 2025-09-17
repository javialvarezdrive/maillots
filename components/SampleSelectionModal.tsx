import React from 'react';
import type { Sample } from '../data/samples';

interface SampleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  samples: Sample[];
  onSelect: (sample: Sample) => void;
}

const SampleSelectionModal: React.FC<SampleSelectionModalProps> = ({ isOpen, onClose, title, samples, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 w-full max-w-2xl rounded-lg shadow-2xl p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl hover:bg-slate-700 flex-shrink-0"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
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
      </div>
    </div>
  );
};

export default SampleSelectionModal;
