
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const COLOSSAL_FORTITUDE_NODE: SharedSkillDefinition = {
  id: 'SHARED_HP_FLAT',
  name: 'Colossal Fortitude',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => {
    let desc = "Currently: ";
    if (typeof currentBonus === 'object') {
        desc += `+${currentBonus.flat.toFixed(0)} HP, +${(currentBonus.percent * 100).toFixed(1)}% Max HP. `;
    } else { // Fallback for simple number if needed, though expecting object
        desc += `+${currentBonus.toFixed(0)} Max HP. `;
    }
    if (typeof nextMinor === 'object' && nextMinor !== null) { // Assuming nextMinor could be {flat: number, percent: number}
        desc += `Next Minor: +${nextMinor.flat.toFixed(0)} HP. `;
    } else if (typeof nextMinor === 'number' && nextMinor !== null) {
        desc += `Next Minor: +${nextMinor.toFixed(0)} HP. `;
    }
    if (typeof nextMajor === 'object' && nextMajor !== null) {
        desc += `Next Rank: +${nextMajor.flat.toFixed(0)} HP, +${(nextMajor.percent * 100).toFixed(1)}% Max HP (base).`;
    }
    return desc;
  },
  iconName: 'SHIELD_BADGE',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [2, 3, 4],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Updated cost formula
  effects: [{
    stat: 'maxHp' as keyof HeroStats,
    baseValuePerMajorLevel: [
        { flat: 25, percent: 0.01 }, 
        { flat: 60, percent: 0.015 }, 
        { flat: 150, percent: 0.02 }
    ],    
    minorValuePerMinorLevel: [
        { flat: 3, percent: 0 }, 
        { flat: 4, percent: 0 }, 
        { flat: 5, percent: 0 }
    ],      
    isPercentage: false, // Indicates the primary nature is flat, but description handles combined
  }],
  prerequisites: [{ skillId: 'SHARED_MAIN_HP', majorLevel: 2 }],
  position: { x: 3, y: 3 }, 
};
