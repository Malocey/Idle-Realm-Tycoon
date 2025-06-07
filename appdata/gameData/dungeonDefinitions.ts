
import { DungeonDefinition } from '../types';

// Import individual dungeon definitions
import { SHIFTING_CATACOMBS_T1_DEFINITION } from './dungeons/shiftingCatacombsT1';
import { DEEPER_CATACOMBS_T2_DEFINITION } from './dungeons/deeperCatacombsT2';
import { OBSIDIAN_CITADEL_T3_DEFINITION } from './dungeons/obsidianCitadelT3'; // Added import

export const DUNGEON_DEFINITIONS: Record<string, DungeonDefinition> = {
    "SHIFTING_CATACOMBS_T1": SHIFTING_CATACOMBS_T1_DEFINITION,
    "DEEPER_CATACOMBS_T2": DEEPER_CATACOMBS_T2_DEFINITION,
    "OBSIDIAN_CITADEL_T3": OBSIDIAN_CITADEL_T3_DEFINITION, // Added to the record
};
