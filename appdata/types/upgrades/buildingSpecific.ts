import { ResourceType, TownHallUpgradeEffectType } from '../enums'; // TownHallUpgradeEffectType for effectParams
import { HeroStats } from '../hero';
import { TownHallUpgradeCostDefinition, TownHallUpgradeEffectParams } from './townHall'; // Re-use cost & effect param types

// Building Specific Upgrades
export interface BuildingSpecificUpgradeEffectDefinition {
  stat?: keyof HeroStats;
  productionBonus?: {
    resource: ResourceType;
    effectType: 'PERCENTAGE_BONUS' | 'FLAT_BONUS';
  };
  potionCraftTimeReduction?: boolean;
  potionResourceSaveChance?: boolean;
  passiveHerbProduction?: {
    herbType: ResourceType.HERB_BLOODTHISTLE | ResourceType.HERB_IRONWOOD_LEAF;
    amountPerTick: number;
  };
  effectParams: TownHallUpgradeEffectParams; // Re-uses TownHall effect params
}

export interface BuildingSpecificUpgradeDefinition {
  id: string;
  buildingId: string;
  name: string;
  description: string;
  costs: TownHallUpgradeCostDefinition[]; // Re-uses TownHall cost definitions
  effects: BuildingSpecificUpgradeEffectDefinition[];
  maxLevel: number;
  iconName: string;
  unlockRequirements?: Array<{ buildingLevel: number }>;
}
