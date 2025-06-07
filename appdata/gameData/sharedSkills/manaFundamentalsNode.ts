
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const MANA_FUNDAMENTALS_NODE: SharedSkillDefinition = {
  id: 'SHARED_MAIN_MP',
  name: 'Mana Fundamentals',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Base Max MP. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'CRYSTALS',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [1, 2, 3], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (50 * major + 20 * minor + 100), // Cost is in Heroic Points
  effects: [{
    stat: 'maxMana' as keyof HeroStats,
    baseValuePerMajorLevel: [0.03, 0.04, 0.05],
    minorValuePerMinorLevel: [0.003, 0.004, 0.005],
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_ORIGIN', majorLevel: 1 }],
  position: { x: 2, y: 1 },
};