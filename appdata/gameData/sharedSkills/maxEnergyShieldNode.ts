
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const ARCANE_SHIELDING_NODE: SharedSkillDefinition = {
  id: 'SHARED_MAX_ES_PERCENT',
  name: 'Arcane Shielding',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Max Energy Shield. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'SHIELD_BADGE',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [4, 5, 6],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (70 * major + 25 * minor + 140), // Cost is in Heroic Points
  effects: [{
    stat: 'maxEnergyShield' as keyof HeroStats,
    baseValuePerMajorLevel: [0.05, 0.07, 0.10], // +5%, +7%, +10%
    minorValuePerMinorLevel: [0.005, 0.007, 0.01], // +0.5%, +0.7%, +1% per minor
    isPercentage: true,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAIN_DEFENSE', majorLevel: 2 },
    { skillId: 'SHARED_MAIN_MP', majorLevel: 2 }
  ],
  position: { x: 0, y: 2 },
};