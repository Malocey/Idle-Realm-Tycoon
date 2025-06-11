
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const ARCANE_SHIELDING_NODE: SharedSkillDefinition = {
  id: 'SHARED_MAX_ES_PERCENT',
  name: 'Arcane Shielding',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Max Energy Shield. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'SHIELD_BADGE',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [4, 5, 6],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'maxEnergyShield' as keyof HeroStats,
    baseValuePerMajorLevel: [0.05, 0.07, 0.10],
    minorValuePerMinorLevel: [0.005, 0.007, 0.01], // Assuming 3 values already
    isPercentage: true,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAIN_DEFENSE', majorLevel: 2 },
    { skillId: 'SHARED_MAIN_MP', majorLevel: 2 }
  ],
  position: { x: 0, y: 2 },
};
