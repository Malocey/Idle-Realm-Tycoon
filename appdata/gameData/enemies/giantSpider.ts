
import { ResourceType, EnemyDefinition, StatusEffectType, HeroStats } from '../../types';

export const GIANT_SPIDER_DEFINITION: EnemyDefinition = {
  id: 'GIANT_SPIDER',
  name: 'Giant Spider',
  stats: { maxHp: 50, damage: 7, defense: 2, attackSpeed: 1.4, critChance: 0.05, critDamage: 1.25 },
  loot: [{ resource: ResourceType.GOLD, amount: 11 }, { resource: ResourceType.LEATHER, amount: 2 }],
  iconName: 'ENEMY',
  expReward: 18,
  onAttackAbilities: [
    {
      chance: 0.20, // 20% chance to apply poison
      inlineStatusEffect: { // Define the poison effect inline
        name: 'Poison Sting',
        type: StatusEffectType.DOT,
        durationMs: 8000, 
        iconName: 'ENEMY', 
        damagePerTick: 5,
        tickIntervalMs: 2000, 
      }
    }
  ]
};
