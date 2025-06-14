
// appdata/gameData/waves/verdantPlainsWaves.ts
import { ResourceType, WaveDefinition } from '../../types';

export const MAP_GOBLIN_CAMP_WAVES: WaveDefinition[] = [
  { 
    id: 'map_goblin_camp_wave_1', 
    enemies: [{ enemyId: 'GOBLIN', count: 3 }], 
    reward: [{ resource: ResourceType.GOLD, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 3 }] 
  },
  { 
    id: 'map_goblin_camp_wave_2', 
    enemies: [{ enemyId: 'GOBLIN', count: 5 }], 
    reward: [{ resource: ResourceType.GOLD, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 5 }] 
  },
  { 
    id: 'map_goblin_camp_wave_3', 
    enemies: [{ enemyId: 'GOBLIN', count: 6 }], 
    reward: [{ resource: ResourceType.GOLD, amount: 20 }, { resource: ResourceType.WOOD, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 7 }] 
  },
  { 
    id: 'map_goblin_camp_wave_4', 
    enemies: [{ enemyId: 'GOBLIN', count: 4 }, { enemyId: 'EXPLODING_GOBLIN', count: 2 }], 
    reward: [{ resource: ResourceType.GOLD, amount: 30 }, { resource: ResourceType.LEATHER, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 10 }] 
  },
];

// Waves for Verdant Plains Lumber Mill Site
export const MAP_LMS_BATTLE_1_WAVES: WaveDefinition[] = [
  { id: 'map_lms_battle_1_wave_1', enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }], reward: [{ resource: ResourceType.WOOD, amount: 5 }] },
  { id: 'map_lms_battle_1_wave_2', enemies: [{ enemyId: 'DIRE_WOLF', count: 1 }, { enemyId: 'GIANT_SPIDER', count: 1 }], reward: [{ resource: ResourceType.WOOD, amount: 8 }] },
];
export const MAP_LMS_BATTLE_2_WAVES: WaveDefinition[] = [
  { id: 'map_lms_battle_2_wave_1', enemies: [{ enemyId: 'SKELETON_ARCHER', count: 2 }], reward: [{ resource: ResourceType.WOOD, amount: 7 }] },
  { id: 'map_lms_battle_2_wave_2', enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 1 }, { enemyId: 'GIANT_SPIDER', count: 2 }], reward: [{ resource: ResourceType.WOOD, amount: 10 }] },
  { id: 'map_lms_battle_2_wave_3', enemies: [{ enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 1 }], reward: [{ resource: ResourceType.WOOD, amount: 12 }] },
];
export const MAP_LMS_BATTLE_3_BLUEPRINT_WAVES: WaveDefinition[] = [
  { id: 'map_lms_battle_3_wave_1', enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2 }], reward: [{ resource: ResourceType.WOOD, amount: 10 }] },
  { id: 'map_lms_battle_3_wave_2', enemies: [{ enemyId: 'DIRE_WOLF', count: 1, isElite: true }, { enemyId: 'SKELETON_ARCHER', count: 2 }], reward: [{ resource: ResourceType.WOOD, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 3 }] },
  { id: 'map_lms_battle_3_wave_3', enemies: [{ enemyId: 'TREANT_SAPLING', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }], reward: [{ resource: ResourceType.WOOD, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 5 }] },
  { id: 'map_lms_battle_3_wave_4', enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 2, isElite: true }], reward: [{ resource: ResourceType.WOOD, amount: 25 }, { resource: ResourceType.GOLD, amount: 50 }, { resource: ResourceType.HEROIC_POINTS, amount: 10 }] },
];

// Waves for Verdant Plains Farmstead Ruins
export const MAP_FSR_BATTLE_1_WAVES: WaveDefinition[] = [
  { id: 'map_fsr_battle_1_wave_1', enemies: [{ enemyId: 'GOBLIN', count: 3 }], reward: [{ resource: ResourceType.FOOD, amount: 5 }] },
  { id: 'map_fsr_battle_1_wave_2', enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }, { enemyId: 'GOBLIN', count: 1 }], reward: [{ resource: ResourceType.FOOD, amount: 8 }] },
];
export const MAP_FSR_BATTLE_2_WAVES: WaveDefinition[] = [
  { id: 'map_fsr_battle_2_wave_1', enemies: [{ enemyId: 'BANDIT_MARKSMAN', count: 2 }], reward: [{ resource: ResourceType.FOOD, amount: 7 }] },
  { id: 'map_fsr_battle_2_wave_2', enemies: [{ enemyId: 'DIRE_WOLF', count: 1 }, { enemyId: 'GOBLIN', count: 3 }], reward: [{ resource: ResourceType.FOOD, amount: 10 }] },
  { id: 'map_fsr_battle_2_wave_3', enemies: [{ enemyId: 'BANDIT_MARKSMAN', count: 1, isElite: true }, { enemyId: 'GOBLIN', count: 2 }], reward: [{ resource: ResourceType.FOOD, amount: 12 }] },
];
export const MAP_FSR_BATTLE_3_BLUEPRINT_WAVES: WaveDefinition[] = [
  { id: 'map_fsr_battle_3_wave_1', enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.FOOD, amount: 10 }] },
  { id: 'map_fsr_battle_3_wave_2', enemies: [{ enemyId: 'SHIELDED_GOBLIN', count: 1 }, { enemyId: 'BANDIT_MARKSMAN', count: 2 }], reward: [{ resource: ResourceType.FOOD, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 3 }] },
  { id: 'map_fsr_battle_3_wave_3', enemies: [{ enemyId: 'DIRE_WOLF', count: 2, isElite: true }, { enemyId: 'ARMORED_GOBLIN', count: 1 }], reward: [{ resource: ResourceType.FOOD, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 5 }] },
  { id: 'map_fsr_battle_3_wave_4', enemies: [{ enemyId: 'ORC_BRUTE', count: 1, isElite: true }], reward: [{ resource: ResourceType.FOOD, amount: 25 }, { resource: ResourceType.GOLD, amount: 60 }, { resource: ResourceType.HEROIC_POINTS, amount: 10 }] },
];

