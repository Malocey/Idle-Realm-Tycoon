
import { ResourceType, EnemyDefinition } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

export const ARCANE_RESTORER_DEFINITION: EnemyDefinition = {
  id: 'ARCANE_RESTORER',
  name: 'Arcane Restorer',
  stats: { 
    maxHp: 80, 
    damage: 10, // Ranged magic damage
    defense: 2, 
    attackSpeed: 0.9, 
    critChance: 0.05, 
    critDamage: 1.4,
    maxEnergyShield: 100,
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 1.1,
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS,
  },
  shieldHealAbility: {
    healAmount: 70, // Shield Points
    cooldownMs: 10000,
    initialCooldownMs: 5000,
    targetPriority: 'LOWEST_SHIELD_ABSOLUTE',
  },
  loot: [
    { resource: ResourceType.CRYSTALS, amount: 5 },
    { resource: ResourceType.AETHERIUM, amount: 1 } // Low chance, or make loot table more complex
  ],
  iconName: 'ATOM_ICON', 
  expReward: 60,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 140,
};
