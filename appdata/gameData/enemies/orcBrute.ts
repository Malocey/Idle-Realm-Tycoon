
import { ResourceType, EnemyDefinition } from '../../types';

export const ORC_BRUTE_DEFINITION: EnemyDefinition = {
  id: 'ORC_BRUTE',
  name: 'Orc Brute',
  stats: { maxHp: 100, damage: 15, defense: 3, attackSpeed: 0.5, critChance: 0.05, critDamage: 1.3 },
  loot: [{ resource: ResourceType.GOLD, amount: 20 }, { resource: ResourceType.STONE, amount: 2 }, { resource: ResourceType.IRON, amount: 2 }],
  iconName: 'ENEMY',
  expReward: 40,
  dungeonTierScale: { hpFactor: 1.1, damageFactor: 1.1 }
};
