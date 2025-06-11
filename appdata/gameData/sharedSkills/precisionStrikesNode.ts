
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const PRECISION_STRIKES_NODE: SharedSkillDefinition = {
  id: 'SHARED_ATTACK_CRIT_CHANCE',
  name: 'Precision Strikes',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(2)}${isPercentage ? '%' : ''} Crit Chance. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(2)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(2)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'MAGIC_ARROW',
  maxMajorLevels: 3, // Updated
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [3, 4, 5], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'critChance' as keyof HeroStats,
    baseValuePerMajorLevel: [0.005, 0.005, 0.007], // Updated (extended)
    minorValuePerMinorLevel: [0.0005, 0.0005, 0.0007], // Updated (extended)
    isPercentage: true,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAIN_ATTACK', majorLevel: 2 },
    { skillId: 'SHARED_HP_FLAT', majorLevel: 2 }
  ],
  position: { x: 2.5, y: 4 },
};
