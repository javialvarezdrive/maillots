/**
 * @file This file contains the data for sample images (garments and models).
 * This data is used to populate the sample selection modals, allowing users to
 * quickly start using the application without uploading their own images.
 */

/**
 * Defines the structure for a single sample item.
 */
export interface Sample {
  id: string;
  name: string;
  url: string;
}

/**
 * An array of sample garment designs.
 */
export const garmentSamples: Sample[] = [
    {
        id: 'garment-1',
        name: 'Azul Degradado',
        url: 'https://i.postimg.cc/5NPB1hG3/Imagen-de-Whats-App-2025-09-18-a-las-17-04-40-c8d4c0c8.jpg'
    },
    {
        id: 'garment-2',
        name: 'Rojo y Negro',
        url: 'https://i.postimg.cc/ZYxgPqB5/photo-2025-09-15-13-53-44.jpg'
    },
    {
        id: 'garment-3',
        name: 'Diseño con Faldilla',
        url: 'https://i.postimg.cc/jdckJq3Y/aaaaaaaaaaaa.png'
    },
     {
        id: 'garment-4',
        name: 'Estampado Floral',
        url: 'https://i.postimg.cc/VsVCFgxS/photo-2025-06-25-13-20-36.jpg'
    },
];

/**
 * An array of sample model reference images.
 */
export const modelSamples: Sample[] = [
    {
        id: 'model-1',
        name: 'Mujer Joven',
        url: 'https://i.postimg.cc/BQzmNfMy/Adobe-Stock-428374704.jpg'
    },
    {
        id: 'model-2',
        name: 'Pelo Azul',
        url: 'https://i.postimg.cc/pVqGhF8P/Adobe-Stock-401430962.jpg'
    },
    {
        id: 'model-3',
        name: 'Mujer en Vaqueros',
        url: 'https://i.postimg.cc/bYGp6PRf/Adobe-Stock-471476392.jpg'
    },
    {
        id: 'model-4',
        name: 'Boceto de Modelo',
        url: 'https://i.postimg.cc/zBpn512p/photo-2025-06-12-18-22-46.jpg'
    }
];