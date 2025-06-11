
import { ResourceType, BuildingDefinition } from '../../types';

export const ALTAR_OF_CONVERGENCE_DEFINITION: BuildingDefinition = {
  id: 'ALTAR_OF_CONVERGENCE',
  name: 'Altar of Convergence', // Englischer Name
  description: 'A mystical altar where collected Resonance Motes can be infused to permanently enhance global hero stats.', // Englische Beschreibung
  baseCost: [
    { resource: ResourceType.GOLD, amount: 1200 },
    { resource: ResourceType.STONE, amount: 500 },
    { resource: ResourceType.CRYSTALS, amount: 75 },
  ],
  costScalingFactor: 1.0, // Not upgradeable in this version
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 1, // Only buildable once
  iconName: 'ATOM_ICON', // Placeholder, could be a more specific altar icon
  isUtility: true,
  unlockWaveRequirement: 7, // Relatively early unlock
};
