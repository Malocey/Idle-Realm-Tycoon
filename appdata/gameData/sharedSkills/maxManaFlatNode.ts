
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const EXPANDED_MIND_NODE: SharedSkillDefinition = {
  id: 'SHARED_MP_FLAT',
  name: 'Expanded Mind',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus as number).toFixed(1)} Max Mana. ${nextMinor !== null ? `Next Minor: +${(nextMinor as number).toFixed(1)}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor as number).toFixed(1)} (base).` : ''}`,
  iconName: 'CRYSTALS',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [2, 3, 4],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'maxMana' as keyof HeroStats,
    baseValuePerMajorLevel: [5, 7, 10],
    minorValuePerMinorLevel: [0.5, 0.5, 0.5], // Assuming 3 values already
    isPercentage: false,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_MP', majorLevel: 2 }],
  position: { x: 3, y: 0 },
};
