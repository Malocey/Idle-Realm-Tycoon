import { ResourceType, WaveDefinition } from '../../types';

export const WAVES_01_10: WaveDefinition[] = [
  { waveNumber: 1, enemies: [{ enemyId: 'GOBLIN', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 20 }, { resource: ResourceType.HEROIC_POINTS, amount: 5 }] },
  { waveNumber: 2, enemies: [{ enemyId: 'GOBLIN', count: 5 }], reward: [{ resource: ResourceType.GOLD, amount: 30 }, { resource: ResourceType.HEROIC_POINTS, amount: 8 }] },
  { waveNumber: 3, enemies: [{ enemyId: 'GOBLIN', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 50 }, { resource: ResourceType.WOOD, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 12 }] },
  { waveNumber: 4, enemies: [{ enemyId: 'SKELETON_ARCHER', count: 3 }, { enemyId: 'GIANT_SPIDER', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 70 }, { resource: ResourceType.LEATHER, amount: 3}, { resource: ResourceType.HEROIC_POINTS, amount: 15 }] },
  { waveNumber: 5, enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'SHIELDED_GOBLIN', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 100 }, { resource: ResourceType.IRON, amount: 3 }, { resource: ResourceType.CRYSTALS, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 25 }] },
  { waveNumber: 6, enemies: [{ enemyId: 'ARMORED_GOBLIN', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }, { enemyId: 'SHIELDED_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 120 }, {resource: ResourceType.IRON, amount: 2}, { resource: ResourceType.CRYSTALS, amount: 2 }, { resource: ResourceType.HEROIC_POINTS, amount: 20 }] },
  { waveNumber: 7, enemies: [{ enemyId: 'DIRE_WOLF', count: 1 }, { enemyId: 'SKELETON_ARCHER', count: 1 }, { enemyId: 'ARCANE_SENTRY', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 150 }, {resource: ResourceType.CRYSTALS, amount: 3}, {resource: ResourceType.FOOD, amount: 5}, { resource: ResourceType.STONE, amount: 3 }, { resource: ResourceType.HEROIC_POINTS, amount: 28 }] },
  { waveNumber: 8, enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'ARCANE_SENTRY', count: 1 }, { enemyId: 'BANDIT_MARKSMAN', count: 1 }, { enemyId: 'SHIELDED_GOBLIN', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 200 }, { resource: ResourceType.IRON, amount: 5 }, { resource: ResourceType.CRYSTALS, amount: 4 }, { resource: ResourceType.HEROIC_POINTS, amount: 50 }] },
  { waveNumber: 9, enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }, { enemyId: 'IMP_WARLOCK', count: 1 }, { enemyId: 'SHIELDED_GOBLIN', count: 1 }, { enemyId: 'ARCANE_SENTRY', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 250 }, { resource: ResourceType.CRYSTALS, amount: 5 }, { resource: ResourceType.STONE, amount: 4 }, { resource: ResourceType.HEROIC_POINTS, amount: 35 }] },
  {
    waveNumber: 10,
    enemies: [{ enemyId: 'BOSS_GOBLIN_WARLORD', count: 1 }],
    reward: [
      { resource: ResourceType.GOLD, amount: 400 },
      { resource: ResourceType.META_CURRENCY, amount: 1 },
      { resource: ResourceType.IRON, amount: 10 },
      { resource: ResourceType.CRYSTALS, amount: 5 },
      { resource: ResourceType.HEROIC_POINTS, amount: 150 }
    ]
  },
];
