import { ResourceType, BuildingDefinition } from '../../types';

export const EXPLORERS_GUILD_DEFINITION: BuildingDefinition = {
  id: 'EXPLORERS_GUILD',
  name: "Explorer's Guild",
  description: "Unlocks the Shifting Catacombs and improves dungeon delving. Slowly produces Catacomb Blueprints.",
  baseCost: [
    { resource: ResourceType.GOLD, amount: 1000 },
    { resource: ResourceType.WOOD, amount: 300 },
    { resource: ResourceType.STONE, amount: 200 },
  ],
  costScalingFactor: 1.25,
  baseProduction: [{ resource: ResourceType.CATACOMB_BLUEPRINT, amountPerTick: 0.0006 }],
  productionScalingFactor: 1.05,
  maxLevel: 10,
  iconName: 'COMPASS',
  isProducer: true,
  isUtility: true,
  unlockWaveRequirement: 10,
};
