import { ResourceType, BuildingDefinition } from '../../types';

export const FARM_DEFINITION: BuildingDefinition = {
  id: 'FARM',
  name: 'Farm',
  description: 'Produces Food.',
  baseCost: [{ resource: ResourceType.WOOD, amount: 25 }, { resource: ResourceType.GOLD, amount: 25 }],
  costScalingFactor: 1.13,
  baseProduction: [{ resource: ResourceType.FOOD, amountPerTick: 0.03 }],
  productionScalingFactor: 1.07,
  maxLevel: -1,
  iconName: 'FOOD',
  isProducer: true,
  unlockWaveRequirement: 6,
};
