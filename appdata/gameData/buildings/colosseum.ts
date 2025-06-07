import { ResourceType, BuildingDefinition } from '../../types';

export const COLOSSEUM_DEFINITION: BuildingDefinition = {
  id: 'COLOSSEUM',
  name: 'Colosseum',
  description: 'Engage in thrilling action battles, directly controlling one hero while others fight automatically.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 5000 },
    { resource: ResourceType.STONE, amount: 2000 },
    { resource: ResourceType.IRON, amount: 500 }
  ],
  costScalingFactor: 1.8,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 1,
  iconName: 'COLOSSEUM_ICON',
  isUtility: true,
  unlockWaveRequirement: 15,
};
