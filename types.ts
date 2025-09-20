/**
 * @file Centralized type definitions for the application.
 * This ensures consistency and type safety across components.
 */

/**
 * Represents a generic option for selection components like buttons or dropdowns.
 */
export interface Option {
  id: string;
  label: string;
}

/**
 * Represents the essential data for an image that has been processed.
 * It includes the base64-encoded string and its corresponding MIME type.
 */
export interface ImageData {
  base64: string;
  mimeType: string;
}
