
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';
import { GAME_TICK_MS } from '../../constants';

export const QUICK_RECOVERY_NODE: SharedSkillDefinition = {
  id: 'SHARED_ES_RECHARGE_DELAY_FLAT',
  name: 'Quick Recovery',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => {
    const currentSeconds = (((currentBonus as number) || 0) * GAME_TICK_MS / 1000).toFixed(1);
    const nextMinorSeconds = nextMinor !== null ? (((nextMinor as number) || 0) * GAME_TICK_MS / 1000).toFixed(1) : null;
    const nextMajorSeconds = nextMajor !== null ? (((nextMajor as number) || 0) * GAME_TICK_MS / 1000).toFixed(1) : null;
    return `Currently: -${currentSeconds}s Energy Shield Recharge Delay. ${nextMinorSeconds !== null ? `Next Minor: -${nextMinorSeconds}s.` : ''} ${nextMajorSeconds !== null ? `Next Rank: -${nextMajorSeconds}s (base).` : ''}`;
  },
  iconName: 'WARNING',
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 10, 15], // Updated
  costSharedSkillPointsPerMajorLevel: [6, 7, 8],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (25 * major + 10 * minor + 15), // Standardized
  effects: [{
    stat: 'energyShieldRechargeDelay' as keyof HeroStats,
    baseValuePerMajorLevel: [-10, -15, -20],
    minorValuePerMinorLevel: [-1, -1, -2],   // Assuming 3 values already
    isPercentage: false,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAX_ES_PERCENT', majorLevel: 2 },
    { skillId: 'SHARED_ES_RECHARGE_RATE_PERCENT', majorLevel: 1 }
  ],
  position: { x: -1, y: 1 },
};
