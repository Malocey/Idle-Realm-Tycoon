
import { ResourceType, WaveDefinition } from '../../types';

export const WAVES_41_50: WaveDefinition[] = [
  { waveNumber: 41, enemies: [{ enemyId: 'ORC_RAVAGER', count: 4 }, { enemyId: 'GOBLIN_SHAMAN', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 4500 }, { resource: ResourceType.HEROIC_POINTS, amount: 1500 }] },
  { waveNumber: 42, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 2 }, { enemyId: 'DIRE_WOLF', count: 4 }], reward: [{ resource: ResourceType.GOLD, amount: 4700 }, { resource: ResourceType.HEROIC_POINTS, amount: 1550 }] },
  { waveNumber: 43, enemies: [{ enemyId: 'ORC_BRUTE', count: 3 }, { enemyId: 'ORC_RAVAGER', count: 3 }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 4900 }, { resource: ResourceType.HEROIC_POINTS, amount: 1600 }] },
  { waveNumber: 44, enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 4 }, { enemyId: 'CRYSTAL_GOLEM', count: 2 }, { enemyId: 'GOBLIN_SHAMAN', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 5100 }, { resource: ResourceType.HEROIC_POINTS, amount: 1650 }] },
  {
    waveNumber: 45,
    enemies: [{ enemyId: 'BOSS_STONE_TITAN', count: 1 }, { enemyId: 'CRYSTAL_GOLEM', count: 2 }],
    reward: [
      { resource: ResourceType.GOLD, amount: 7000 },
      { resource: ResourceType.META_CURRENCY, amount: 4 },
      { resource: ResourceType.HEROIC_POINTS, amount: 2500 }
    ]
  },
  { waveNumber: 46, enemies: [{ enemyId: 'DIRE_WOLF', count: 6 }, { enemyId: 'ORC_RAVAGER', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 5500 }, { resource: ResourceType.HEROIC_POINTS, amount: 1800 }] },
  { waveNumber: 47, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 3 }, { enemyId: 'GOBLIN_SHAMAN', count: 4 }], reward: [{ resource: ResourceType.GOLD, amount: 5700 }, { resource: ResourceType.HEROIC_POINTS, amount: 1850 }] },
  { waveNumber: 48, enemies: [{ enemyId: 'ORC_RAVAGER', count: 4 }, { enemyId: 'SKELETON_WARRIOR', count: 4 }, { enemyId: 'DIRE_WOLF', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 5900 }, { resource: ResourceType.HEROIC_POINTS, amount: 1900 }] },
  { waveNumber: 49, enemies: [{ enemyId: 'BOSS_GOBLIN_OVERLORD', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 6500 }, { resource: ResourceType.HEROIC_POINTS, amount: 2200 }] },
  {
    waveNumber: 50,
    enemies: [{ enemyId: 'BOSS_DEMON_LORD', count: 1 }, { enemyId: 'ORC_RAVAGER', count: 3 }],
    reward: [
      { resource: ResourceType.GOLD, amount: 10000 },
      { resource: ResourceType.AETHERIUM, amount: 5 },
      { resource: ResourceType.META_CURRENCY, amount: 10 },
      { resource: ResourceType.HEROIC_POINTS, amount: 5000 }
    ]
  }
];
