import { ResourceType, BuildingDefinition } from '../../types';

export const AETHERIUM_SYNTHESIZER_DEFINITION: BuildingDefinition = {
  id: 'AETHERIUM_SYNTHESIZER',
  name: 'Aetherium Synthesizer',
  description: 'A complex device that slowly condenses Aetherium from ambient energies.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 250000 },
    { resource: ResourceType.CRYSTALS, amount: 15000 },
    { resource: ResourceType.IRON, amount: 10000 },
    { resource: ResourceType.META_CURRENCY, amount: 15 },
  ],
  costScalingFactor: 2.0,
  baseProduction: [{ resource: ResourceType.AETHERIUM, amountPerTick: 0.00002 }],
  productionScalingFactor: 1.12,
  maxLevel: 10,
  iconName: 'ATOM_ICON',
  isProducer: true,
  isUtility: false,
  unlockWaveRequirement: 25,
};
