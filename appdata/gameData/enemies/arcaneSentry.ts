import { ResourceType, EnemyDefinition } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

export const ARCANE_SENTRY_DEFINITION: EnemyDefinition = {
  id: 'ARCANE_SENTRY',
  name: 'Arcane Sentry',
  stats: {
    maxHp: 40,
    damage: 8,
    defense: 2,
    attackSpeed: 0.6,
    critChance: 0.03,
    critDamage: 1.3,
    maxMana: 0,
    manaRegen: 0,
    healPower: 0,
    hpRegen: 0,
    maxEnergyShield: 90,
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 1.2,
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 0.9,
  },
  loot: [{ resource: ResourceType.CRYSTALS, amount: 4 }, { resource: ResourceType.STONE, amount: 5 }],
  iconName: 'ATOM_ICON', // Using ATOM_ICON for a magical construct look
  expReward: 28,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 140,
};
