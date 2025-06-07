
import { ResourceType, EnemyDefinition } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

export const BOSS_STONE_TITAN_DEFINITION: EnemyDefinition = {
  id: 'BOSS_STONE_TITAN',
  name: 'Stone Titan',
  stats: { 
    maxHp: 7500, 
    damage: 50, 
    defense: 30, 
    attackSpeed: 0.5, 
    critChance: 0.05, 
    critDamage: 1.5,
    maxEnergyShield: 2000, // Significant shield
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 1.5, // Faster recharge
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, // Standard delay
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 2000 },
    { resource: ResourceType.STONE, amount: 100 },
    { resource: ResourceType.CRYSTALS, amount: 50 },
    { resource: ResourceType.META_CURRENCY, amount: 2 },
    { resource: ResourceType.HEROIC_POINTS, amount: 800 },
    { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 3 }
  ],
  iconName: 'STONE',
  expReward: 1500,
};