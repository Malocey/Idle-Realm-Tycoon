
import { WorldMapDefinition } from '../../types'; // Adjusted path
import { VERDANT_PLAINS_MAP } from './verdantPlainsMap';
import { WHISPERING_WOODS_MAP } from './whisperingWoodsMap';
import { BURNING_DESERT_MAP } from './burningDesertMap';
import { FROZEN_PEAKS_MAP } from './frozenPeaksMap';

export const worldMapDefinitions: Record<string, WorldMapDefinition> = {
  [VERDANT_PLAINS_MAP.id]: VERDANT_PLAINS_MAP,
  [WHISPERING_WOODS_MAP.id]: WHISPERING_WOODS_MAP,
  [BURNING_DESERT_MAP.id]: BURNING_DESERT_MAP,
  [FROZEN_PEAKS_MAP.id]: FROZEN_PEAKS_MAP,
};
