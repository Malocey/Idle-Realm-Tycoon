
import { ResourceType, EnemyDefinition } from '../../types';

export const STONE_GOLEM_MINION_DEFINITION: EnemyDefinition = {
  id: 'STONE_GOLEM_MINION',
  name: 'Stone Golem Minion',
  stats: { 
    maxHp: 120, 
    damage: 12, 
    defense: 10, 
    attackSpeed: 0.7, 
    critChance: 0.03, 
    critDamage: 1.3 
  },
  loot: [
    { resource: ResourceType.STONE, amount: 10 },
    { resource: ResourceType.GOLD, amount: 15 },
  ],
  iconName: 'STONE', // Or a more specific golem icon if available
  expReward: 30,
  attackType: 'MELEE',
};
