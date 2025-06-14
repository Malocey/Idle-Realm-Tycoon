// appdata/gameData/waves/whisperingWoodsWaves.ts
import { ResourceType, WaveDefinition } from '../../types';

export const MAP_WW_EDGE_BATTLE_1_WAVES: WaveDefinition[] = [
  { 
    id: 'map_ww_edge_battle_1_wave_1',
    enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }, { enemyId: 'SHADOW_CREEPER', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 30 }, { resource: ResourceType.LEATHER, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 6 }]
  },
  {
    id: 'map_ww_edge_battle_1_wave_2',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 40 }, { resource: ResourceType.CRYSTALS, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 8 }]
  },
];

export const MAP_WW_EDGE_BATTLE_2_WAVES: WaveDefinition[] = [
  {
    id: 'map_ww_edge_battle_2_wave_1',
    enemies: [{ enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 45 }, { resource: ResourceType.WOOD, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 9 }]
  },
  {
    id: 'map_ww_edge_battle_2_wave_2',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 2, isElite: true }, { enemyId: 'GIANT_SPIDER', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 55 }, { resource: ResourceType.LEATHER, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 11 }]
  },
];

export const MAP_WW_DEPTHS_PATH_TURNED_BATTLE_WAVES: WaveDefinition[] = [
  {
    id: 'map_ww_depths_path_turned_battle_wave_1',
    enemies: [{ enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'SHADOW_CREEPER', count: 2, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 50 }, { resource: ResourceType.WOOD, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 10 }]
  },
  {
    id: 'map_ww_depths_path_turned_battle_wave_2',
    enemies: [{ enemyId: 'TREANT_SAPLING', count: 1 }, { enemyId: 'SHADOW_CREEPER', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 60 }, { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 12 }]
  },
];

export const MAP_WW_CLERIC_RESCUE_WAVES: WaveDefinition[] = [
  {
    id: 'map_ww_cleric_rescue_wave_1',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 3 }, { enemyId: 'DIRE_WOLF', count: 1, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 70 }, { resource: ResourceType.HEROIC_POINTS, amount: 14 }]
  },
  {
    id: 'map_ww_cleric_rescue_wave_2',
    enemies: [{ enemyId: 'CORRUPTED_TREANT_MINIBOSS', count: 1 }, { enemyId: 'SHADOW_CREEPER', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 100 }, { resource: ResourceType.CRYSTALS, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }]
  },
];

export const MAP_WW_DEPTHS_FINAL_BATTLE_WAVES: WaveDefinition[] = [
  {
    id: 'map_ww_depths_final_battle_wave_1',
    enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2, isElite: true }, { enemyId: 'SHADOW_CREEPER', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 75 }, { resource: ResourceType.IRON, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }]
  },
  {
    id: 'map_ww_depths_final_battle_wave_2',
    enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 1, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 85 }, { resource: ResourceType.WOOD, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 18 }]
  },
];

export const MAP_WW_DEPTHS_OPTIONAL_BATTLE_WAVES: WaveDefinition[] = [
  {
    id: 'map_ww_depths_optional_battle_wave_1',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 2, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 60 }, { resource: ResourceType.CRYSTALS, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 12 }]
  },
  {
    id: 'map_ww_depths_optional_battle_wave_2',
    enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 1 }, { enemyId: 'DIRE_WOLF', count: 1, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 70 }, { resource: ResourceType.HERB_BLOODTHISTLE, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }]
  },
];

export const MAP_CORRUPTED_SHRINE_WAVES: WaveDefinition[] = [
    { id: 'map_corrupted_shrine_wave_1', enemies: [{ enemyId: 'SHADOW_CREEPER', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 80 }, { resource: ResourceType.HEROIC_POINTS, amount: 16 }] },
    { id: 'map_corrupted_shrine_wave_2', enemies: [{ enemyId: 'IMP_WARLOCK', count: 2 }, { enemyId: 'SHADOW_CREEPER', count: 2 }], reward: [{ resource: ResourceType.CRYSTALS, amount: 8 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }] },
    { id: 'map_corrupted_shrine_wave_3', enemies: [{ enemyId: 'BOSS_DEMON_LORD', count: 1, isElite: true }], reward: [{ resource: ResourceType.AETHERIUM, amount: 1 }, { resource: ResourceType.DEMONIC_COIN, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 50 }] },
];

export const WHISPERING_WOODS_WAVES: WaveDefinition[] = [
    ...MAP_WW_EDGE_BATTLE_1_WAVES,
    ...MAP_WW_EDGE_BATTLE_2_WAVES,
    ...MAP_WW_DEPTHS_PATH_TURNED_BATTLE_WAVES,
    ...MAP_WW_CLERIC_RESCUE_WAVES,
    ...MAP_WW_DEPTHS_FINAL_BATTLE_WAVES,
    ...MAP_WW_DEPTHS_OPTIONAL_BATTLE_WAVES,
    ...MAP_CORRUPTED_SHRINE_WAVES,
];
