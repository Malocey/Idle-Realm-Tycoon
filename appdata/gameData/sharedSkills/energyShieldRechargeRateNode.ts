
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const RAPID_REGENERATION_NODE: SharedSkillDefinition = {
  id: 'SHARED_ES_RECHARGE_RATE_PERCENT',
  name: 'Rapid Regeneration',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Energy Shield Recharge Rate. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'ATOM_ICON',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [5, 6, 7],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'energyShieldRechargeRate' as keyof HeroStats,
    baseValuePerMajorLevel: [0.10, 0.15, 0.20],
    minorValuePerMinorLevel: [0.01, 0.015, 0.02], // Assuming 3 values already
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_MAX_ES_PERCENT', majorLevel: 1 }],
  position: { x: 0, y: 1 },
};
