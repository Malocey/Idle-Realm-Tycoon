import { ResourceType, EnemyDefinition } from '../../types';

export const IMP_WARLOCK_DEFINITION: EnemyDefinition = {
  id: 'IMP_WARLOCK',
  name: 'Imp Warlock',
  stats: {
    maxHp: 40,
    damage: 10, // Assumed to be magic damage
    defense: 0,
    attackSpeed: 0.8,
    critChance: 0.04,
    critDamage: 1.3,
    maxMana: 0,
    manaRegen: 0,
    healPower: 0,
    hpRegen: 0,
    maxEnergyShield: 0,
    energyShieldRechargeRate: 0,
    energyShieldRechargeDelay: 0,
  },
  loot: [{ resource: ResourceType.GOLD, amount: 15 }, { resource: ResourceType.CRYSTALS, amount: 1 }],
  iconName: 'STAFF_ICON', // Placeholder, could be a demonic or magic icon
  expReward: 22,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 130,
};
