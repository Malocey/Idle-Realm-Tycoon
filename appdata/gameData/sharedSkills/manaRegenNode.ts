
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const ARCANE_RENEWAL_NODE: SharedSkillDefinition = {
  id: 'SHARED_MP_REGEN',
  name: 'Arcane Renewal',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Mana Regen. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'ATOM_ICON',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [2, 3, 4], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (60 * major + 25 * minor + 120), // Cost is in Heroic Points
  effects: [{
    stat: 'manaRegen' as keyof HeroStats,
    baseValuePerMajorLevel: [0.03, 0.04, 0.05], 
    minorValuePerMinorLevel: [0.003, 0.004, 0.005], 
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_MP', majorLevel: 2 }],
  position: { x: 1, y: 0 }, 
};