import { ResourceType, EnemyDefinition } from '../../types';

export const SKELETON_ARCHER_DEFINITION: EnemyDefinition = {
  id: 'SKELETON_ARCHER',
  name: 'Skeleton Archer',
  stats: { maxHp: 40, damage: 8, defense: 0, attackSpeed: 1.2, critChance: 0.08, critDamage: 1.4 },
  loot: [{ resource: ResourceType.GOLD, amount: 10 }, { resource: ResourceType.WOOD, amount: 1 }],
  iconName: 'ENEMY',
  expReward: 15,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 160,
};
