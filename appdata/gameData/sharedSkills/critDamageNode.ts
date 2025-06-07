
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const LETHAL_STRIKES_NODE: SharedSkillDefinition = {
  id: 'SHARED_CRIT_DAMAGE_PERCENT',
  name: 'Lethal Strikes',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => `Currently: +${(currentBonus * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} Critical Hit Damage. ${nextMinor !== null ? `Next Minor: +${(nextMinor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''}.` : ''} ${nextMajor !== null ? `Next Rank: +${(nextMajor * (isPercentage ? 100 : 1)).toFixed(1)}${isPercentage ? '%' : ''} (base).` : ''}`,
  iconName: 'SWORD',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [4, 5, 6],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (120 * major + 40 * minor + 200), // Cost is in Heroic Points
  effects: [{
    stat: 'critDamage' as keyof HeroStats,
    baseValuePerMajorLevel: [0.10, 0.15, 0.20], // +10%, +15%, +20%
    minorValuePerMinorLevel: [0.01, 0.015, 0.02], // +1%, +1.5%, +2% per minor
    isPercentage: true,
  }],
  prerequisites: [{ skillId: 'SHARED_ATTACK_CRIT_CHANCE', majorLevel: 2 }],
  position: { x: 2.5, y: 5 },
};