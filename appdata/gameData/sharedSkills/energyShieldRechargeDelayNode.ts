
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types'; 
import { GAME_TICK_MS } from '../../constants'; // GAME_TICK_MS for description clarity

export const QUICK_RECOVERY_NODE: SharedSkillDefinition = {
  id: 'SHARED_ES_RECHARGE_DELAY_FLAT',
  name: 'Quick Recovery',
  description: (currentBonus, nextMinor, nextMajor, isPercentage) => {
    const currentSeconds = (currentBonus * GAME_TICK_MS / 1000).toFixed(1);
    const nextMinorSeconds = nextMinor !== null ? (nextMinor * GAME_TICK_MS / 1000).toFixed(1) : null;
    const nextMajorSeconds = nextMajor !== null ? (nextMajor * GAME_TICK_MS / 1000).toFixed(1) : null;
    return `Currently: -${currentSeconds}s Energy Shield Recharge Delay. ${nextMinorSeconds !== null ? `Next Minor: -${nextMinorSeconds}s.` : ''} ${nextMajorSeconds !== null ? `Next Rank: -${nextMajorSeconds}s (base).` : ''}`;
  },
  iconName: 'WARNING', // Placeholder, maybe a clock icon later
  maxMajorLevels: 3,
  minorLevelsPerMajorTier: [5, 5, 5],
  costSharedSkillPointsPerMajorLevel: [6, 7, 8],
  costHeroXpPoolPerMinorLevel: (major, minor) => 4 * (110 * major + 40 * minor + 220), // Cost is in Heroic Points
  effects: [{
    stat: 'energyShieldRechargeDelay' as keyof HeroStats, // This is a reduction, so values are negative
    baseValuePerMajorLevel: [-10, -15, -20], // -10, -15, -20 ticks
    minorValuePerMinorLevel: [-1, -1, -2],   // -1, -1, -2 ticks per minor
    isPercentage: false,
  }],
  prerequisites: [
    { skillId: 'SHARED_MAX_ES_PERCENT', majorLevel: 2 },
    { skillId: 'SHARED_ES_RECHARGE_RATE_PERCENT', majorLevel: 1 }
  ],
  position: { x: -1, y: 1 },
};