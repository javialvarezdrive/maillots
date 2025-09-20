/**
 * @file A modal component that displays a gallery of sample items for selection.
 * It's a reusable modal that takes a title, a list of samples, and a selection handler.
 */
import React from 'react';
import type { Sample } from '../data/samples';
import SampleGallery from './SampleGallery';

/**
 * Props for the SampleSelectionModal component.
 */
interface SampleSelectionModalProps {
  /** Controls the visibility of the modal. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** The title displayed at the top of the modal. */
  title: string;
  /** The array of sample items to display. */
  samples: Sample[];
  /** Callback function invoked when a sample is selected. */
  onSelect: (sample: Sample) => void;
}

const SampleSelectionModal: React.FC<SampleSelectionModalProps> = ({ isOpen, onClose, title, samples, onSelect }) => {
  // Render nothing if the modal is not open.
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content */}
      <div
        className="bg-slate-900 w-full max-w-2xl rounded-lg shadow-2xl p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        {/* Modal Header */}
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
        
        {/* Sample Gallery */}
        <SampleGallery samples={samples} onSelect={onSelect} />

      </div>
    </div>
  );
};

export default SampleSelectionModal;
