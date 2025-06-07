import { ResourceType, BuildingDefinition } from '../../types';

export const LIBRARY_DEFINITION: BuildingDefinition = {
  id: 'LIBRARY',
  name: 'Library',
  description: 'Research ancient texts to permanently enhance dungeon run buffs and unlock new ones.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 3000 },
    { resource: ResourceType.WOOD, amount: 1000 },
    { resource: ResourceType.CRYSTALS, amount: 100 },
  ],
  costScalingFactor: 1.4,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 5,
  iconName: 'BOOK_ICON',
  isUtility: true,
  unlockWaveRequirement: 12,
};
