
import { ResourceType, WaveDefinition } from '../../types';

export const WAVES_21_30: WaveDefinition[] = [
  { id: 'wave_21', waveNumber: 21, enemies: [{ enemyId: 'ORC_BRUTE', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'SKELETON_MAGE', count: 1 }, { enemyId: 'TREANT_SAPLING', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 850 }, { resource: ResourceType.IRON, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 280 }] }, 
  { id: 'wave_22', waveNumber: 22, enemies: [{ enemyId: 'SKELETON_ARCHER', count: 5 }, { enemyId: 'GIANT_SPIDER', count: 4 }, { enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 900 }, { resource: ResourceType.CRYSTALS, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 300 }, { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 2}] },
  { id: 'wave_23', waveNumber: 23, enemies: [{ enemyId: 'GOBLIN', count: 8 }, { enemyId: 'ORC_BRUTE', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 950 }, { resource: ResourceType.LEATHER, amount: 15 }, { resource: ResourceType.WOOD, amount: 30 }, { resource: ResourceType.HEROIC_POINTS, amount: 330 }] },
  { id: 'wave_24', waveNumber: 24, enemies: [{ enemyId: 'ORC_BRUTE', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 3 }, { enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 1000 }, { resource: ResourceType.IRON, amount: 25 }, { resource: ResourceType.CRYSTALS, amount: 25 }, { resource: ResourceType.HEROIC_POINTS, amount: 360 }, { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 3}] },
  { id: 'wave_25', waveNumber: 25, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 1 }, { enemyId: 'SKELETON_ARCHER', count: 2 }, { enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'SKELETON_MAGE', count: 1 }, { enemyId: 'TREANT_SAPLING', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 1500 }, { resource: ResourceType.META_CURRENCY, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 500 }, { resource: ResourceType.IRON, amount: 50 }, { resource: ResourceType.CRYSTALS, amount: 50 }, { resource: ResourceType.LEATHER, amount: 20 }, { resource: ResourceType.CATACOMB_KEY, amount: 1 }] }, 
  { id: 'wave_26', waveNumber: 26, enemies: [{ enemyId: 'ORC_RAVAGER', count: 2 }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }, { enemyId: 'ORC_BRUTE', count: 2 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 1600 }, { resource: ResourceType.HEROIC_POINTS, amount: 550 }] },
  { id: 'wave_27', waveNumber: 27, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 4 }, { enemyId: 'TREANT_SAPLING', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 1700 }, { resource: ResourceType.CRYSTALS, amount: 40 }, { resource: ResourceType.HEROIC_POINTS, amount: 600 }] },
  { id: 'wave_28', waveNumber: 28, enemies: [{ enemyId: 'DIRE_WOLF', count: 3 }, { enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'SKELETON_MAGE', count: 2 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 1800 }, { resource: ResourceType.IRON, amount: 30 }, { resource: ResourceType.HEROIC_POINTS, amount: 650 }] }, 
  { id: 'wave_29', waveNumber: 29, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 1 }, { enemyId: 'ORC_RAVAGER', count: 2 }, { enemyId: 'SKELETON_WARRIOR', count: 3 }, { enemyId: 'TREANT_SAPLING', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 1900 }, { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 700 }] },
  {
    id: 'wave_30',
    waveNumber: 30,
    enemies: [{ enemyId: 'BOSS_STONE_TITAN', count: 1 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 2 }],
    reward: [
      { resource: ResourceType.GOLD, amount: 3000 },
      { resource: ResourceType.STONE, amount: 150 },
      { resource: ResourceType.CRYSTALS, amount: 75 },
      { resource: ResourceType.META_CURRENCY, amount: 3 },
      { resource: ResourceType.HEROIC_POINTS, amount: 1200 }
    ]
  },
];
