
import { ResourceType, BuildingDefinition } from '../../types';

export const MAGE_TOWER_DEFINITION: BuildingDefinition = {
  id: 'MAGE_TOWER',
  name: 'Mage Tower',
  description: 'Produces Crystals. Unlocks and allows enhancements for hero energy shields.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 120 }, { resource: ResourceType.WOOD, amount: 60 }, { resource: ResourceType.STONE, amount: 40 }],
  costScalingFactor: 1.20,
  baseProduction: [{ resource: ResourceType.CRYSTALS, amountPerTick: 0.01 }],
  productionScalingFactor: 1.08,
  maxLevel: -1,
  iconName: 'WIZARD_HAT',
  isProducer: true,
  isUtility: true,
  unlockWaveRequirement: 7,
};