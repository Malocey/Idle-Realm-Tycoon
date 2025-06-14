
import { AutoBattlerBuildingCard, AutoBattlerBuildingType } from '../types';

export const AUTOBATTLER_CARD_DEFINITIONS: Record<string, AutoBattlerBuildingCard> = {
  FARM_CARD: {
    id: 'AB_FARM_CARD',
    name: 'Farm Card',
    buildingType: AutoBattlerBuildingType.FARM,
    cost: 50,
  },
  BARRACKS_CARD: {
    id: 'AB_BARRACKS_CARD',
    name: 'Barracks Card',
    buildingType: AutoBattlerBuildingType.BARRACKS,
    cost: 100,
    producesUnitId: 'SOLDIER', 
    productionTimeMs: 5000, // Updated to 5 seconds
  },
  WINDMILL_CARD: {
    id: 'AB_WINDMILL_CARD',
    name: 'Windmill Card',
    buildingType: AutoBattlerBuildingType.WINDMILL,
    cost: 75,
  },
  // Add more card definitions as needed
};
