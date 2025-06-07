import { ResourceType, EnemyDefinition } from '../../types';

export const GOBLIN_DEFINITION: EnemyDefinition = {
  id: 'GOBLIN',
  name: 'Goblin',
  stats: { maxHp: 30, damage: 5, defense: 1, attackSpeed: 0.8, critChance: 0.02, critDamage: 1.2 },
  loot: [{ resource: ResourceType.GOLD, amount: 5 }],
  iconName: 'ENEMY',
  expReward: 10
};
