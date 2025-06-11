
import { ResourceType, BuildingDefinition } from '../../types';

export const ACADEMY_OF_SCHOLARS_DEFINITION: BuildingDefinition = {
  id: 'ACADEMY_OF_SCHOLARS',
  name: 'Academy of Scholars',
  description: 'Enables research of powerful technologies to advance your realm. Passively generates Research Points.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 5000 },
    { resource: ResourceType.WOOD, amount: 2000 },
    { resource: ResourceType.STONE, amount: 2000 },
    { resource: ResourceType.CRYSTALS, amount: 100 },
  ],
  costScalingFactor: 1.8, // Example, if upgradable
  baseProduction: [{ resource: ResourceType.RESEARCH_POINTS, amountPerTick: 0.002 }], // 0.1 RP/sec at 20ms tick
  productionScalingFactor: 1.15, // Example scaling if upgradable
  maxLevel: 5, // Example, level could increase research slots or speed
  iconName: 'BOOK_ICON',
  isProducer: true,
  isUtility: true,
  unlockWaveRequirement: 10,
};
