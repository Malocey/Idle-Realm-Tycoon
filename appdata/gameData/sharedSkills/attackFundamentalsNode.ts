
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const ATTACK_FUNDAMENTALS_NODE: SharedSkillDefinition = {
  id: 'SHARED_MAIN_ATTACK',
  name: 'Attack Fundamentals',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Base Damage. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'SWORD',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [1, 2, 3], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (50 * major + 20 * minor + 100), // Cost is in Heroic Points
  effects: [{
    stat: 'damage' as keyof HeroStats,
    baseValuePerMajorLevel: [0.02, 0.03, 0.04],
    minorValuePerMinorLevel: [0.002, 0.003, 0.004],
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_ORIGIN', majorLevel: 1 }],
  position: { x: 2, y: 3 },
};