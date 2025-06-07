
import { ResourceType, HeroDefinition } from '../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK } from '../constants';

export const HERO_DEFINITIONS: Record<string, HeroDefinition> = {
  'WARRIOR': { 
    id: 'WARRIOR', 
    name: 'Warrior', 
    description: 'A stalwart frontline fighter.', 
    baseStats: { 
      maxHp: 100, damage: 10, defense: 5, attackSpeed: 1.0, critChance: 0.05, critDamage: 1.5, healPower: 0, maxMana: 30, manaRegen: 0.5,
      maxEnergyShield: 20, energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS
    }, 
    iconName: 'HERO', 
    skillTreeId: 'WARRIOR_SKILLS', 
    recruitmentCost: [{ resource: ResourceType.GOLD, amount: 100 }],
    unlockWaveRequirement: 0,
    attackType: 'MELEE',
  },
  'ARCHER': { 
    id: 'ARCHER', 
    name: 'Archer', 
    description: 'A nimble ranged attacker.', 
    baseStats: { 
      maxHp: 70, damage: 12, defense: 2, attackSpeed: 1.2, critChance: 0.1, critDamage: 1.6, healPower: 0, maxMana: 50, manaRegen: 1.0,
      maxEnergyShield: 15, energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 1.2, energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 0.9
    }, 
    iconName: 'BOW_ICON', 
    skillTreeId: 'ARCHER_SKILLS', 
    recruitmentCost: [{ resource: ResourceType.GOLD, amount: 150 }, { resource: ResourceType.WOOD, amount: 50 }],
    unlockWaveRequirement: 3,
    attackType: 'RANGED',
    rangedAttackRangeUnits: 150, 
  },
  'CLERIC': {
    id: 'CLERIC',
    name: 'Cleric',
    description: 'A divine healer who mends allies wounds in place of attacking.',
    baseStats: { 
      maxHp: 80, damage: 1, defense: 3, attackSpeed: 0.9, critChance: 0.03, critDamage: 1.5, healPower: 3, maxMana: 70, manaRegen: 1.5,
      maxEnergyShield: 25, energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK, energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS
    },
    iconName: 'STAFF_ICON',
    skillTreeId: 'CLERIC_SKILLS',
    recruitmentCost: [{ resource: ResourceType.GOLD, amount: 200 }, { resource: ResourceType.CRYSTALS, amount: 10 }],
    unlockWaveRequirement: 5,
    attackType: 'MELEE', 
  },
  'PALADIN': {
    id: 'PALADIN',
    name: 'Paladin',
    description: 'A devoted protector who draws enemy fire and shields allies.',
    baseStats: { 
      maxHp: 130, damage: 8, defense: 6, attackSpeed: 0.75, critChance: 0.02, critDamage: 1.5, healPower: 0, maxMana: 40, manaRegen: 0.75,
      maxEnergyShield: 30, energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 0.8, energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 1.1
    }, 
    iconName: 'SHIELD_BADGE',
    skillTreeId: 'PALADIN_SKILLS',
    recruitmentCost: [{ resource: ResourceType.GOLD, amount: 250 }, { resource: ResourceType.IRON, amount: 20 }],
    unlockWaveRequirement: 8,
    attackType: 'MELEE',
  },
  'ELEMENTAL_MAGE': {
    id: 'ELEMENTAL_MAGE',
    name: 'Elementar Mage',
    description: 'A mage wielding the raw powers of fire, ice, and lightning.',
    baseStats: { 
      maxHp: 65, damage: 8, defense: 1, attackSpeed: 1.0, critChance: 0.05, critDamage: 1.5, healPower: 0, maxMana: 100, manaRegen: 2.0,
      maxEnergyShield: 40, energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 1.5, energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 0.8
    },
    iconName: 'WIZARD_HAT',
    skillTreeId: 'ELEMENTAL_MAGE_SKILLS',
    recruitmentCost: [{ resource: ResourceType.GOLD, amount: 300 }, { resource: ResourceType.CRYSTALS, amount: 50 }],
    unlockWaveRequirement: 12,
    attackType: 'RANGED',
    rangedAttackRangeUnits: 140,
  }
};
