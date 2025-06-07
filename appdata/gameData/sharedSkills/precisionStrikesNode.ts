
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const PRECISION_STRIKES_NODE: SharedSkillDefinition = {
  id: 'SHARED_ATTACK_CRIT_CHANCE',
  name: 'Precision Strikes',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(2)}${isPercentage ? '%' : ''} Crit Chance. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(2)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(2)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'MAGIC_ARROW',
  maxMajorLevels: 2,
  minorLevelsPerMajorTier: [10, 10],
  costSharedSkillPointsPerMajorLevel: [2, 3], // Kept original T2 costs
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (100 * major + 30 * minor + 150), // Cost is in Heroic Points
  effects: [{
    stat: 'critChance' as keyof HeroStats,
    baseValuePerMajorLevel: [0.005, 0.005], 
    minorValuePerMinorLevel: [0.0005, 0.0005], 
    isPercentage: true,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAIN_ATTACK', majorLevel: 2 },
    { skillId: 'SHARED_HP_FLAT', majorLevel: 2 } // New prerequisite
  ],
  position: { x: 2.5, y: 4 }, 
};