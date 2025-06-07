import { ResourceType, BuildingDefinition } from '../../types';

export const TOWN_HALL_DEFINITION: BuildingDefinition = {
  id: 'TOWN_HALL',
  name: 'Town Hall',
  description: 'Generates Town XP. Allows recruiting heroes and global upgrades.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 150 }, { resource: ResourceType.WOOD, amount: 75 }, { resource: ResourceType.STONE, amount: 75 }],
  costScalingFactor: 1.3,
  baseProduction: [
    { resource: ResourceType.TOWN_XP, amountPerTick: 0.04 }, // 0.5 * 0.08
  ],
  productionScalingFactor: 1.10,
  maxLevel: 10,
  iconName: 'BUILDING',
  isProducer: true,
  isUtility: true,
  unlockWaveRequirement: 0,
};
