
import { ResourceType, BuildingSpecificUpgradeDefinition, TownHallUpgradeCostType, TownHallUpgradeEffectType } from '../types';

export const BUILDING_SPECIFIC_UPGRADE_DEFINITIONS: Record<string, BuildingSpecificUpgradeDefinition[]> = {
  'MAGE_TOWER': [
    {
      id: 'MT_MAX_MANA_1',
      buildingId: 'MAGE_TOWER',
      name: 'Mana Font Attunement',
      description: 'Attunes the Mage Tower to ambient mana fonts, increasing the maximum Mana of all heroes.',
      iconName: 'CRYSTALS',
      maxLevel: 10,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 50 } },
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 20, increasePerLevel: 10 } }
      ],
      effects: [
        { stat: 'maxMana', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 } } // +2% base, +1% per level
      ],
      unlockRequirements: [{ buildingLevel: 1 }]
    },
    {
      id: 'MT_MANA_REGEN_1',
      buildingId: 'MAGE_TOWER',
      name: 'Leyline Channeling',
      description: 'Channels subtle leylines through the Mage Tower, improving the Mana regeneration rate of all heroes.',
      iconName: 'WIZARD_HAT', // Could be a more specific icon
      maxLevel: 10,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 150, increasePerLevel: 75 } },
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 15, increasePerLevel: 5 } }
      ],
      effects: [
        { stat: 'manaRegen', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.015, additiveStep: 0.005 } } // +1.5% base, +0.5% per level
      ],
      unlockRequirements: [{ buildingLevel: 3 }]
    },
    {
      id: 'MT_SHIELD_CAPACITY_1',
      buildingId: 'MAGE_TOWER',
      name: 'Arcane Warding',
      description: 'Reinforces hero energy shields, increasing their maximum capacity for all heroes.',
      iconName: 'SHIELD_BADGE',
      maxLevel: 10,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 2000, increasePerLevel: 800 } },
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 40 } }
      ],
      effects: [
        { stat: 'maxEnergyShield', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 } } // +5% base, +2% per level
      ],
      unlockRequirements: [{ buildingLevel: 2 }] 
    },
    {
      id: 'MT_SHIELD_RECHARGE_RATE_1',
      buildingId: 'MAGE_TOWER',
      name: 'Focused Energy Flow',
      description: 'Improves the energy flow to shields, increasing their recharge rate for all heroes.',
      iconName: 'ATOM_ICON', 
      maxLevel: 8,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 1500, increasePerLevel: 600 } },
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 120, increasePerLevel: 50 } }
      ],
      effects: [
        { stat: 'energyShieldRechargeRate', effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 } } // +3% base, +1.5% per level
      ],
      unlockRequirements: [{ buildingLevel: 4 }] 
    }
  ],
  'ALCHEMISTS_LAB': [
    {
      id: 'AL_EFFICIENT_BREWING',
      buildingId: 'ALCHEMISTS_LAB',
      name: 'Efficient Brewing',
      description: 'Improves brewing techniques, reducing potion craft time.',
      iconName: 'SETTINGS', // Placeholder
      maxLevel: 10,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 200, increasePerLevel: 100 } },
        { resource: ResourceType.CRYSTALS, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 10, increasePerLevel: 5 } }
      ],
      effects: [
        { potionCraftTimeReduction: true, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 } } // 2% base reduction, +1% per level
      ],
      unlockRequirements: [{ buildingLevel: 1 }]
    },
    {
      id: 'AL_RESOURCEFUL_ALCHEMY',
      buildingId: 'ALCHEMISTS_LAB',
      name: 'Resourceful Alchemy',
      description: 'Chance to not consume herbs when brewing potions.',
      iconName: 'HERB_BLOODTHISTLE', // Placeholder
      maxLevel: 5,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 500, increasePerLevel: 250 } },
        { resource: ResourceType.HERB_BLOODTHISTLE, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 5, increasePerLevel: 2 } },
        { resource: ResourceType.HERB_IRONWOOD_LEAF, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 5, increasePerLevel: 2 } }
      ],
      effects: [
        { potionResourceSaveChance: true, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.02 } } // 3% base chance, +2% per level
      ],
      unlockRequirements: [{ buildingLevel: 3 }]
    }
  ],
  'FARM': [
    {
      id: 'FARM_HERB_CULTIVATION',
      buildingId: 'FARM',
      name: 'Herb Cultivation',
      description: 'The farm begins cultivating alchemical herbs, passively producing Bloodthistle and Ironwood Leaf.',
      iconName: 'FOOD', // Placeholder
      maxLevel: 5,
      costs: [
        { resource: ResourceType.GOLD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 1000, increasePerLevel: 500 } },
        { resource: ResourceType.FOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 100, increasePerLevel: 50 } },
        { resource: ResourceType.WOOD, costParams: { type: TownHallUpgradeCostType.LinearIncreasing, startCost: 50, increasePerLevel: 25 } }
      ],
      effects: [
        // The effectParams here are mostly for value calculation per level, the actual amountPerTick might be hardcoded or use baseIncrease
        { passiveHerbProduction: { herbType: ResourceType.HERB_BLOODTHISTLE, amountPerTick: 0.001 }, effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 0.001, additiveStep: 0.0005 } }, // Base: 0.001/tick, +0.0005/tick per level
        { passiveHerbProduction: { herbType: ResourceType.HERB_IRONWOOD_LEAF, amountPerTick: 0.001 }, effectParams: { type: TownHallUpgradeEffectType.Additive, baseIncrease: 0.001, additiveStep: 0.0005 } }
      ],
      unlockRequirements: [{ buildingLevel: 5 }]
    }
  ]
};