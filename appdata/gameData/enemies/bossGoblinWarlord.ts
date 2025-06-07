import { ResourceType, EnemyDefinition } from '../../types';

export const BOSS_GOBLIN_WARLORD_DEFINITION: EnemyDefinition = {
  id: 'BOSS_GOBLIN_WARLORD',
  name: 'Goblin Warlord',
  stats: { maxHp: 1000, damage: 25, defense: 10, attackSpeed: 0.7, critChance: 0.08, critDamage: 1.5 },
  loot: [
    { resource: ResourceType.GOLD, amount: 250 },
    { resource: ResourceType.IRON, amount: 15 },
    { resource: ResourceType.CRYSTALS, amount: 10 },
    { resource: ResourceType.HEROIC_POINTS, amount: 100 }
  ],
  iconName: 'ENEMY',
  expReward: 200,
  summonAbility: {
    enemyIdToSummon: 'GOBLIN',
    count: 2,
    cooldownMs: 10000,
    initialCooldownMs: 5000,
    scaleWithWave: false,
  }
};
