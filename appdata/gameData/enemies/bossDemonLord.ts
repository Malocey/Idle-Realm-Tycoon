import { ResourceType, EnemyDefinition } from '../../types';

export const BOSS_DEMON_LORD_DEFINITION: EnemyDefinition = {
  id: 'BOSS_DEMON_LORD',
  name: 'Demon Lord',
  stats: { maxHp: 15000, damage: 75, defense: 40, attackSpeed: 0.6, critChance: 0.1, critDamage: 1.7 },
  loot: [
    { resource: ResourceType.GOLD, amount: 5000 },
    { resource: ResourceType.AETHERIUM, amount: 1 },
    { resource: ResourceType.CRYSTALS, amount: 100 },
    { resource: ResourceType.META_CURRENCY, amount: 3 },
    { resource: ResourceType.HEROIC_POINTS, amount: 2000 }
  ],
  iconName: 'ENEMY',
  expReward: 3000,
};
