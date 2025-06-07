import { ResourceType, BuildingDefinition } from '../../types';

export const GOLD_MINE_DEFINITION: BuildingDefinition = {
  id: 'GOLD_MINE',
  name: 'Gold Mine',
  description: 'Produces Gold. Contains an excavation minigame.',
  baseCost: [{ resource: ResourceType.WOOD, amount: 40 }, { resource: ResourceType.STONE, amount: 20 }],
  costScalingFactor: 1.15,
  baseProduction: [{ resource: ResourceType.GOLD, amountPerTick: 0.04 }],
  productionScalingFactor: 1.07,
  maxLevel: -1,
  iconName: 'GOLD',
  isProducer: true,
  unlockWaveRequirement: 3,
  hasMinigame: true, // Added this flag
};
