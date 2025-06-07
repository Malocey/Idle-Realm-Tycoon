import { ResourceType, EnemyDefinition } from '../../types';

export const CORPSEBLOOM_SPROUT_DEFINITION: EnemyDefinition = {
  id: 'CORPSEBLOOM_SPROUT',
  name: 'Corpsebloom Sprout',
  stats: { maxHp: 60, damage: 18, defense: 1, attackSpeed: 0.9, critChance: 0.04, critDamage: 1.3 },
  loot: [{ resource: ResourceType.FOOD, amount: 2 }, { resource: ResourceType.HERB_BLOODTHISTLE, amount: 1 }],
  iconName: 'FOOD',
  expReward: 45,
};
