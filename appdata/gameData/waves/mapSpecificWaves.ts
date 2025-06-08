
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
    id: 'map_lumber_mill_wave_1',
    enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 1 }],
    reward: [{ resource: ResourceType.WOOD, amount: 15 }, { resource: ResourceType.GOLD, amount: 25 }]
  },
  {
    id: 'map_lumber_mill_wave_2',
    enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 3 }, { enemyId: 'SKELETON_ARCHER', count: 2 }],
    reward: [{ resource: ResourceType.WOOD, amount: 20 }, { resource: ResourceType.GOLD, amount: 30 }]
  },
  {
    id: 'map_lumber_mill_wave_3',
    enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'SKELETON_ARCHER', count: 2 }],
    reward: [{ resource: ResourceType.WOOD, amount: 25 }, { resource: ResourceType.GOLD, amount: 40 }, { resource: ResourceType.IRON, amount: 2 }]
  },
  {
    id: 'map_lumber_mill_wave_4',
    enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'BANDIT_MARKSMAN', count: 1 }],
    reward: [{ resource: ResourceType.WOOD, amount: 30 }, { resource: ResourceType.GOLD, amount: 50 }, { resource: ResourceType.IRON, amount: 3 }]
  },
  // Waves for "Protectors of the Fertile Land" (Farm Battle)
  {
    id: 'map_farm_battle_wave_1',
    enemies: [{ enemyId: 'GOBLIN', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }],
    reward: [{ resource: ResourceType.FOOD, amount: 10 }, { resource: ResourceType.GOLD, amount: 20 }]
  },
  {
    id: 'map_farm_battle_wave_2',
    enemies: [{ enemyId: 'GOBLIN', count: 3 }, { enemyId: 'DIRE_WOLF', count: 2 }],
    reward: [{ resource: ResourceType.FOOD, amount: 15 }, { resource: ResourceType.GOLD, amount: 25 }]
  },
  {
    id: 'map_farm_battle_wave_3',
    enemies: [{ enemyId: 'GOBLIN_SHAMAN', count: 1 }, { enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'GOBLIN', count: 1 }],
    reward: [{ resource: ResourceType.FOOD, amount: 20 }, { resource: ResourceType.GOLD, amount: 35 }, { resource: ResourceType.LEATHER, amount: 2 }]
  },
];
