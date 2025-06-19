// This file now acts as a barrel, re-exporting from the new modular type files within the types/ directory.
export * from './types/index';

// ActiveView enum was re-declared here, causing conflicts.
// It's now defined in appdata/types/enums.ts and exported through './types/index'.
// The export * from './types/index'; above will handle making ActiveView available.
// export enum ActiveView {
//   TOWN = 'TOWN',
//   BATTLEFIELD = 'BATTLEFIELD',
//   DUNGEON_REWARD = 'DUNGEON_REWARD',
//   HERO_ACADEMY = 'HERO_ACADEMY',
//   DUNGEON_EXPLORE = 'DUNGEON_EXPLORE',
//   STONE_QUARRY_MINIGAME = 'STONE_QUARRY_MINIGAME',
//   ACTION_BATTLE_VIEW = 'ACTION_BATTLE_VIEW',
//   SHARED_SKILL_TREE = 'SHARED_SKILL_TREE',
//   GOLD_MINE_MINIGAME = 'GOLD_MINE_MINIGAME',
//   DEMONICON_PORTAL = 'DEMONICON_PORTAL',
//   WORLD_MAP = 'WORLD_MAP',
//   ACADEMY_OF_SCHOLARS = 'ACADEMY_OF_SCHOLARS',
//   AUTO_BATTLER = 'AUTO_BATTLER',
//   END_OF_BATTLE_SUMMARY = 'END_OF_BATTLE_SUMMARY',
// }
