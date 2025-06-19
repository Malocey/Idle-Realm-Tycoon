
// This file now acts as a barrel, re-exporting from the new modular enum files.
export * from './enums/index';

// Explicitly keep ActiveView here as it's used across many top-level files
// and is not specific to one domain like battle or dungeon.
export enum ActiveView {
  TOWN = 'TOWN',
  BATTLEFIELD = 'BATTLEFIELD',
  DUNGEON_REWARD = 'DUNGEON_REWARD',
  HERO_ACADEMY = 'HERO_ACADEMY',
  DUNGEON_EXPLORE = 'DUNGEON_EXPLORE',
  STONE_QUARRY_MINIGAME = 'STONE_QUARRY_MINIGAME',
  ACTION_BATTLE_VIEW = 'ACTION_BATTLE_VIEW',
  SHARED_SKILL_TREE = 'SHARED_SKILL_TREE',
  GOLD_MINE_MINIGAME = 'GOLD_MINE_MINIGAME',
  DEMONICON_PORTAL = 'DEMONICON_PORTAL',
  WORLD_MAP = 'WORLD_MAP',
  ACADEMY_OF_SCHOLARS = 'ACADEMY_OF_SCHOLARS',
  AUTO_BATTLER = 'AUTO_BATTLER', // New View
  END_OF_BATTLE_SUMMARY = 'END_OF_BATTLE_SUMMARY', // Added missing enum member
}