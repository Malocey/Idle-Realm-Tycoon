
import { SharedSkillDefinition, HeroStats, GlobalBonuses, ResourceType } from '../../types';

export const HERO_XP_BOOST_NODE: SharedSkillDefinition = {
  id: 'SHARED_HERO_XP_BOOST',
  name: 'Mentorship Program',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Hero XP Gain. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'XP_ICON',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [1, 1, 2],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'heroXpGainBonus' as keyof GlobalBonuses,
    baseValuePerMajorLevel: [0.03, 0.06, 0.10],
    minorValuePerMinorLevel: [0.005, 0.005, 0.008],
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_ORIGIN', majorLevel: 1 }],
  position: { x: 3, y: -1 }, // Geänderte Position
  nodeSize: 'normal',
};
