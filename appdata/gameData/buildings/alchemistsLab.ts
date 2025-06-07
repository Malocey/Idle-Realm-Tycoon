import { ResourceType, BuildingDefinition } from '../../types';

export const ALCHEMISTS_LAB_DEFINITION: BuildingDefinition = {
  id: 'ALCHEMISTS_LAB',
  name: 'Alchemist\'s Lab',
  description: 'Allows brewing of powerful potions to aid heroes in battle.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 1500 },
    { resource: ResourceType.WOOD, amount: 400 },
    { resource: ResourceType.STONE, amount: 300 },
    { resource: ResourceType.CRYSTALS, amount: 20 },
  ],
  costScalingFactor: 1.3,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 5,
  iconName: 'STAFF_ICON',
  isUtility: true,
  unlockWaveRequirement: 7,
};
