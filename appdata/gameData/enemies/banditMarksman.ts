import { ResourceType, EnemyDefinition } from '../../types';

export const BANDIT_MARKSMAN_DEFINITION: EnemyDefinition = {
  id: 'BANDIT_MARKSMAN',
  name: 'Bandit Marksman',
  stats: {
    maxHp: 55,
    damage: 9,
    defense: 1,
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
  loot: [{ resource: ResourceType.GOLD, amount: 12 }, { resource: ResourceType.LEATHER, amount: 1 }],
  iconName: 'BOW_ICON',
  expReward: 20,
  attackType: 'RANGED',
  rangedAttackRangeUnits: 155,
};
