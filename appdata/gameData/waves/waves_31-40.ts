
import { ResourceType, WaveDefinition } from '../../types';

export const WAVES_31_40: WaveDefinition[] = [
  { id: 'wave_31', waveNumber: 31, enemies: [{ enemyId: 'ORC_RAVAGER', count: 2 }, { enemyId: 'CRYSTAL_GOLEM', count: 1 }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 2200 }, { resource: ResourceType.HEROIC_POINTS, amount: 800 }] },
  { id: 'wave_32', waveNumber: 32, enemies: [{ enemyId: 'DIRE_WOLF', count: 4 }, { enemyId: 'ORC_BRUTE', count: 3 }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 2400 }, { resource: ResourceType.HEROIC_POINTS, amount: 850 }] },
  { id: 'wave_33', waveNumber: 33, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 2 }, { enemyId: 'SKELETON_WARRIOR', count: 4 }, { enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'TREANT_SAPLING', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 2600 }, { resource: ResourceType.HEROIC_POINTS, amount: 900 }] },
  { id: 'wave_34', waveNumber: 34, enemies: [{ enemyId: 'ORC_RAVAGER', count: 3 }, { enemyId: 'GOBLIN_SHAMAN', count: 3 }, { enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 3 }], reward: [{ resource: ResourceType.GOLD, amount: 2800 }, { resource: ResourceType.HEROIC_POINTS, amount: 950 }] },
  {
    id: 'wave_35',
    waveNumber: 35,
    enemies: [{ enemyId: 'BOSS_GOBLIN_OVERLORD', count: 1 }, { enemyId: 'ORC_RAVAGER', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 2 }],
    reward: [
      { resource: ResourceType.GOLD, amount: 3500 },
      { resource: ResourceType.META_CURRENCY, amount: 4 },
      { resource: ResourceType.HEROIC_POINTS, amount: 1500 },
      { resource: ResourceType.CATACOMB_KEY, amount: 2 }
    ]
  },
  { id: 'wave_36', waveNumber: 36, enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 3 }, { enemyId: 'ORC_RAVAGER', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 3200 }, { resource: ResourceType.HEROIC_POINTS, amount: 1100 }] },
  { id: 'wave_37', waveNumber: 37, enemies: [{ enemyId: 'DIRE_WOLF', count: 5 }, { enemyId: 'GOBLIN_SHAMAN', count: 4 }], reward: [{ resource: ResourceType.GOLD, amount: 3400 }, { resource: ResourceType.HEROIC_POINTS, amount: 1150 }] },
  { id: 'wave_38', waveNumber: 38, enemies: [{ enemyId: 'ORC_BRUTE', count: 4 }, { enemyId: 'ORC_RAVAGER', count: 2 }, { enemyId: 'CRYSTAL_GOLEM', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 3600 }, { resource: ResourceType.HEROIC_POINTS, amount: 1200 }] },
  { id: 'wave_39', waveNumber: 39, enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 5 }, { enemyId: 'GOBLIN_SHAMAN', count: 3 }, { enemyId: 'ORC_RAVAGER', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 3800 }, { resource: ResourceType.HEROIC_POINTS, amount: 1250 }] },
  {
    id: 'wave_40',
    waveNumber: 40,
    enemies: [{ enemyId: 'BOSS_DEMON_LORD', count: 1 }],
    reward: [
      { resource: ResourceType.GOLD, amount: 6000 },
      { resource: ResourceType.AETHERIUM, amount: 2 },
      { resource: ResourceType.CRYSTALS, amount: 150 },
      { resource: ResourceType.META_CURRENCY, amount: 5 },
      { resource: ResourceType.HEROIC_POINTS, amount: 3000 }
    ]
  },
];
