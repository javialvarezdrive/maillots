import type { ImageData } from '../types';

export const urlToImageData = async (url: string): Promise<ImageData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} while fetching ${url}`);
  }
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader result is not a string.'));
      }
      const base64String = reader.result.split(',')[1];
      if (!base64String) {
        return reject(new Error('Could not extract base64 string from data URL.'));
      }
      resolve({ base64: base64String, mimeType: blob.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};
