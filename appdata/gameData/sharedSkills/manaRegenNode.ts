
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const ARCANE_RENEWAL_NODE: SharedSkillDefinition = {
  id: 'SHARED_MP_REGEN',
  name: 'Arcane Renewal',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Mana Regen. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'ATOM_ICON',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [2, 3, 4],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'manaRegen' as keyof HeroStats,
    baseValuePerMajorLevel: [0.03, 0.04, 0.05],
    minorValuePerMinorLevel: [0.003, 0.004, 0.005], // Assuming 3 values already, if not, extend to 3
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_MP', majorLevel: 2 }],
  position: { x: 1, y: 0 },
};
