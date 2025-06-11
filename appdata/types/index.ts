
// This file now acts as a barrel, re-exporting from the new modular type files.
export * from './enums';
export * from './common';
export * from './building';
export * from './hero';
export * from './skill';
export * from './enemy';
export * from './battle';
export * from './upgrades';
export * from './dungeon';
export * from './runBuffs';
export * from './crafting';
export * from './shards';
export * from './quests';
export * from './minigame';
export * from './actionBattle';
export * from './mapTypes';
export * from './accountLevelTypes';
export * from './aethericResonanceTypes';
export * from './research';
export * from './main';

// New Demonicon Milestone Types
export interface DemoniconMilestoneRewardEffect {
  type: 'GLOBAL_STAT_MODIFIER';
  stat: keyof import('./hero').HeroStats;
  value: number;
  isPercentage: boolean;
  description: string;
}

export interface DemoniconMilestoneRewardDefinition {
  id: string;
  enemyId: string;
  rankToAchieve: number;
  rewards: DemoniconMilestoneRewardEffect[];
}
export type { AethericResonanceStatConfig } from './aethericResonanceTypes';
