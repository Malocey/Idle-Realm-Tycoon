import { ResourceType, BuildingDefinition } from '../../types';

export const FORGE_DEFINITION: BuildingDefinition = {
  id: 'FORGE',
  name: 'Forge',
  description: 'Refines Iron Ore. Allows equipment upgrades and crafting Catacomb Keys.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 120 }, { resource: ResourceType.STONE, amount: 60 }],
  costScalingFactor: 1.35,
  baseProduction: [
    { resource: ResourceType.IRON, amountPerTick: 0.01 },
  ],
  productionScalingFactor: 1.08,
  maxLevel: -1,
  iconName: 'ANVIL',
  isProducer: true,
  isUtility: true,
  unlockWaveRequirement: 8,
};
