/**
 * @file Contains utility functions for image processing.
 */

import type { ImageData } from '../types';

/**
 * Fetches an image from a URL and converts it into an ImageData object.
 * This involves fetching the image as a blob, then using FileReader to
 * read it as a Base64-encoded data URL.
 *
 * @param url The URL of the image to fetch.
 * @returns A promise that resolves to an ImageData object containing the base64 string and MIME type.
 * @throws Will throw an error if the fetch request fails or if the FileReader encounters an issue.
 */
export const urlToImageData = async (url: string): Promise<ImageData> => {
  // Fetch the image from the specified URL.
  const response = await fetch(url);
  
  // Check if the fetch was successful.
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} while fetching ${url}`);
  }
  
  // Get the response body as a Blob.
  const blob = await response.blob();
  
  // Use a Promise to handle the asynchronous nature of FileReader.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // This event is triggered when the file reading is successfully completed.
    reader.onloadend = () => {
      // Ensure the result is a string (data URL).
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader result is not a string.'));
      }
      
      // The result is a data URL like "data:image/png;base64,iVBORw0KGgo...".
      // We need to extract just the base64 part.
      const base64String = reader.result.split(',')[1];
      if (!base64String) {
        return reject(new Error('Could not extract base64 string from data URL.'));
      }

      // Resolve the promise with the required ImageData object.
      resolve({ base64: base64String, mimeType: blob.type });
    };
    
    // This event is triggered if an error occurs during reading.
    reader.onerror = (error) => reject(error);
    
    // Start reading the blob as a data URL.
    reader.readAsDataURL(blob);
  });
};
