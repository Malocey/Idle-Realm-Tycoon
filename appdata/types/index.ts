

export * from './enums';
export * from './common';
export * from './building';
export * from './hero'; // Will now export ChannelingProperties, AbilityEffect
export * from './skill';
export * from './enemy'; // Will now export EnemyChannelingAbilityDefinition
export * from './battle'; // Will now export ParticipantChannelingState
export * from './upgrades';
export * from './dungeon';
export * from './runBuffs';
export * from './crafting';
export * from './shards';
export * from './quests';
export * from './minigame';
export * from './actionBattle';
export * from './mapTypes'; // Added export for mapTypes
export * from './main';

// New Demonicon Milestone Types
export interface DemoniconMilestoneRewardEffect {
  type: 'GLOBAL_STAT_MODIFIER'; // For now, only global stat modifiers for Demonicon runs
  stat: keyof import('./hero').HeroStats; // e.g., 'maxHp', 'attackSpeed'
  value: number; // e.g., 0.05 for +5%
  isPercentage: boolean; // true for percentage, false for flat
  description: string; // e.g., "+5% Max HP in Demonicon"
}

export interface DemoniconMilestoneRewardDefinition {
  id: string; // Unique ID for the milestone, e.g., GOBLIN_RANK_9_HP_BONUS
  enemyId: string;
  rankToAchieve: number; // The rank that needs to be cleared (0-indexed internally)
  rewards: DemoniconMilestoneRewardEffect[];
}