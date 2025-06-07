
import { ResourceType, EnemyDefinition, EnemyHealAbility } from '../../types';

export const SKELETON_MAGE_DEFINITION: EnemyDefinition = {
  id: 'SKELETON_MAGE',
  name: 'Skeleton Mage',
  stats: {
    maxHp: 60,
    damage: 7, // Low direct damage
    defense: 3,
    attackSpeed: 0.8,
    critChance: 0.04,
    critDamage: 1.3,
    healPower: 20, // Primary role
    maxMana: 0,    // Spells are cooldown based for enemies by default
    manaRegen: 0,
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 18 },
    { resource: ResourceType.CRYSTALS, amount: 2 },
    { resource: ResourceType.HEROIC_POINTS, amount: 1 }
  ],
  iconName: 'STAFF_ICON', // Using staff icon for a mage/healer
  expReward: 30,
  healAbility: {
    healAmount: 35,
    cooldownMs: 15000, // 15 seconds
    initialCooldownMs: 8000, // 8 seconds
    targetPriority: 'LOWEST_HP_PERCENTAGE',
  },
  attackType: 'RANGED',
  rangedAttackRangeUnits: 150,
  // specialAttackCooldownsRemaining: {}, // No channeling abilities defined
};