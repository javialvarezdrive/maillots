import React, { useState, useCallback, useEffect } from 'react';
import UploadIcon from './icons/UploadIcon';
import type { ImageData } from '../types';

interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  value: ImageData | null;
  onChange: (imageData: ImageData | null) => void;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, value, onChange, isLoading = false }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value) {
      setImagePreview(`data:${value.mimeType};base64,${value.base64}`);
    } else {
      setImagePreview(null);
    }
  }, [value]);


  const handleFile = useCallback((file: File) => {
    if (file && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onChange({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, sube un archivo PNG, JPG o WEBP.');
    }
  }, [onChange]);

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
    if (isLoading) return;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleClick = () => {
    if (isLoading) return;
    document.getElementById(id)?.click();
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{description}</p>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative group flex items-center justify-center h-64 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg transition-colors duration-200 ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'hover:border-slate-500'} ${isLoading ? '!cursor-wait' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          id={id}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading ? (
            <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center rounded-lg">
                <svg aria-hidden="true" className="w-8 h-8 text-slate-600 animate-spin fill-cyan-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <p className="text-slate-400 mt-2 text-sm">Cargando...</p>
            </div>
        ) : imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="object-contain w-full h-full rounded-md" />
          </>
        ) : (
          <div className="text-center text-slate-400">
            <UploadIcon className="w-8 h-8 mx-auto mb-2" />
            <p>Haz clic para subir o arrastra una imagen</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;