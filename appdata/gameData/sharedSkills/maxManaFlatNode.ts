
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const EXPANDED_MIND_NODE: SharedSkillDefinition = {
  id: 'SHARED_MP_FLAT',
  name: 'Expanded Mind',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${currentBonus.toFixed(1)} Max Mana. ${nextMinor !== null ? `Next Minor: +${nextMinor.toFixed(1)}.` : ''} ${nextMajor !== null ? `Next Rank: +${nextMajor.toFixed(1)} (base).` : ''}`,
  iconName: 'CRYSTALS',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [10, 10, 10],
  costSharedSkillPointsPerMajorLevel: [2, 3, 4], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (40 * major + 15 * minor + 80), // Cost is in Heroic Points
  effects: [{
    stat: 'maxMana' as keyof HeroStats,
    baseValuePerMajorLevel: [5, 7, 10], 
    minorValuePerMinorLevel: [0.5, 0.5, 0.5], 
    isPercentage: false,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_MP', majorLevel: 2 }],
  position: { x: 3, y: 0 }, 
};