
import { ResourceType, EnemyDefinition, StatusEffectType, HeroStats } from '../../types';

export const SHADOW_CREEPER_DEFINITION: EnemyDefinition = {
  id: 'SHADOW_CREEPER',
  name: 'Shadow Creeper',
  stats: {
    maxHp: 80,
    damage: 10, // Shadow Bolt damage
    defense: 4,
    attackSpeed: 0.9,
    critChance: 0.05,
    critDamage: 1.4,
    maxMana: 0, // Abilities are cooldown based or on-hit
    manaRegen: 0,
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 30 },
    { resource: ResourceType.CRYSTALS, amount: 1 },
  ],
  iconName: 'MAGIC_ARROW', // Placeholder, as it's a ranged magic user
  expReward: 55,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 150,
  onAttackAbilities: [
    {
      chance: 0.30, // 30% chance to apply Curse of Agony
      inlineStatusEffect: {
        name: 'Curse of Agony',
        type: StatusEffectType.DOT,
        durationMs: 10000, // 10 seconds
        iconName: 'WARNING', // Placeholder icon
        damagePerTick: 3, // Reduced from 8
        tickIntervalMs: 2000, // Every 2 seconds
      },
    },
  ],
  periodicEffectAbility: { // Renamed from debuffAuraAbility
    cooldownMs: 12000, // 12 seconds
    initialCooldownMs: 5000, // 5 seconds initial
    statusEffect: {
      name: 'Weakening Aura',
      type: StatusEffectType.DEBUFF, 
      durationMs: 6000, // 6 seconds
      iconName: 'SHIELD_BADGE', 
      statAffected: 'defense' as keyof HeroStats,
      modifierType: 'PERCENTAGE_ADDITIVE',
      value: -0.15, // Reduces defense by 15%
    },
  },
  // specialAttackCooldownsRemaining: {}, // No channeling abilities defined
};