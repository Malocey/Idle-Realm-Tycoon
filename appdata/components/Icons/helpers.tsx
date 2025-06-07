import React from 'react';
import { IconComponent } from '../../types';

// Helper function for SVG icons
export const createIcon = (pathData: string | React.ReactNode): IconComponent => (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    {typeof pathData === 'string' ? <path fillRule="evenodd" d={pathData} clipRule="evenodd" /> : pathData}
  </svg>
);