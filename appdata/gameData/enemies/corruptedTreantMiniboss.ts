
import { ResourceType, EnemyDefinition, StatusEffectType, HeroStats } from '../../types';

export const CORRUPTED_TREANT_MINIBOSS_DEFINITION: EnemyDefinition = {
  id: 'CORRUPTED_TREANT_MINIBOSS',
  name: 'Corrupted Treant',
  stats: {
    maxHp: 450,
    damage: 28,
    defense: 12,
    attackSpeed: 0.7,
    critChance: 0.05,
    critDamage: 1.5,
    maxMana: 0,
    manaRegen: 0,
    healPower: 0,
    hpRegen: 1, // Minor regeneration
    maxEnergyShield: 0,
    energyShieldRechargeRate: 0,
    energyShieldRechargeDelay: 0,
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 150 },
    { resource: ResourceType.WOOD, amount: 50 },
    { resource: ResourceType.CRYSTALS, amount: 10 },
    { resource: ResourceType.HEROIC_POINTS, amount: 75 },
  ],
  iconName: 'WOOD', 
  expReward: 150,
  attackType: 'MELEE',
  summonAbility: {
    enemyIdToSummon: 'SHADOW_CREEPER',
    count: 1,
    cooldownMs: 15000,
    initialCooldownMs: 8000,
  },
  onAttackAbilities: [
    {
      chance: 0.20,
      inlineStatusEffect: {
        name: 'Entangling Roots',
        type: StatusEffectType.DEBUFF, 
        durationMs: 5000,
        iconName: 'WARNING',
        statAffected: 'attackSpeed' as keyof HeroStats, // Effectively a slow
        modifierType: 'PERCENTAGE_ADDITIVE',
        value: -0.30, // Reduces attack speed by 30%
      }
    }
  ]
};
