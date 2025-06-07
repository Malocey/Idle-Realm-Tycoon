
import { ResourceType, BuildingDefinition } from '../../types';

export const DEMONICON_GATE_DEFINITION: BuildingDefinition = {
  id: 'DEMONICON_GATE',
  name: 'Demonicon Gate',
  description: 'A mysterious portal that allows heroes to challenge echoes of defeated foes for unique rewards.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 100 }], // Test cost
  costScalingFactor: 1.0, // Not upgradeable in this version
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 1, // Only needs to be built once
  iconName: 'ENEMY', // Placeholder, consider a unique portal icon
  isUtility: true,
  unlockWaveRequirement: 0, // Available from the start for testing
};
