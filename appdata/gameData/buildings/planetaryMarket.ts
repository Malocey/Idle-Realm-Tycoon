import { ResourceType, BuildingDefinition } from '../../types';

export const PLANETARY_MARKET_DEFINITION: BuildingDefinition = {
  id: 'PLANETARY_MARKET',
  name: 'Interdimensional Exchange',
  description: 'Connects to markets beyond this realm, allowing resource trading. (Trading - Future Feature)',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 75000 },
    { resource: ResourceType.CRYSTALS, amount: 5000 },
    { resource: ResourceType.META_CURRENCY, amount: 5 },
  ],
  costScalingFactor: 1.7,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 3,
  iconName: 'GOLD',
  isUtility: true,
  unlockWaveRequirement: 22,
};
