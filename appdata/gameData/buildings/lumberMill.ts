
import { ResourceType, BuildingDefinition } from '../../types';

export const LUMBER_MILL_DEFINITION: BuildingDefinition = {
  id: 'LUMBER_MILL',
  name: 'Lumber Mill',
  description: 'Produces Wood.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 40 }, { resource: ResourceType.STONE, amount: 10 }],
  costScalingFactor: 1.14,
  baseProduction: [{ resource: ResourceType.WOOD, amountPerTick: 0.04 }],
  productionScalingFactor: 1.07,
  maxLevel: -1,
  iconName: 'WOOD',
  isProducer: true,
  // unlockWaveRequirement: 4, // Removed
};
