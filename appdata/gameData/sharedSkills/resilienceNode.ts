
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const RESILIENCE_NODE: SharedSkillDefinition = {
  id: 'SHARED_DEFENSE_HP_REGEN',
  name: 'Resilience',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${currentBonus.toFixed(1)} HP/s Regen. ${nextMinor !== null ? `Next Minor: +${nextMinor.toFixed(1)} HP/s.` : ''} ${nextMajor !== null ? `Next Rank: +${nextMajor.toFixed(1)} HP/s (base).` : ''}`,
  iconName: 'HEALTH_POTION',
  maxMajorLevels: 2,
  minorLevelsPerMajorTier: [10, 10],
  costSharedSkillPointsPerMajorLevel: [2, 3], // Kept original T2 costs
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (120 * major + 25 * minor + 200), // Cost is in Heroic Points
  effects: [{
    stat: 'hpRegen' as keyof HeroStats,
    baseValuePerMajorLevel: [0.1, 0.15],
    minorValuePerMinorLevel: [0.01, 0.02],
    isPercentage: false,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_DEFENSE', majorLevel: 2 }], // Prerequisite changed to Defense Fundamentals Rank 2
  position: { x: 0, y: 3 }, // Positioned below Defense Fundamentals
};