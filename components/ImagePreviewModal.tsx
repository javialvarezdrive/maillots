/**
 * @file A modal component for previewing generated images.
 * It allows users to navigate through a gallery of images, zoom in on a specific image,
 * download it, or select it for refinement.
 */
import React, { useState, useCallback, useEffect } from 'react';
import DownloadIcon from './icons/DownloadIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import SparklesIcon from './icons/SparklesIcon';

/**
 * Props for the ImagePreviewModal component.
 */
interface ImagePreviewModalProps {
  /** An array of image data URLs to be displayed. */
  images: string[];
  /** The index of the currently visible image in the `images` array. */
  currentIndex: number;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Callback to navigate to the next or previous image. */
  onNavigate: (direction: 'next' | 'prev') => void;
  /** Callback to select the current image for further refinement. */
  onSelectForRefinement: (index: number) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ images, currentIndex, onClose, onNavigate, onSelectForRefinement }) => {
  // State to manage the zoom level of the image.
  const [isZoomed, setIsZoomed] = useState(false);

  /**
   * Handles keyboard events for modal navigation and closing.
   * - Escape: Closes the modal (or unzooms first).
   * - ArrowRight: Navigates to the next image.
   * - ArrowLeft: Navigates to the previous image.
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (isZoomed) {
        setIsZoomed(false); // First escape press unzooms
        return;
      }
      onClose(); // Second escape press closes modal
    }
    
    // Disable arrow key navigation when zoomed in.
    if (isZoomed) return;

    if (event.key === 'ArrowRight') {
      onNavigate('next');
    } else if (event.key === 'ArrowLeft') {
      onNavigate('prev');
    }
  }, [onNavigate, onClose, isZoomed]);

  // Effect to add and remove the keyboard event listener.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Effect to reset zoom state whenever the image index changes.
  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);


  // Do not render the modal if the image data is invalid.
  if (images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }
  
  const imageUrl = images[currentIndex];

  /** Prevents clicks inside the modal content from closing the modal. */
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /** Toggles the zoom state of the image. */
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(prev => !prev);
  };
  
  /** Prevents the download link click from propagating. */
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };


  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={handleModalContentClick}
      >
        {/* Main Image Container */}
        <div
          className={`relative max-w-5xl w-full h-full flex justify-center overflow-auto ${isZoomed ? 'items-start' : 'items-center'}`}
        >
          <img
            src={imageUrl}
            alt={`Generated result preview ${currentIndex + 1} of ${images.length}`}
            className={`transition-transform duration-300 ease-in-out ${isZoomed ? 'scale-150 origin-top cursor-zoom-out' : 'object-contain max-w-full max-h-[90vh] rounded-lg cursor-zoom-in'}`}
            onClick={handleImageClick}
          />
        </div>

        {/* Navigation Buttons (visible only if there's more than one image and not zoomed) */}
        {images.length > 1 && !isZoomed && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
              className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/60 text-white rounded-full flex items-center justify-center text-3xl hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 hover:scale-110"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
              className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/60 text-white rounded-full flex items-center justify-center text-3xl hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 hover:scale-110"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </>
        )}

        {/* Top Right Controls */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectForRefinement(currentIndex); }}
              className="w-10 h-10 bg-slate-800/90 text-white rounded-full flex items-center justify-center hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-transform duration-200 hover:scale-110"
              aria-label="Select image for refinement"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleImageClick}
              className="w-10 h-10 bg-slate-800/90 text-white rounded-full flex items-center justify-center hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-transform duration-200 hover:scale-110"
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            >
                <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <a
              href={imageUrl}
              download={`aristic-photo-lab-${Date.now()}.png`}
              onClick={handleDownloadClick}
              className="w-10 h-10 bg-slate-800/90 text-white rounded-full flex items-center justify-center hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-transform duration-200 hover:scale-110"
              aria-label="Download image"
            >
              <DownloadIcon className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-800/90 text-white rounded-full flex items-center justify-center text-2xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-transform duration-200 hover:scale-110"
              aria-label="Close preview"
            >
              &times;
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;