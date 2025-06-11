
import { WorldMapDefinition } from '../../types'; // Adjusted path
import { VERDANT_PLAINS_MAP } from './verdantPlainsMap';
import { WHISPERING_WOODS_MAP } from './whisperingWoodsMap'; 
import { BURNING_DESERT_MAP } from './burningDesertMap';
import { FROZEN_PEAKS_MAP } from './frozenPeaksMap';
import { GOLD_MINE_DEPTHS_MAP } from './verdantPlainsGoldMineDepths'; 
import { STONE_QUARRY_EXCAVATION_MAP } from './verdantPlainsStoneQuarryExcavation'; 
import { WISPERING_WOODS_PATH_EDGE_MAP } from './WisperingWoodsPathEdgeMap'; 
import { WHISPERING_WOODS_DEPTHS_MAP } from './WhisperingWoodsDepthsMap'; 
import { VERDANT_PLAINS_TANNERY_OUTPOST_MAP } from './verdantPlainsTanneryOutpost'; 

export const worldMapDefinitions: Record<string, WorldMapDefinition> = {
  [VERDANT_PLAINS_MAP.id]: VERDANT_PLAINS_MAP,
  [WHISPERING_WOODS_MAP.id]: WHISPERING_WOODS_MAP, 
  [WISPERING_WOODS_PATH_EDGE_MAP.id]: WISPERING_WOODS_PATH_EDGE_MAP, 
  [WHISPERING_WOODS_DEPTHS_MAP.id]: WHISPERING_WOODS_DEPTHS_MAP, 
  [BURNING_DESERT_MAP.id]: BURNING_DESERT_MAP,
  [FROZEN_PEAKS_MAP.id]: FROZEN_PEAKS_MAP,
  [GOLD_MINE_DEPTHS_MAP.id]: GOLD_MINE_DEPTHS_MAP, 
  [STONE_QUARRY_EXCAVATION_MAP.id]: STONE_QUARRY_EXCAVATION_MAP, 
  [VERDANT_PLAINS_TANNERY_OUTPOST_MAP.id]: VERDANT_PLAINS_TANNERY_OUTPOST_MAP, 
};
