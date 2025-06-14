
import { ResourceType, BuildingDefinition } from '../../types';

export const KRIEGSAKADEMIE_DEFINITION: BuildingDefinition = {
  id: 'KRIEGSAKADEMIE',
  name: 'Kriegsakademie',
  description: 'Accesses the Auto-Battler Minigame and manages building card decks.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 2000 },
    { resource: ResourceType.WOOD, amount: 500 },
    { resource: ResourceType.STONE, amount: 750 },
    { resource: ResourceType.IRON, amount: 100 },
  ],
  costScalingFactor: 1.0, // Likely non-upgradable or has different upgrade mechanics
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 1, // Only buildable once for access
  iconName: 'FIGHT', // Placeholder, could be a crossed swords or shield icon
  isUtility: true,
  unlockWaveRequirement: 10, // Example unlock requirement
};
