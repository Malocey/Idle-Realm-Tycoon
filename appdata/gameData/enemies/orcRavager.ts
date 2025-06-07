import { ResourceType, EnemyDefinition } from '../../types';

export const ORC_RAVAGER_DEFINITION: EnemyDefinition = {
  id: 'ORC_RAVAGER',
  name: 'Orc Ravager',
  stats: { maxHp: 200, damage: 20, defense: 5, attackSpeed: 0.6, critChance: 0.06, critDamage: 1.4 },
  loot: [{ resource: ResourceType.GOLD, amount: 50 }, { resource: ResourceType.IRON, amount: 3 }],
  iconName: 'ENEMY',
  expReward: 75,
  aoeAttackChance: 0.25,
  aoeDamageFactor: 0.6,
  aoeAttackCooldownBaseMs: 12000,
};
