
import { ResourceType, EnemyDefinition } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

export const SHIELD_MENDER_GOBLIN_DEFINITION: EnemyDefinition = {
  id: 'SHIELD_MENDER_GOBLIN',
  name: 'Shield Mender Goblin',
  stats: { 
    maxHp: 40, 
    damage: 3, 
    defense: 5, 
    attackSpeed: 0.8, 
    critChance: 0.02, 
    critDamage: 1.2,
    maxEnergyShield: 30, // Has its own shield
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 0.5,
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 1.2,
  },
  shieldHealAbility: {
    healAmount: 50, // Shield Points
    cooldownMs: 12000,
    initialCooldownMs: 6000,
    targetPriority: 'LOWEST_SHIELD_PERCENTAGE',
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 10 },
    { resource: ResourceType.CRYSTALS, amount: 1 },
  ],
  iconName: 'SETTINGS', // Placeholder, needs a mender/support icon
  expReward: 25,
  attackType: 'MELEE', // Can still poke if nothing to heal
};
