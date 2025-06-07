import { ResourceType, BuildingDefinition } from '../../types';

export const TANNERY_DEFINITION: BuildingDefinition = {
  id: 'TANNERY',
  name: 'Tannery',
  description: 'Processes hides into leather, a vital material for crafting.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 80 }, { resource: ResourceType.WOOD, amount: 40 }],
  costScalingFactor: 1.17,
  baseProduction: [{ resource: ResourceType.LEATHER, amountPerTick: 0.02 }],
  productionScalingFactor: 1.07,
  maxLevel: -1,
  iconName: 'LEATHER',
  isProducer: true,
  unlockWaveRequirement: 5,
};