// Waves for Gold Mine Depths
export const MAP_GMD_BATTLE_1_WAVES: WaveDefinition[] = [
    { id: 'map_gmd_battle_1_wave_1', enemies: [{ enemyId: 'GOBLIN', count: 4 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 2 }] },
    { id: 'map_gmd_battle_1_wave_2', enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 3 }] },
];
export const MAP_GMD_BATTLE_2_WAVES: WaveDefinition[] = [
    { id: 'map_gmd_battle_2_wave_1', enemies: [{ enemyId: 'EXPLODING_GOBLIN', count: 2 }, { enemyId: 'GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 3 }] },
    { id: 'map_gmd_battle_2_wave_2', enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 1, isElite: true }, { enemyId: 'GOBLIN', count: 3 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 4 }] },
    { id: 'map_gmd_battle_2_wave_3', enemies: [{ enemyId: 'SKELETON_MAGE', count: 1 }, { enemyId: 'ARMORED_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 5 }] },
];
export const MAP_GMD_BATTLE_3_BLUEPRINT_WAVES: WaveDefinition[] = [
    { id: 'map_gmd_battle_3_wave_1', enemies: [{ enemyId: 'IMP_WARLOCK', count: 2 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 4 }] },
    { id: 'map_gmd_battle_3_wave_2', enemies: [{ enemyId: 'SHIELDED_GOBLIN', count: 2, isElite: true }, { enemyId: 'EXPLODING_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 6 }, { resource: ResourceType.HEROIC_POINTS, amount: 4 }] },
    { id: 'map_gmd_battle_3_wave_3', enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 3, isElite: true }, { enemyId: 'IMP_WARLOCK', count: 1 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 8 }, { resource: ResourceType.HEROIC_POINTS, amount: 6 }] },
    { id: 'map_gmd_battle_3_wave_4', enemies: [{ enemyId: 'BOSS_GOBLIN_WARLORD', count: 1 }], reward: [{ resource: ResourceType.GOLD_ORE, amount: 10 }, { resource: ResourceType.GOLD, amount: 80 }, { resource: ResourceType.HEROIC_POINTS, amount: 12 }] },
];

// Waves for Stone Quarry Excavation
export const MAP_SQE_BATTLE_1_WAVES: WaveDefinition[] = [
    { id: 'map_sqe_battle_1_wave_1', enemies: [{ enemyId: 'STONE_GOLEM_MINION', count: 2 }], reward: [{ resource: ResourceType.STONE, amount: 8 }] },
    { id: 'map_sqe_battle_1_wave_2', enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 3 }], reward: [{ resource: ResourceType.STONE, amount: 12 }] },
];
export const MAP_SQE_BATTLE_2_WAVES: WaveDefinition[] = [
    { id: 'map_sqe_battle_2_wave_1', enemies: [{ enemyId: 'STONE_GOLEM_MINION', count: 1, isElite: true }, { enemyId: 'SKELETON_ARCHER', count: 2 }], reward: [{ resource: ResourceType.STONE, amount: 10 }] },
    { id: 'map_sqe_battle_2_wave_2', enemies: [{ enemyId: 'IRONCLAD_GOLEM', count: 1 }], reward: [{ resource: ResourceType.STONE, amount: 15 }] },
    { id: 'map_sqe_battle_2_wave_3', enemies: [{ enemyId: 'ARCANE_SENTRY', count: 1 }, { enemyId: 'STONE_GOLEM_MINION', count: 2 }], reward: [{ resource: ResourceType.STONE, amount: 18 }] },
];
export const MAP_SQE_BATTLE_3_BLUEPRINT_WAVES: WaveDefinition[] = [
    { id: 'map_sqe_battle_3_wave_1', enemies: [{ enemyId: 'IRONCLAD_GOLEM', count: 1, isElite: true }], reward: [{ resource: ResourceType.STONE, amount: 15 }] },
    { id: 'map_sqe_battle_3_wave_2', enemies: [{ enemyId: 'SKELETON_MAGE', count: 2 }, { enemyId: 'STONE_GOLEM_MINION', count: 2 }], reward: [{ resource: ResourceType.STONE, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 4 }] },
    { id: 'map_sqe_battle_3_wave_3', enemies: [{ enemyId: 'ARCANE_SENTRY', count: 2, isElite: true }, { enemyId: 'IRONCLAD_GOLEM', count: 1 }], reward: [{ resource: ResourceType.STONE, amount: 25 }, { resource: ResourceType.HEROIC_POINTS, amount: 6 }] },
    { id: 'map_sqe_battle_3_wave_4', enemies: [{ enemyId: 'BOSS_STONE_TITAN', count: 1, isElite: true }], reward: [{ resource: ResourceType.STONE, amount: 30 }, { resource: ResourceType.CRYSTALS, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }] },
];

// Waves for Tannery Outpost
export const MAP_TANNERY_BATTLE_1_WAVES: WaveDefinition[] = [
    { id: 'map_tannery_battle_1_wave_1', enemies: [{ enemyId: 'DIRE_WOLF', count: 3 }], reward: [{ resource: ResourceType.LEATHER, amount: 3 }] },
    { id: 'map_tannery_battle_1_wave_2', enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }], reward: [{ resource: ResourceType.LEATHER, amount: 4 }] },
];
export const MAP_TANNERY_BATTLE_2_WAVES: WaveDefinition[] = [
    { id: 'map_tannery_battle_2_wave_1', enemies: [{ enemyId: 'BANDIT_MARKSMAN', count: 2 }, { enemyId: 'GOBLIN', count: 2 }], reward: [{ resource: ResourceType.LEATHER, amount: 4 }] },
    { id: 'map_tannery_battle_2_wave_2', enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 1, isElite: true }, { enemyId: 'BANDIT_MARKSMAN', count: 2 }], reward: [{ resource: ResourceType.LEATHER, amount: 5 }] },
    { id: 'map_tannery_battle_2_wave_3', enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'BANDIT_MARKSMAN', count: 1, isElite: true }], reward: [{ resource: ResourceType.LEATHER, amount: 6 }] },
];
export const MAP_TANNERY_BATTLE_3_BLUEPRINT_WAVES: WaveDefinition[] = [
    { id: 'map_tannery_battle_3_wave_1', enemies: [{ enemyId: 'ORC_RAVAGER', count: 1 }], reward: [{ resource: ResourceType.LEATHER, amount: 5 }] },
    { id: 'map_tannery_battle_3_wave_2', enemies: [{ enemyId: 'DIRE_WOLF', count: 2, isElite: true }, { enemyId: 'ARMORED_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.LEATHER, amount: 7 }, { resource: ResourceType.HEROIC_POINTS, amount: 4 }] },
    { id: 'map_tannery_battle_3_wave_3', enemies: [{ enemyId: 'CORRUPTED_TREANT_MINIBOSS', count: 1 }, { enemyId: 'BANDIT_MARKSMAN', count: 1, isElite: true }], reward: [{ resource: ResourceType.LEATHER, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 6 }] },
    { id: 'map_tannery_battle_3_wave_4', enemies: [{ enemyId: 'BOSS_GOBLIN_WARLORD', count: 1, isElite: true }], reward: [{ resource: ResourceType.LEATHER, amount: 12 }, { resource: ResourceType.GOLD, amount: 70 }, { resource: ResourceType.HEROIC_POINTS, amount: 12 }] },
];


export const VERDANT_PLAINS_WAVES: WaveDefinition[] = [
    ...MAP_GOBLIN_CAMP_WAVES,
    ...MAP_LMS_BATTLE_1_WAVES, ...MAP_LMS_BATTLE_2_WAVES, ...MAP_LMS_BATTLE_3_BLUEPRINT_WAVES,
    ...MAP_FSR_BATTLE_1_WAVES, ...MAP_FSR_BATTLE_2_WAVES, ...MAP_FSR_BATTLE_3_BLUEPRINT_WAVES,
    ...MAP_GMD_BATTLE_1_WAVES, ...MAP_GMD_BATTLE_2_WAVES, ...MAP_GMD_BATTLE_3_BLUEPRINT_WAVES,
    ...MAP_SQE_BATTLE_1_WAVES, ...MAP_SQE_BATTLE_2_WAVES, ...MAP_SQE_BATTLE_3_BLUEPRINT_WAVES,
    ...MAP_TANNERY_BATTLE_1_WAVES, ...MAP_TANNERY_BATTLE_2_WAVES, ...MAP_TANNERY_BATTLE_3_BLUEPRINT_WAVES,
];
