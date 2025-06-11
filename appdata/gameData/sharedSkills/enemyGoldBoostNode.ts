
import { SharedSkillDefinition, HeroStats, GlobalBonuses, ResourceType } from '../../types';

export const ENEMY_GOLD_BOOST_NODE: SharedSkillDefinition = {
  id: 'SHARED_ENEMY_GOLD_BOOST',
  name: "Treasure Hunter's Eye",
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Gold from enemies. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'LOOT_BAG',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [1, 1, 2],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'enemyGoldDropBonus' as keyof GlobalBonuses,
    baseValuePerMajorLevel: [0.05, 0.10, 0.15],
    minorValuePerMinorLevel: [0.01, 0.01, 0.015],
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_HEROIC_POINTS_BOOST', majorLevel: 1 }],
  position: { x: 0, y: -1 }, // Geänderte Position
  nodeSize: 'normal',
};
