import { ResourceType, TownHallUpgradeCostType, TownHallUpgradeEffectType, GlobalEffectTarget, TownHallUpgradeUnlockRequirementType } from '../enums';
import { HeroStats } from '../hero';

// Town Hall Upgrades
export type TownHallUpgradeCostParams =
  | { type: TownHallUpgradeCostType.ArithmeticIncreasingStep, startCost: number, firstIncrease: number, increaseStep: number }
  | { type: TownHallUpgradeCostType.LinearIncreasing, startCost: number, increasePerLevel: number };

export interface TownHallUpgradeCostDefinition {
  resource: ResourceType;
  costParams: TownHallUpgradeCostParams;
}

export type TownHallUpgradeEffectParams =
  | { type: TownHallUpgradeEffectType.Additive, baseIncrease: number, additiveStep: number }
  | { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: number, additiveStep: number };

export interface TownHallUpgradeEffectDefinition {
  stat?: keyof HeroStats;
  globalEffectTarget?: GlobalEffectTarget;
  effectParams: TownHallUpgradeEffectParams;
}

export type TownHallUpgradeUnlockParams =
  | { type: TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel, upgradeId: string, level: number }
  | { type: TownHallUpgradeUnlockRequirementType.TotalResourceSpentOnPaths, resource: ResourceType, amount: number, onUpgradePaths: string[] }
  | { type: TownHallUpgradeUnlockRequirementType.BuildingLevel, buildingId: string, level: number }
  | { type: TownHallUpgradeUnlockRequirementType.HeroRecruited, heroDefinitionId: string };

export interface TownHallUpgradeUnlockRequirement {
  unlockParams: TownHallUpgradeUnlockParams;
}

export interface TownHallUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  costs: TownHallUpgradeCostDefinition[];
  effects: TownHallUpgradeEffectDefinition[];
  maxLevel: number;
  iconName: string;
  unlockRequirements: TownHallUpgradeUnlockRequirement[];
}
