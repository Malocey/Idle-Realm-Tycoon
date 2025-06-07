import { ResourceType, TownHallUpgradeDefinition, TownHallUpgradeCostType, TownHallUpgradeEffectType, TownHallUpgradeUnlockRequirementType, GlobalEffectTarget } from '../types';

export const TOWN_HALL_UPGRADE_DEFINITIONS: Record<string, TownHallUpgradeDefinition> = {
  'TownHall_Batch1_Attack': { id: 'TownHall_Batch1_Attack', name: 'Basic Combat Training', description: 'Slightly increases all heroes\' damage.', costs: [{ resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.ArithmeticIncreasingStep, startCost: 5, firstIncrease: 8, increaseStep: 1 }}], effects: [{ stat: 'damage', effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 0.1, additiveStep: 0.1 }}], maxLevel: -1, iconName: 'SWORD', unlockRequirements: [] },
  'TownHall_Batch1_HP': { id: 'TownHall_Batch1_HP', name: 'Basic Endurance Training', description: 'Slightly increases all heroes\' maximum HP.', costs: [{ resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 8, increasePerLevel: 5 }}], effects: [{ stat: 'maxHp', effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 2, additiveStep: 2 } }], maxLevel: -1, iconName: 'SHIELD', unlockRequirements: [] },
  'TownHall_Batch2_Attack': { id: 'TownHall_Batch2_Attack', name: 'Advanced Combat Tactics', description: 'Significantly increases all heroes\' damage.', costs: [ { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 250, increasePerLevel: 50 }}, { resource: ResourceType.LEATHER, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 50, increasePerLevel: 10 }} ], effects: [{ stat: 'damage', effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 1, additiveStep: 0.5 }}], maxLevel: -1, iconName: 'SWORD', unlockRequirements: [{ unlockParams: { type: TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel, upgradeId: 'TownHall_Batch1_Attack', level: 5 }}] },
  'TownHall_Batch2_HP': { id: 'TownHall_Batch2_HP', name: 'Advanced Fortitude Regimen', description: 'Significantly increases all heroes\' maximum HP.', costs: [ { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 800, increasePerLevel: 200 }}, { resource: ResourceType.WOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 50 }}, { resource: ResourceType.IRON, costParams: { type: TownHallUpgradeCostType.ArithmeticIncreasingStep, startCost: 25, firstIncrease: 10, increaseStep: 2.5 }} ], effects: [{ stat: 'maxHp', effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 20, additiveStep: 10 }}], maxLevel: -1, iconName: 'SHIELD', unlockRequirements: [{ unlockParams: { type: TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel, upgradeId: 'TownHall_Batch1_HP', level: 5 }}] },
  'TownHall_Batch3_GlobalEffect': { id: 'TownHall_Batch3_GlobalEffect', name: 'Strategic Mastery', description: 'Provides a percentage bonus to all heroes\' damage and maximum HP.', costs: [{ resource: ResourceType.TOWN_XP, costParams: { type: TownHallUpgradeCostType.ArithmeticIncreasingStep, startCost: 100, firstIncrease: 50, increaseStep: 10 }}], effects: [ { stat: 'damage', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 }}, { stat: 'maxHp', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 }} ], maxLevel: -1, iconName: 'UPGRADE', unlockRequirements: [{ unlockParams: { type: TownHallUpgradeUnlockRequirementType.TotalResourceSpentOnPaths, resource: ResourceType.GOLD, amount: 2500, onUpgradePaths: ['TownHall_Batch1_Attack', 'TownHall_Batch1_HP', 'TownHall_Batch2_Attack', 'TownHall_Batch2_HP'] } }] },
  'THU_ResourceMastery': { 
    id: 'THU_ResourceMastery', name: 'Resource Mastery', 
    description: 'Improves the efficiency of all your resource production buildings (Gold, Wood, Stone, Food, Iron, Crystals).', 
    costs: [{ resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 500, increasePerLevel: 150 }},{ resource: ResourceType.WOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 200, increasePerLevel: 75 }}], 
    effects: [{ globalEffectTarget: GlobalEffectTarget.ALL_RESOURCE_PRODUCTION, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 }}], 
    maxLevel: 20, iconName: 'WOOD', unlockRequirements: [] 
  },
  'THU_EfficientLogistics': { 
    id: 'THU_EfficientLogistics', name: 'Efficient Logistics', 
    description: 'Reduces the resource cost for constructing and upgrading all buildings.', 
    costs: [{ resource: ResourceType.STONE, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 750, increasePerLevel: 200 }},{ resource: ResourceType.IRON, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 40 }}], 
    effects: [{ globalEffectTarget: GlobalEffectTarget.BUILDING_COST_REDUCTION, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 }}], 
    maxLevel: 15, iconName: 'BUILDING', 
    unlockRequirements: [{ unlockParams: {type: TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel, upgradeId: 'THU_ResourceMastery', level: 5 }}]
  },
  'THU_SpoilsOfWar': {
    id: 'THU_SpoilsOfWar', name: 'Spoils of War',
    description: 'Increases the amount of Gold and Hero XP Pool gained from clearing battle waves.',
    costs: [{ resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 600, increasePerLevel: 180 }},{ resource: ResourceType.FOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 300, increasePerLevel: 90 }}],
    effects: [
        { globalEffectTarget: GlobalEffectTarget.WAVE_GOLD_REWARD, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 }},
        { globalEffectTarget: GlobalEffectTarget.WAVE_XP_REWARD, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 }}
    ],
    maxLevel: 20, iconName: 'GOLD', unlockRequirements: []
  },
   'THU_HeroicResolve': {
    id: 'THU_HeroicResolve', name: 'Heroic Resolve',
    description: 'Inspires heroes to learn faster, increasing all Hero Experience Point gains. Requires a Guild Hall.',
    costs: [{ resource: ResourceType.TOWN_XP, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 500, increasePerLevel: 250 }},{ resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 75, increasePerLevel: 25 }}],
    effects: [{ globalEffectTarget: GlobalEffectTarget.HERO_XP_GAIN, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 }}],
    maxLevel: 10, iconName: 'HEROIC_POINTS',
    unlockRequirements: [{unlockParams: { type: TownHallUpgradeUnlockRequirementType.BuildingLevel, buildingId: 'GUILD_HALL', level: 1 }}]
  },
  'THU_AdvancedWarfare': {
    id: 'THU_AdvancedWarfare', name: 'Advanced Warfare',
    description: 'Significantly boosts the damage and HP of all heroes. Requires a Guild Hall.',
    costs: [
        { resource: ResourceType.IRON, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 500, increasePerLevel: 150 }},
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 250, increasePerLevel: 75 }},
        { resource: ResourceType.TOWN_XP, costParams: { type: TownHallUpgradeCostType.ArithmeticIncreasingStep, startCost: 1000, firstIncrease: 500, increaseStep: 100 }}
    ],
    effects: [
        { stat: 'damage', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 }}, 
        { stat: 'maxHp', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 }}
    ],
    maxLevel: 15, iconName: 'FIGHT', 
    unlockRequirements: [
        { unlockParams: { type: TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel, upgradeId: 'THU_SpoilsOfWar', level: 5 }},
        { unlockParams: { type: TownHallUpgradeUnlockRequirementType.BuildingLevel, buildingId: 'GUILD_HALL', level: 1 }}
    ]
  },
  'THU_DungeonPathfinding': {
    id: 'THU_DungeonPathfinding', name: 'Dungeon Pathfinding',
    description: 'Expert knowledge increases the number of permanent buff choices from Catacomb runs.',
    costs: [
        { resource: ResourceType.TOWN_XP, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 1500, increasePerLevel: 750 }},
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 50 }},
    ],
    effects: [{ globalEffectTarget: GlobalEffectTarget.DUNGEON_BUFF_CHOICES_BONUS, effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 0, additiveStep: 1 }}],
    maxLevel: 1, iconName: 'COMPASS',
    unlockRequirements: [{ unlockParams: { type: TownHallUpgradeUnlockRequirementType.BuildingLevel, buildingId: 'EXPLORERS_GUILD', level: 3 }}]
  },
  'THU_EfficientKeyCrafting': {
    id: 'THU_EfficientKeyCrafting', name: 'Efficient Key Crafting',
    description: 'Reduces the resource cost for crafting Catacomb Keys.',
    costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 2000, increasePerLevel: 1000 }},
        { resource: ResourceType.IRON, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 200, increasePerLevel: 100 }},
    ],
    effects: [{ globalEffectTarget: GlobalEffectTarget.CATACOMB_KEY_COST_REDUCTION, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.025 }}],
    maxLevel: 5, iconName: 'ANVIL',
    unlockRequirements: [
        { unlockParams: { type: TownHallUpgradeUnlockRequirementType.BuildingLevel, buildingId: 'EXPLORERS_GUILD', level: 1 }},
        { unlockParams: { type: TownHallUpgradeUnlockRequirementType.BuildingLevel, buildingId: 'FORGE', level: 5 }},
    ]
  },
};
