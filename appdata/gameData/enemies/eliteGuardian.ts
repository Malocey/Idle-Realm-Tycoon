import { ResourceType, EnemyDefinition } from '../../types';

export const ELITE_GUARDIAN_DEFINITION: EnemyDefinition = {
  id: 'ELITE_GUARDIAN',
  name: 'Elite Guardian',
  stats: { maxHp: 1200, damage: 35, defense: 15, attackSpeed: 0.7, critChance: 0.1, critDamage: 1.6 },
  loot: [
    { resource: ResourceType.GOLD, amount: 500 },
    { resource: ResourceType.IRON, amount: 25 },
    { resource: ResourceType.CRYSTALS, amount: 15 },
    { resource: ResourceType.HEROIC_POINTS, amount: 150 }
  ],
  iconName: 'ENEMY',
  expReward: 350,
};
