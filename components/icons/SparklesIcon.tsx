
import React from 'react';

/**
 * SparklesIcon component.
 * Renders an SVG icon representing sparkles, often used to denote AI or magic features.
 * @param props - Standard SVG props.
 */
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9.5 2.5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/>
        <path d="M4.5 9.5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/>
        <path d="M14.5 9.5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/>
        <path d="M9.5 15.5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/>
        <path d="m2 4.5 1-1 2 2-1 1-2-2Z"/>
        <path d="m14 2.5 1 1 2 2-1 1-2-2Z"/>
        <path d="m2 10.5 1-1 2 2-1 1-2-2Z"/>
        <path d="m14 8.5 1 1 2 2-1 1-2-2Z"/>
        <path d="m2 16.5 1-1 2 2-1 1-2-2Z"/>
        <path d="m14 14.5 1 1 2 2-1 1-2-2Z"/>
    </svg>
);

export default SparklesIcon;
