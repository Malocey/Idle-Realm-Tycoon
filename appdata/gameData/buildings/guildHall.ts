import { ResourceType, BuildingDefinition } from '../../types';

export const GUILD_HALL_DEFINITION: BuildingDefinition = {
  id: 'GUILD_HALL',
  name: 'Guild Hall',
  description: 'A place for heroes to gather and unlock powerful guild-specific advantages. Enables advanced Town Hall upgrades and Guild Upgrades.',
  baseCost: [
    { resource: ResourceType.GOLD, amount: 2000 },
    { resource: ResourceType.WOOD, amount: 500 },
    { resource: ResourceType.STONE, amount: 500 },
    { resource: ResourceType.CRYSTALS, amount: 50 }
  ],
  costScalingFactor: 1.5,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 5,
  iconName: 'HERO',
  isUtility: true,
  unlockWaveRequirement: 8,
};
