import { ResourceType, EnemyDefinition } from '../../types';

export const ARMORED_GOBLIN_DEFINITION: EnemyDefinition = {
  id: 'ARMORED_GOBLIN',
  name: 'Armored Goblin',
  stats: {
    maxHp: 70,
    damage: 6,
    defense: 4,
    attackSpeed: 0.7,
    critChance: 0.03,
    critDamage: 1.25,
    maxMana: 0,
    manaRegen: 0,
    healPower: 0,
    hpRegen: 0,
    maxEnergyShield: 0,
    energyShieldRechargeRate: 0,
    energyShieldRechargeDelay: 0,
  },
  loot: [{ resource: ResourceType.GOLD, amount: 8 }, { resource: ResourceType.IRON, amount: 1 }],
  iconName: 'ENEMY', // Consider a more specific icon later, e.g., ENEMY_SHIELD
  expReward: 18,
  attackType: 'MELEE',
};
