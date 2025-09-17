import React from 'react';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-lg shadow-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Generated result preview" 
          className="object-contain w-full h-full max-h-[calc(90vh-2rem)]"
        />
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center text-2xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-transform duration-200 hover:scale-110 z-10"
          aria-label="Close preview"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;