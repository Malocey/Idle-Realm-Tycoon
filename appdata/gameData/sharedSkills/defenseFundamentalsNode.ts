
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const DEFENSE_FUNDAMENTALS_NODE: SharedSkillDefinition = {
  id: 'SHARED_MAIN_DEFENSE',
  name: 'Defense Fundamentals',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Base Defense. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'SHIELD',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], 
  costSharedSkillPointsPerMajorLevel: [1, 2, 3], 
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), 
  effects: [{
    stat: 'defense' as keyof HeroStats,
    baseValuePerMajorLevel: [0.02, 0.03, 0.04],
    minorValuePerMinorLevel: [0.002, 0.0025, 0.003], 
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_ORIGIN', majorLevel: 1 }],
  position: { x: 1, y: 2 },
};
