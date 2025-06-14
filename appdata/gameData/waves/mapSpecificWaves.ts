
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
  { 
    id: 'map_lumber_mill_blueprint_wave_1',
    enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 1 }],
    reward: [{ resource: ResourceType.WOOD, amount: 15 }, { resource: ResourceType.GOLD, amount: 25 }, { resource: ResourceType.HEROIC_POINTS, amount: 6 }]
  },
  {
    id: 'map_lumber_mill_blueprint_wave_2',
    enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 3 }, { enemyId: 'SKELETON_ARCHER', count: 2 }],
    reward: [{ resource: ResourceType.WOOD, amount: 20 }, { resource: ResourceType.GOLD, amount: 30 }, { resource: ResourceType.HEROIC_POINTS, amount: 8 }]
  },
  {
    id: 'map_farm_blueprint_wave_1',
    enemies: [{ enemyId: 'GOBLIN', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }],
    reward: [{ resource: ResourceType.FOOD, amount: 10 }, { resource: ResourceType.GOLD, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 5 }]
  },
  {
    id: 'map_farm_blueprint_wave_2',
    enemies: [{ enemyId: 'GOBLIN', count: 3 }, { enemyId: 'DIRE_WOLF', count: 2 }],
    reward: [{ resource: ResourceType.FOOD, amount: 15 }, { resource: ResourceType.GOLD, amount: 25 }, { resource: ResourceType.HEROIC_POINTS, amount: 7 }]
  },
  {
    id: 'map_gold_mine_ambush_wave_1',
    enemies: [{ enemyId: 'GOBLIN', count: 3 }, { enemyId: 'EXPLODING_GOBLIN', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 40 }, { resource: ResourceType.STONE, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 8 }]
  },
  {
    id: 'map_gold_mine_ambush_wave_2',
    enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 2 }, { enemyId: 'GOBLIN', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 55 }, { resource: ResourceType.IRON, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 10 }]
  },
  {
    id: 'map_stone_quarry_golem_wave_1',
    enemies: [{ enemyId: 'STONE_GOLEM_MINION', count: 2 }], 
    reward: [{ resource: ResourceType.STONE, amount: 30 }, { resource: ResourceType.CRYSTALS, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 7 }]
  },
  {
    id: 'map_stone_quarry_golem_wave_2',
    enemies: [{ enemyId: 'STONE_GOLEM_MINION', count: 3 }, { enemyId: 'IRONCLAD_GOLEM', count: 1, isElite: true }], 
    reward: [{ resource: ResourceType.STONE, amount: 50 }, { resource: ResourceType.IRON, amount: 5 }, { resource: ResourceType.CRYSTALS, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }]
  },
  // --- Start of Whispering Woods Path Edge Waves ---
  { // Waves for the first battle node on the edge path (ww_edge_battle_1)
    id: 'map_ww_edge_battle_1_wave_1', // Re-using ID for simplicity but conceptually first edge battle
    enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }, { enemyId: 'SHADOW_CREEPER', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 30 }, { resource: ResourceType.LEATHER, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 6 }]
  },
  {
    id: 'map_ww_edge_battle_1_wave_2',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 40 }, { resource: ResourceType.CRYSTALS, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 8 }]
  },
  { // Waves for the second battle node on the edge path (ww_edge_battle_2)
    id: 'map_ww_edge_battle_2_wave_1',
    enemies: [{ enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 45 }, { resource: ResourceType.WOOD, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 9 }]
  },
  {
    id: 'map_ww_edge_battle_2_wave_2',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 2, isElite: true }, { enemyId: 'GIANT_SPIDER', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 55 }, { resource: ResourceType.LEATHER, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 11 }]
  },
  // --- End of Whispering Woods Path Edge Waves ---

  // --- Start of Whispering Woods Depths Waves ---
  { // Waves for the first battle node in the depths (ww_depths_battle_1_actual)
    id: 'map_ww_depths_path_turned_battle_wave_1',
    enemies: [{ enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'SHADOW_CREEPER', count: 2, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 50 }, { resource: ResourceType.WOOD, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 10 }]
  },
  {
    id: 'map_ww_depths_path_turned_battle_wave_2',
    enemies: [{ enemyId: 'TREANT_SAPLING', count: 1 }, { enemyId: 'SHADOW_CREEPER', count: 1 }],
    reward: [{ resource: ResourceType.GOLD, amount: 60 }, { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 12 }]
  },
  { // Waves for Cleric Rescue Battle (ww_cleric_rescue_battle_node) - These already exist, just ensuring they are here.
    id: 'map_ww_cleric_rescue_wave_1',
    enemies: [{ enemyId: 'SHADOW_CREEPER', count: 3 }, { enemyId: 'DIRE_WOLF', count: 1, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 70 }, { resource: ResourceType.HEROIC_POINTS, amount: 14 }]
  },
  {
    id: 'map_ww_cleric_rescue_wave_2',
    enemies: [{ enemyId: 'CORRUPTED_TREANT_MINIBOSS', count: 1 }, { enemyId: 'SHADOW_CREEPER', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 100 }, { resource: ResourceType.CRYSTALS, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }]
  },
  { // Waves for the second (new) battle node in the depths (ww_depths_battle_2_actual)
    id: 'map_ww_depths_final_battle_wave_1',
    enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2, isElite: true }, { enemyId: 'SHADOW_CREEPER', count: 2 }],
    reward: [{ resource: ResourceType.GOLD, amount: 75 }, { resource: ResourceType.IRON, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }]
  },
  {
    id: 'map_ww_depths_final_battle_wave_2',
    enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 1, isElite: true }],
    reward: [{ resource: ResourceType.GOLD, amount: 85 }, { resource: ResourceType.WOOD, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 18 }]
  },
  // --- End of Whispering Woods Depths Waves ---
  
  // Bauplan-Wellen
  { id: 'map_gold_mine_blueprint_wave_1', enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 75 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }] },
  { id: 'map_gold_mine_blueprint_wave_2', enemies: [{ enemyId: 'SKELETON_MAGE', count: 1 }, { enemyId: 'ARMORED_GOBLIN', count: 2, isElite: true }], reward: [{ resource: ResourceType.GOLD, amount: 100 }, { resource: ResourceType.CRYSTALS, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }] },
  { id: 'map_stone_quarry_blueprint_wave_1', enemies: [{ enemyId: 'STONE_GOLEM_MINION', count: 3 }], reward: [{ resource: ResourceType.STONE, amount: 60 }, { resource: ResourceType.HEROIC_POINTS, amount: 15 }] },
  { id: 'map_stone_quarry_blueprint_wave_2', enemies: [{ enemyId: 'IRONCLAD_GOLEM', count: 1 }, { enemyId: 'STONE_GOLEM_MINION', count: 2 }], reward: [{ resource: ResourceType.STONE, amount: 80 }, { resource: ResourceType.IRON, amount: 8 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }] },
  { id: 'map_tannery_blueprint_wave_1', enemies: [{ enemyId: 'DIRE_WOLF', count: 3 }], reward: [{ resource: ResourceType.LEATHER, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 18 }] },
  { id: 'map_tannery_blueprint_wave_2', enemies: [{ enemyId: 'GIANT_SPIDER', count: 2, isElite: true }, { enemyId: 'DIRE_WOLF', count: 2 }], reward: [{ resource: ResourceType.LEATHER, amount: 8 }, { resource: ResourceType.HEROIC_POINTS, amount: 22 }] },
  { id: 'map_tannery_blueprint_wave_3', enemies: [{ enemyId: 'CORRUPTED_TREANT_MINIBOSS', count: 1 }], reward: [{ resource: ResourceType.LEATHER, amount: 12 }, { resource: ResourceType.WOOD, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 30 }] },
  // Korrumpierter Schrein Wellen
  { id: 'map_corrupted_shrine_wave_1', enemies: [{ enemyId: 'SHADOW_CREEPER', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 80 }, { resource: ResourceType.HEROIC_POINTS, amount: 16 }] },
  { id: 'map_corrupted_shrine_wave_2', enemies: [{ enemyId: 'IMP_WARLOCK', count: 2 }, { enemyId: 'SHADOW_CREEPER', count: 2 }], reward: [{ resource: ResourceType.CRYSTALS, amount: 8 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }] },
  { id: 'map_corrupted_shrine_wave_3', enemies: [{ enemyId: 'BOSS_DEMON_LORD', count: 1, isElite: true }], reward: [{ resource: ResourceType.AETHERIUM, amount: 1 }, { resource: ResourceType.DEMONIC_COIN, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 50 }] },
];
