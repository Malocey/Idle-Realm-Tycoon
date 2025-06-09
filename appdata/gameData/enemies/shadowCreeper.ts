
import { ResourceType, EnemyDefinition, StatusEffectType, HeroStats } from '../../types';

export const SHADOW_CREEPER_DEFINITION: EnemyDefinition = {
  id: 'SHADOW_CREEPER',
  name: 'Shadow Creeper',
  stats: {
    maxHp: 70,
    damage: 12, 
    defense: 3,
    attackSpeed: 1.0,
    critChance: 0.06,
    critDamage: 1.4,
    maxMana: 0,
    manaRegen: 0,
    healPower: 0,
    hpRegen: 0,
    maxEnergyShield: 0,
    energyShieldRechargeRate: 0,
    energyShieldRechargeDelay: 0,
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 20 },
    { resource: ResourceType.CRYSTALS, amount: 2 },
  ],
  iconName: 'ENEMY', 
  expReward: 45,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 140,
  onAttackAbilities: [
    {
      chance: 0.25, 
      inlineStatusEffect: {
        name: 'Shadow Curse',
        type: StatusEffectType.DEBUFF,
        durationMs: 8000, 
        iconName: 'WARNING', 
        statAffected: 'defense' as keyof HeroStats,
        modifierType: 'PERCENTAGE_ADDITIVE',
        value: -0.15, // Reduces defense by 15%
      }
    }
  ]
};
