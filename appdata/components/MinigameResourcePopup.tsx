import React from 'react';
import { ResourceType } from '../types';
import { RESOURCE_COLORS } from '../constants';

// Define CustomCSSProperties for inline style type safety
interface CustomCSSProperties extends React.CSSProperties {
  '--initial-x-offset-px'?: string;
  '--initial-y-offset-px'?: string;
  '--arc-horizontal-drift'?: string;
  '--arc-vertical-peak'?: string;
  '--arc-vertical-fall'?: string;
}

export interface MinigameResourcePopupProps {
  id: string;
  text: string;
  colorClass?: string; // Tailwind color class for text
  topStyle: string; // e.g., 'calc(50% + 10px)'
  leftStyle: string; // e.g., 'calc(50% - 5px)'
  animationStyle: CustomCSSProperties; // For CSS variables controlling the animation
}

const MinigameResourcePopup: React.FC<MinigameResourcePopupProps> = ({
  id,
  text,
  colorClass = 'text-slate-100', // Default color if not specified
  topStyle,
  leftStyle,
  animationStyle,
}) => {
  return (
    <div
      key={id}
      className={`resource-popup ${colorClass}`} // Base class from index.css and Tailwind color
      style={{
        top: topStyle,
        left: leftStyle,
        ...animationStyle,
      }}
      role="status"
      aria-live="polite"
    >
      {text}
    </div>
  );
};

export default MinigameResourcePopup;
