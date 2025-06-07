
import { HERO_XP_PER_LEVEL_BASE, HERO_XP_PER_LEVEL_FACTOR } from '../constants';
import { Cost, Resources, ResourceType } from '../types';

export const getExpToNextHeroLevel = (level: number): number => {
  return Math.floor(HERO_XP_PER_LEVEL_BASE * Math.pow(HERO_XP_PER_LEVEL_FACTOR, level - 1));
};

export const calculateRunExpToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.3, level - 1));
};

interface CalculateMaxAffordableLevelsArgs {
  currentLevel: number;
  maxLevel: number; // Max level defined by the item/skill itself (-1 for infinite)
  maxIterations?: number;
  currentMainResources: Resources;
  getMainResourceCostForNextLevel: (currentSimulatedLevel: number) => Cost[];
  secondaryResource?: {
    name: string; // e.g., "Skill Points" or "Heroic Points"
    currentValue: number;
    getCostForNextLevel: (currentSimulatedLevel: number) => number;
    tempResourceTypeForTotalCost: ResourceType;
  };
  forgeLevelCap?: number; // New: The level cap imposed by the Forge
}

interface CalculateMaxAffordableLevelsResult {
  levels: number;
  totalCost: Cost[];
}

export const calculateMaxAffordableLevels = (
  args: CalculateMaxAffordableLevelsArgs
): CalculateMaxAffordableLevelsResult => {
  const {
    currentLevel,
    maxLevel, // Item's own max level
    maxIterations = 100,
    currentMainResources,
    getMainResourceCostForNextLevel,
    secondaryResource,
    forgeLevelCap, // The Forge's current level, acting as a cap
  } = args;

  let affordableLevels = 0;
  const cumulativeCostItems: { [key in ResourceType]?: number } = {};
  
  let tempMainResources = { ...currentMainResources };
  let tempSecondaryResourceValue = secondaryResource?.currentValue;
  let currentSimulatedLevel = currentLevel;

  // Determine the effective maximum level for this calculation
  let effectiveMaxLevelForCalc: number;
  if (maxLevel === -1) { // Item has no defined max level
    effectiveMaxLevelForCalc = forgeLevelCap !== undefined ? forgeLevelCap : currentLevel + maxIterations;
  } else { // Item has a defined max level
    effectiveMaxLevelForCalc = forgeLevelCap !== undefined ? Math.min(maxLevel, forgeLevelCap) : maxLevel;
  }
  
  // The loop should not exceed the iteration cap, nor the effective max level.
  const iterationLimit = Math.min(maxIterations, effectiveMaxLevelForCalc - currentLevel);


  for (let i = 0; i < iterationLimit; i++) {
    // Ensure we don't try to upgrade beyond the effective cap derived from item's maxLevel and forgeLevelCap
    if (currentSimulatedLevel >= effectiveMaxLevelForCalc) break;

    const mainResourceCosts = getMainResourceCostForNextLevel(currentSimulatedLevel);
    let secondaryCostAmount = 0;
    if (secondaryResource) {
      secondaryCostAmount = secondaryResource.getCostForNextLevel(currentSimulatedLevel);
    }

    let canAffordThisLevel = true;
    for (const costItem of mainResourceCosts) {
      if ((tempMainResources[costItem.resource] || 0) < costItem.amount) {
        canAffordThisLevel = false;
        break;
      }
    }
    if (canAffordThisLevel && secondaryResource && tempSecondaryResourceValue !== undefined) {
      if (tempSecondaryResourceValue < secondaryCostAmount) {
        canAffordThisLevel = false;
      }
    }

    if (canAffordThisLevel) {
      mainResourceCosts.forEach(costItem => {
        tempMainResources[costItem.resource] = (tempMainResources[costItem.resource] || 0) - costItem.amount;
        cumulativeCostItems[costItem.resource] = (cumulativeCostItems[costItem.resource] || 0) + costItem.amount;
      });
      if (secondaryResource && tempSecondaryResourceValue !== undefined) {
        tempSecondaryResourceValue -= secondaryCostAmount;
        cumulativeCostItems[secondaryResource.tempResourceTypeForTotalCost] = 
          (cumulativeCostItems[secondaryResource.tempResourceTypeForTotalCost] || 0) + secondaryCostAmount;
      }
      
      affordableLevels++;
      currentSimulatedLevel++;
    } else {
      break; 
    }
  }

  const totalCostArray: Cost[] = (Object.keys(cumulativeCostItems) as ResourceType[]).map(resType => ({
      resource: resType,
      amount: cumulativeCostItems[resType]!
  }));
  
  return { levels: affordableLevels, totalCost: totalCostArray };
};