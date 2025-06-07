import { ResourceType, EnemyDefinition } from '../../types';

export const SKELETON_WARRIOR_DEFINITION: EnemyDefinition = {
  id: 'SKELETON_WARRIOR',
  name: 'Skeleton Warrior',
  stats: { maxHp: 80, damage: 12, defense: 6, attackSpeed: 0.6, critChance: 0.03, critDamage: 1.3 },
  loot: [{ resource: ResourceType.GOLD, amount: 15 }, { resource: ResourceType.IRON, amount: 1 }],
  iconName: 'ENEMY',
  expReward: 25
};
