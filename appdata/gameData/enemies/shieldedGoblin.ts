import { ResourceType, EnemyDefinition } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

export const SHIELDED_GOBLIN_DEFINITION: EnemyDefinition = {
  id: 'SHIELDED_GOBLIN',
  name: 'Shielded Goblin',
  stats: {
    maxHp: 25,
    damage: 4,
    defense: 0,
    attackSpeed: 0.7,
    critChance: 0.02,
    critDamage: 1.2,
    maxMana: 0,
    manaRegen: 0,
    healPower: 0,
    hpRegen: 0,
    maxEnergyShield: 70,
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 0.7,
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 1.3,
  },
  loot: [{ resource: ResourceType.GOLD, amount: 6 }, { resource: ResourceType.CRYSTALS, amount: 1 }],
  iconName: 'ENEMY',
  expReward: 16,
  attackType: 'MELEE',
};
