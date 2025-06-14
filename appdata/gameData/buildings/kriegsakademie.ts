
import { ResourceType, BuildingDefinition } from '../../types';

export const WAR_ACADEMY_DEFINITION: BuildingDefinition = {
  id: 'WAR_ACADEMY', // Changed from KRIEGSAKADEMIE
  name: 'War Academy', // Changed from Kriegsakademie
  description: 'Accesses the Auto-Battler Minigame and manages building card decks.', // Updated description
  baseCost: [
    { resource: ResourceType.GOLD, amount: 2000 },
    { resource: ResourceType.WOOD, amount: 500 },
    { resource: ResourceType.STONE, amount: 750 },
    { resource: ResourceType.IRON, amount: 100 },
  ],
  costScalingFactor: 1.0,
  baseProduction: [],
  productionScalingFactor: 1.0,
  maxLevel: 1,
  iconName: 'FIGHT',
  isUtility: true,
  unlockWaveRequirement: 10,
};
