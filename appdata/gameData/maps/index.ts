// appdata/gameData/maps/index.ts
export * from './verdantPlains';
export * from './whisperingWoods';
export * from './burningDesertMap';
export * from './frozenPeaksMap';

// Wichtig: Sicherstellen, dass WorldMapDefinition hier korrekt referenziert wird, falls es für andere Typen benötigt wird.
// In der Regel sollten die spezifischen Kartenexporte aus den Sub-Barrel-Dateien ausreichen.
// Exportiere worldMapDefinitions, wenn es eine Sammlung aller Map-Definitionen ist,
// die an anderer Stelle direkt als Objekt benötigt wird.
import { VERDANT_PLAINS_MAP } from './verdantPlains/verdantPlainsMap';
import { WHISPERING_WOODS_MAP } from './whisperingWoods/whisperingWoodsMap';
import { WISPERING_WOODS_PATH_EDGE_MAP } from './whisperingWoods/WisperingWoodsPathEdgeMap';
import { WHISPERING_WOODS_DEPTHS_MAP } from './whisperingWoods/WhisperingWoodsDepthsMap';
import { BURNING_DESERT_MAP } from './burningDesertMap';
import { FROZEN_PEAKS_MAP } from './frozenPeaksMap';
import { GOLD_MINE_DEPTHS_MAP } from './verdantPlains/verdantPlainsGoldMineDepths';
import { STONE_QUARRY_EXCAVATION_MAP } from './verdantPlains/verdantPlainsStoneQuarryExcavation';
import { VERDANT_PLAINS_TANNERY_OUTPOST_MAP } from './verdantPlains/verdantPlainsTanneryOutpost';
import { VERDANT_PLAINS_LUMBER_MILL_SITE_MAP } from './verdantPlains/verdantPlainsLumberMillSite';
import { VERDANT_PLAINS_FARMSTEAD_RUINS_MAP } from './verdantPlains/verdantPlainsFarmsteadRuins';
import { WorldMapDefinition } from '../../types';

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
  [VERDANT_PLAINS_LUMBER_MILL_SITE_MAP.id]: VERDANT_PLAINS_LUMBER_MILL_SITE_MAP,
  [VERDANT_PLAINS_FARMSTEAD_RUINS_MAP.id]: VERDANT_PLAINS_FARMSTEAD_RUINS_MAP,
};
