
import { ResourceType, BuildingDefinition } from '../../types';

export const STONE_QUARRY_DEFINITION: BuildingDefinition = {
  id: 'STONE_QUARRY',
  name: 'Stone Quarry',
  description: 'Produces Stone. Contains an excavation minigame.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 60 }, { resource: ResourceType.WOOD, amount: 15 }],
  costScalingFactor: 1.16,
  baseProduction: [{ resource: ResourceType.STONE, amountPerTick: 0.03 }],
  productionScalingFactor: 1.07,
  maxLevel: -1,
  iconName: 'STONE',
  isProducer: true,
  // unlockWaveRequirement: 5, // Entfernt
  hasMinigame: true,
};
