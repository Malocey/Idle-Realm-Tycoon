import { ResourceType, EnemyDefinition } from '../../types';

export const DIRE_WOLF_DEFINITION: EnemyDefinition = {
  id: 'DIRE_WOLF',
  name: 'Dire Wolf',
  stats: { maxHp: 65, damage: 18, defense: 1, attackSpeed: 1.1, critChance: 0.12, critDamage: 1.6 },
  loot: [{ resource: ResourceType.GOLD, amount: 25 }, { resource: ResourceType.FOOD, amount: 3 }, { resource: ResourceType.LEATHER, amount: 1 }],
  iconName: 'ENEMY',
  expReward: 35
};
