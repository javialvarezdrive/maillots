/**
 * @file A versatile image uploader component.
 * Supports file selection, drag-and-drop, and capturing photos with the device camera.
 * Displays image previews and a loading state.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import UploadIcon from './icons/UploadIcon';
import CameraIcon from './icons/CameraIcon';
import type { ImageData } from '../types';

/**
 * Props for the ImageUploader component.
 */
interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  value: ImageData | null;
  onChange: (imageData: ImageData | null) => void;
  isLoading?: boolean;
}

/**
 * Centralized object for UI strings.
 * This improves maintainability and prepares the component for potential internationalization.
 */
const UI_STRINGS = {
  FILE_TYPE_ERROR: 'Por favor, sube un archivo PNG, JPG o WEBP.',
  CAMERA_ACCESS_ERROR_MESSAGE: 'No se pudo acceder a la cámara. Asegúrate de haber concedido los permisos.',
  CAMERA_NOT_SUPPORTED: 'La cámara no es compatible con este navegador.',
  LOADING_TEXT: 'Cargando...',
  DROP_ZONE_TEXT: 'Haz clic para subir o arrastra una imagen',
  FILE_FORMATS: 'PNG, JPG, WEBP',
  SEPARATOR_TEXT: 'O',
  USE_CAMERA_BUTTON: 'Usar Cámara',
  CAMERA_FEED_LABEL: 'Camera feed',
  CAPTURE_PHOTO_LABEL: 'Capture photo',
  CLOSE_CAMERA_LABEL: 'Close camera'
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, value, onChange, isLoading = false }) => {
  // State for the image preview URL.
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // State to track when a file is being dragged over the component.
  const [isDragging, setIsDragging] = useState(false);
  // State to control the visibility of the camera modal.
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Refs for camera elements.
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Effect to update the preview when the `value` prop changes.
  useEffect(() => {
    if (value) {
      setImagePreview(`data:${value.mimeType};base64,${value.base64}`);
    } else {
      setImagePreview(null);
    }
  }, [value]);

  // Effect to manage the camera stream.
  useEffect(() => {
    // Start camera stream when modal is opened.
    if (isCameraOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          alert(`${UI_STRINGS.CAMERA_ACCESS_ERROR_MESSAGE}\nError: ${(err as Error).message}`);
          setIsCameraOpen(false);
        });
    }

    // Cleanup function to stop the camera stream when the component unmounts or the modal closes.
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraOpen]);


  /**
   * Processes a File object, validates its type, and converts it to ImageData.
   */
  const handleFile = useCallback((file: File) => {
    if (file && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onChange({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    } else {
      alert(UI_STRINGS.FILE_TYPE_ERROR);
    }
  }, [onChange]);

  // --- Drag and Drop Event Handlers ---
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return; // Prevent drop if loading
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // --- Click and Change Event Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleClick = () => {
    if (isLoading) return;
    // Programmatically click the hidden file input.
    document.getElementById(id)?.click();
  }

  // --- Camera Functionality Handlers ---
  const handleOpenCamera = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the main div's click handler from firing.
    if (isLoading) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(UI_STRINGS.CAMERA_NOT_SUPPORTED);
        return;
    }
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame onto the canvas.
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        // Convert canvas content to a data URL.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64String = dataUrl.split(',')[1];
        // Update the parent component with the new image data.
        onChange({ base64: base64String, mimeType: 'image/jpeg' });
        handleCloseCamera();
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative group flex items-center justify-center h-64 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-cyan-500/10 shadow-2xl shadow-cyan-500/20 scale-105' : 'hover:border-slate-500'} ${isLoading ? '!cursor-wait' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            id={id}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {/* Loading overlay */}
          {isLoading ? (
              <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center rounded-lg">
                  <svg aria-hidden="true" className="w-8 h-8 text-slate-600 animate-spin fill-cyan-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <p className="text-slate-400 mt-2 text-sm">{UI_STRINGS.LOADING_TEXT}</p>
              </div>
          // Image preview
          ) : imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="object-contain w-full h-full rounded-md" />
            </>
          // Default empty state
          ) : (
            <div className="text-center text-slate-400 p-4">
              <UploadIcon className="w-8 h-8 mx-auto mb-2" />
              <p>{UI_STRINGS.DROP_ZONE_TEXT}</p>
              <p className="text-xs">{UI_STRINGS.FILE_FORMATS}</p>
              
              <div className="flex items-center w-full max-w-xs mx-auto my-4">
                  <div className="flex-grow border-t border-slate-600"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">{UI_STRINGS.SEPARATOR_TEXT}</span>
                  <div className="flex-grow border-t border-slate-600"></div>
              </div>
              
              <button
                  onClick={handleOpenCamera}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-slate-800/50 focus:ring-cyan-500"
              >
                  <CameraIcon className="w-5 h-5" />
                  <span>{UI_STRINGS.USE_CAMERA_BUTTON}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
          onClick={handleCloseCamera}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-slate-900 p-4 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-lg h-auto rounded-md"
              aria-label={UI_STRINGS.CAMERA_FEED_LABEL}
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={handleCapture}
                className="p-4 bg-cyan-500 rounded-full text-white hover:bg-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
                aria-label={UI_STRINGS.CAPTURE_PHOTO_LABEL}
              >
                <CameraIcon className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={handleCloseCamera}
              className="absolute top-2 right-2 w-8 h-8 bg-slate-800/80 text-white rounded-full flex items-center justify-center text-xl hover:bg-slate-700"
              aria-label={UI_STRINGS.CLOSE_CAMERA_LABEL}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploader;