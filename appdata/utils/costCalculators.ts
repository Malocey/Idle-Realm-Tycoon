
import {
    Resources, Cost, BuildingDefinition,
    TownHallUpgradeCostDefinition, TownHallUpgradeCostType
} from '../types';

export const calculateBuildingUpgradeCost = (def: BuildingDefinition, level: number): Cost[] => {
  return def.baseCost.map(cost => ({
    ...cost,
    amount: Math.floor(cost.amount * Math.pow(def.costScalingFactor, level - 1))
  }));
};

export const calculateGenericUpgradeCostValue = (costDef: TownHallUpgradeCostDefinition, targetLevel: number): number => {
  const params = costDef.costParams;
  let costAmount = 0;
  if (targetLevel <= 0) return 0;
  switch (params.type) {
    case TownHallUpgradeCostType.ArithmeticIncreasingStep:
      if (targetLevel === 1) {
        costAmount = params.startCost;
      } else {
            costAmount = params.startCost;
            if (targetLevel > 1) {
                 costAmount += (targetLevel - 1) * params.firstIncrease;
                 if (targetLevel > 2) {
                     costAmount += params.increaseStep * (targetLevel - 2) * (targetLevel - 1) / 2;
                 }
            }
        }
      break;
    case TownHallUpgradeCostType.LinearIncreasing:
      costAmount = params.startCost + (targetLevel - 1) * params.increasePerLevel;
      break;
  }
  return Math.floor(Math.max(0, costAmount));
};

export const calculateTownHallUpgradeCostValue = calculateGenericUpgradeCostValue;
export const calculateBuildingSpecificUpgradeCostValue = calculateGenericUpgradeCostValue;
export const calculateGuildHallUpgradeCostValue = calculateGenericUpgradeCostValue;

export const canAfford = (resources: Resources, costs: Cost[]): boolean => {
  return costs.every(cost => (resources[cost.resource] || 0) >= cost.amount);
};
