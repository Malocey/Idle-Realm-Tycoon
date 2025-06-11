
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const HP_FUNDAMENTALS_NODE: SharedSkillDefinition = {
  id: 'SHARED_MAIN_HP',
  name: 'Vitality Fundamentals',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${((currentBonus as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Base Max HP. ${nextMinor !== null ? `Next Minor: +${((nextMinor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${((nextMajor as number) * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'HERO',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], 
  costSharedSkillPointsPerMajorLevel: [1, 2, 3], 
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), 
  effects: [{
    stat: 'maxHp' as keyof HeroStats,
    baseValuePerMajorLevel: [0.03, 0.04, 0.05],
    minorValuePerMinorLevel: [0.003, 0.0035, 0.004], 
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_ORIGIN', majorLevel: 1 }],
  position: { x: 3, y: 2 },
};
