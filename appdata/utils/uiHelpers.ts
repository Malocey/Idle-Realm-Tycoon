
import { RunBuffRarity } from '../types';

export const getRarityTextClass = (rarity: RunBuffRarity): string => {
  switch (rarity) {
    case RunBuffRarity.COMMON: return 'text-slate-300';
    case RunBuffRarity.UNCOMMON: return 'text-green-400';
    case RunBuffRarity.RARE: return 'text-sky-400';
    case RunBuffRarity.EPIC: return 'text-purple-400';
    case RunBuffRarity.LEGENDARY: return 'text-amber-400';
    case RunBuffRarity.MYTHIC: return 'text-red-400';
    default: return 'text-slate-300';
  }
};

export const getRarityBorderClass = (rarity: RunBuffRarity): string => {
    switch (rarity) {
      case RunBuffRarity.COMMON: return 'border-slate-500';
      case RunBuffRarity.UNCOMMON: return 'border-green-600';
      case RunBuffRarity.RARE: return 'border-sky-600';
      case RunBuffRarity.EPIC: return 'border-purple-600';
      case RunBuffRarity.LEGENDARY: return 'border-amber-600';
      case RunBuffRarity.MYTHIC: return 'border-red-600';
      default: return 'border-slate-500';
    }
};

export const getRarityAnimationClass = (rarity: RunBuffRarity): string => {
    if (rarity === RunBuffRarity.LEGENDARY) return 'animate-legendary-shimmer';
    if (rarity === RunBuffRarity.MYTHIC) return 'animate-mythic-pulse';
    return '';
};

// Color Utility Functions (moved from BattleStatBars)
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

export const componentToHex = (c: number): string => { const hex = c.toString(16); return hex.length === 1 ? "0" + hex : hex; };

export const rgbToHex = (r: number, g: number, b: number): string => "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

export const interpolateColor = (color1Hex: string, color2Hex: string, ratio: number): string => {
  const rgb1 = hexToRgb(color1Hex);
  const rgb2 = hexToRgb(color2Hex);
  if (!rgb1 || !rgb2) return color1Hex; 
  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
  return rgbToHex(r, g, b);
};
