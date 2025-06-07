
import { ResourceType, GuildHallUpgradeDefinition, TownHallUpgradeCostType, TownHallUpgradeEffectType, GlobalEffectTarget } from '../types';

export const GUILD_HALL_UPGRADE_DEFINITIONS: Record<string, GuildHallUpgradeDefinition> = {
  'GHU_HeroTrainingRegimen': {
    id: 'GHU_HeroTrainingRegimen',
    name: 'Hero Training Regimen',
    description: 'Improves hero training techniques, increasing all Hero XP gained.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 500, increasePerLevel: 200 } },
        { resource: ResourceType.TOWN_XP, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 250, increasePerLevel: 100 } }
    ],
    effects: [{ globalEffectTarget: GlobalEffectTarget.HERO_XP_GAIN, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.01 } }], // +3% base, +1% per level
    maxLevel: 10,
    iconName: 'HEROIC_POINTS',
    unlockRequirements: [{ guildHallLevel: 1 }]
  },
  'GHU_RecruitmentDrives': {
    id: 'GHU_RecruitmentDrives',
    name: 'Recruitment Drives',
    description: 'Organizes widespread recruitment drives, reducing the cost to recruit new heroes.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 1000, increasePerLevel: 300 } },
        { resource: ResourceType.FOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 200, increasePerLevel: 75 } }
    ],
    effects: [{ globalEffectTarget: GlobalEffectTarget.HERO_RECRUITMENT_COST_REDUCTION, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 } }], // -5% base, -2% per level
    maxLevel: 5,
    iconName: 'HERO',
    unlockRequirements: [{ guildHallLevel: 2 }]
  },
  'GHU_WarriorSpecialization': {
    id: 'GHU_WarriorSpecialization',
    name: 'Warrior Specialization',
    description: 'Advanced combat training focusing on brute force, increasing Warrior damage.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 750, increasePerLevel: 250 } },
        { resource: ResourceType.IRON, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 40 } }
    ],
    effects: [{ stat: 'damage', heroClassTarget: 'WARRIOR', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.025, additiveStep: 0.01 } }], // +2.5% base, +1% per level
    maxLevel: 8,
    iconName: 'SWORD',
    unlockRequirements: [{ guildHallLevel: 3, heroRecruited: 'WARRIOR' }]
  },
  'GHU_ArcherPrecision': {
    id: 'GHU_ArcherPrecision',
    name: 'Archer Precision Training',
    description: 'Focuses on ranged accuracy, increasing Archer critical hit chance.',
     costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 750, increasePerLevel: 250 } },
        { resource: ResourceType.WOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 40 } }
    ],
    effects: [{ stat: 'critChance', heroClassTarget: 'ARCHER', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 } }], // +1% base, +0.5% per level
    maxLevel: 8,
    iconName: 'BOW_ICON',
    unlockRequirements: [{ guildHallLevel: 3, heroRecruited: 'ARCHER' }]
  },
  'GHU_ClericDevotion': {
    id: 'GHU_ClericDevotion',
    name: 'Cleric Devotion Studies',
    description: 'Deepens understanding of divine magic, increasing Cleric healing power.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 800, increasePerLevel: 275 } },
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 75, increasePerLevel: 25 } }
    ],
    effects: [{ stat: 'healPower', heroClassTarget: 'CLERIC', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 } }], // +3% base, +1.5% per level
    maxLevel: 8,
    iconName: 'STAFF_ICON',
    unlockRequirements: [{ guildHallLevel: 4, heroRecruited: 'CLERIC' }]
  },
  'GHU_PaladinResilience': {
    id: 'GHU_PaladinResilience',
    name: 'Paladin Resilience Oath',
    description: 'Reinforces the Paladin\'s defensive capabilities, increasing their maximum HP.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 800, increasePerLevel: 275 } },
        { resource: ResourceType.STONE, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 120, increasePerLevel: 45 } }
    ],
    effects: [{ stat: 'maxHp', heroClassTarget: 'PALADIN', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 } }], // +3% base, +1.5% per level
    maxLevel: 8,
    iconName: 'SHIELD_BADGE',
    unlockRequirements: [{ guildHallLevel: 4, heroRecruited: 'PALADIN' }]
  },
   'GHU_TreasureHunters': {
    id: 'GHU_TreasureHunters',
    name: 'Treasure Hunters Guild',
    description: 'Establishes a network of treasure hunters, increasing Gold rewards from clearing waves.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 2000, increasePerLevel: 500 } },
        { resource: ResourceType.LEATHER, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 150, increasePerLevel: 50 } }
    ],
    effects: [{ globalEffectTarget: GlobalEffectTarget.WAVE_GOLD_REWARD, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 } }], // +5% base, +2% per level
    maxLevel: 5,
    iconName: 'LOOT_BAG',
    unlockRequirements: [{ guildHallLevel: 5 }]
  }
};
