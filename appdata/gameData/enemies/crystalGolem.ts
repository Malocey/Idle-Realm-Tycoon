
import { ResourceType, EnemyDefinition } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

export const CRYSTAL_GOLEM_DEFINITION: EnemyDefinition = {
  id: 'CRYSTAL_GOLEM',
  name: 'Crystal Golem',
  stats: { 
    maxHp: 300, 
    damage: 15, 
    defense: 20, 
    attackSpeed: 0.4, 
    critChance: 0.01, 
    critDamage: 1.2,
    maxEnergyShield: 150, // Shield HP
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 0.8, // Slower recharge
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 1.2, // Longer delay
  },
  loot: [{ resource: ResourceType.CRYSTALS, amount: 15 }, { resource: ResourceType.STONE, amount: 10 }],
  iconName: 'STONE',
  expReward: 100,
};