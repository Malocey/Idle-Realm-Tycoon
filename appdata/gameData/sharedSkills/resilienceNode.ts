
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const RESILIENCE_NODE: SharedSkillDefinition = {
  id: 'SHARED_DEFENSE_HP_REGEN',
  name: 'Resilience',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus as number).toFixed(1)} HP/s Regen. ${nextMinor !== null ? `Next Minor: +${(nextMinor as number).toFixed(1)} HP/s.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor as number).toFixed(1)} HP/s (base).` : ''}`,
  iconName: 'HEALTH_POTION',
  maxMajorLevels: 3, // Updated
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [2, 3, 4], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'hpRegen' as keyof HeroStats,
    baseValuePerMajorLevel: [0.1, 0.15, 0.2], // Updated (extended)
    minorValuePerMinorLevel: [0.01, 0.015, 0.02], // Updated (extended)
    isPercentage: false,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_DEFENSE', majorLevel: 2 }],
  position: { x: 0, y: 3 },
};
