
import { ResourceType, BuildingDefinition } from '../../types';

export const DEMONICON_GATE_DEFINITION: BuildingDefinition = {
  id: 'DEMONICON_GATE',
  name: 'Demonicon Gate',
  description: 'A mysterious portal that allows heroes to challenge echoes of defeated foes for unique rewards.',
  baseCost: [{ resource: ResourceType.GOLD, amount: 10000 }, { resource: ResourceType.CRYSTALS, amount: 500 }, { resource: ResourceType.AETHERIUM, amount: 5 }],
  costScalingFactor: 1.0,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 1,
  iconName: 'ENEMY',
  isUtility: true,
  // unlockWaveRequirement is now handled by map POI completion ('demonicon_gate_unlocked' on whispering_woods)
};
