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
