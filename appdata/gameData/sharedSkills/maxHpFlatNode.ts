
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const COLOSSAL_FORTITUDE_NODE: SharedSkillDefinition = {
  id: 'SHARED_HP_FLAT',
  name: 'Colossal Fortitude',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${currentBonus.toFixed(0)} Max HP. ${nextMinor !== null ? `Next Minor: +${nextMinor.toFixed(0)}.` : ''} ${nextMajor !== null ? `Next Rank: +${nextMajor.toFixed(0)} (base).` : ''}`,
  iconName: 'SHIELD_BADGE',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [10, 10, 10],
  costSharedSkillPointsPerMajorLevel: [2, 3, 4], // Updated
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (50 * major + 20 * minor + 110), // Cost is in Heroic Points
  effects: [{
    stat: 'maxHp' as keyof HeroStats,
    baseValuePerMajorLevel: [20, 30, 50],    
    minorValuePerMinorLevel: [2, 3, 5],      
    isPercentage: false,
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_HP', majorLevel: 2 }],
  position: { x: 3, y: 3 }, 
};