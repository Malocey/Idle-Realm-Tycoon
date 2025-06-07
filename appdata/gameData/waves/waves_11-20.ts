
import { ResourceType, WaveDefinition } from '../../types';

export const WAVES_11_20: WaveDefinition[] = [
  { waveNumber: 11, enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'TREANT_SAPLING', count: 1 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 350 }, { resource: ResourceType.IRON, amount: 5 }, { resource: ResourceType.CRYSTALS, amount: 5 }, { resource: ResourceType.HEROIC_POINTS, amount: 80 }] },
  { waveNumber: 12, enemies: [{ enemyId: 'SKELETON_MAGE', count: 1 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 1 }, { enemyId: 'ARMORED_GOBLIN', count: 1}, { enemyId: 'BANDIT_MARKSMAN', count: 1 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 400 }, { resource: ResourceType.HEROIC_POINTS, amount: 90 }] },
  { waveNumber: 13, enemies: [{ enemyId: 'SKELETON_ARCHER', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, {enemyId: 'GIANT_SPIDER', count: 3}, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 450 }, { resource: ResourceType.WOOD, amount: 20 }, { resource: ResourceType.STONE, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 100 }] },
  { waveNumber: 14, enemies: [{ enemyId: 'ORC_BRUTE', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }, { enemyId: 'IMP_WARLOCK', count: 1 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 500 }, { resource: ResourceType.IRON, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 120 }] },
  { waveNumber: 15, enemies: [{ enemyId: 'GOBLIN', count: 4 }, { enemyId: 'SKELETON_ARCHER', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 1}, { enemyId: 'ARCANE_SENTRY', count: 1 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 2 }], reward: [{ resource: ResourceType.GOLD, amount: 550 }, { resource: ResourceType.CRYSTALS, amount: 10 }, { resource: ResourceType.META_CURRENCY, amount: 1 }, { resource: ResourceType.HEROIC_POINTS, amount: 150 }, { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 1}] },
  { waveNumber: 16, enemies: [{ enemyId: 'ORC_BRUTE', count: 2 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'DIRE_WOLF', count: 1 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 1 }, { enemyId: 'ARCANE_RESTORER', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 600 }, { resource: ResourceType.IRON, amount: 7 }, { resource: ResourceType.CRYSTALS, amount: 7 }, { resource: ResourceType.HEROIC_POINTS, amount: 160 }] },
  { waveNumber: 17, enemies: [{ enemyId: 'GIANT_SPIDER', count: 6 }, { enemyId: 'ORC_BRUTE', count: 2 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 2 }, { enemyId: 'ARCANE_RESTORER', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 650 }, { resource: ResourceType.LEATHER, amount: 10 }, { resource: ResourceType.HEROIC_POINTS, amount: 170 }] },
  { waveNumber: 18, enemies: [{ enemyId: 'DIRE_WOLF', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }, { enemyId: 'ARCANE_RESTORER', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 700 }, { resource: ResourceType.IRON, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 200 }, { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 1}] },
  { waveNumber: 19, enemies: [{ enemyId: 'SKELETON_ARCHER', count: 4 }, { enemyId: 'ORC_BRUTE', count: 2 }, { enemyId: 'GIANT_SPIDER', count: 3 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 1 }, { enemyId: 'ARCANE_RESTORER', count: 1 }], reward: [{ resource: ResourceType.GOLD, amount: 750 }, { resource: ResourceType.CRYSTALS, amount: 15 }, { resource: ResourceType.HEROIC_POINTS, amount: 220 }] },
  { 
    waveNumber: 20, 
    enemies: [{ enemyId: 'BOSS_GOBLIN_OVERLORD', count: 1 }, { enemyId: 'ARCANE_RESTORER', count: 1 }, { enemyId: 'SHIELD_MENDER_GOBLIN', count: 1 }], 
    reward: [
      { resource: ResourceType.GOLD, amount: 1000 }, 
      { resource: ResourceType.META_CURRENCY, amount: 2 }, 
      { resource: ResourceType.HEROIC_POINTS, amount: 400 },
      { resource: ResourceType.IRON, amount: 25 }, 
      { resource: ResourceType.CRYSTALS, amount: 20 }, 
      { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 2}
    ] 
  },
];
