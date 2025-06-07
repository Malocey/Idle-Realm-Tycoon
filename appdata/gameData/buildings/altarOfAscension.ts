import { ResourceType, BuildingDefinition } from '../../types';

export const ALTAR_OF_ASCENSION_DEFINITION: BuildingDefinition = {
  id: 'ALTAR_OF_ASCENSION',
  name: 'Altar of Ascension',
  description: 'A mystical altar that hums with untapped potential. (Allows heroes to Ascend - Future Feature)',
  baseCost: [
    { resource: ResourceType.CRYSTALS, amount: 10000 },
    { resource: ResourceType.META_CURRENCY, amount: 10 },
    { resource: ResourceType.HEROIC_POINTS, amount: 50000 },
    { resource: ResourceType.GOLD, amount: 100000 },
  ],
  costScalingFactor: 1.8,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 5,
  iconName: 'UPGRADE',
  isUtility: true,
  unlockWaveRequirement: 20,
};
