export interface ColorPalette {
    id: string;
    name: string;
    colors: string[];
}

export const colorPalettes: ColorPalette[] = [
    {
        id: 'none',
        name: 'Original',
        colors: [],
    },
    {
        id: 'sunset',
        name: 'Atardecer',
        colors: ['#F97721', '#F4A723', '#D34E44', '#9B3C55', '#2F264D'],
    },
    {
        id: 'oceanic',
        name: 'Oceánicos',
        colors: ['#006994', '#0096C7', '#48B5E3', '#90E0EF', '#CAF0F8'],
    },
    {
        id: 'pastel',
        name: 'Pastel',
        colors: ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF'],
    },
    {
        id: 'monochrome',
        name: 'Monocromático',
        colors: ['#1C1C1C', '#4A4A4A', '#8C8C8C', '#CCCCCC', '#F5F5F5'],
    },
    {
        id: 'forest',
        name: 'Bosque',
        colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'],
    }
];
