
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const DIVINE_HEALING_NODE: SharedSkillDefinition = {
  id: 'SHARED_HEAL_POWER_PERCENT',
  name: 'Divine Healing',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Heal Power. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'STAFF_ICON',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [4, 5, 6], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (80 * major + 30 * minor + 160), // Cost is in Heroic Points
  effects: [{
    stat: 'healPower' as keyof HeroStats,
    baseValuePerMajorLevel: [0.05, 0.07, 0.10], 
    minorValuePerMinorLevel: [0.01, 0.015, 0.02], 
    isPercentage: true,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAIN_DEFENSE', majorLevel: 2 },
    { skillId: 'SHARED_MAIN_MP', majorLevel: 2 },
    { skillId: 'SHARED_MP_REGEN', majorLevel: 2 },
  ],
  position: { x: 0.75, y: 1 }, 
};