
import { BuildingDefinition, ResourceType } from '../../types';

// Import individual building definitions
import { TOWN_HALL_DEFINITION } from './buildings/townHall';
import { GOLD_MINE_DEFINITION } from './buildings/goldMine';
import { LUMBER_MILL_DEFINITION } from './buildings/lumberMill';
import { STONE_QUARRY_DEFINITION } from './buildings/stoneQuarry';
import { FARM_DEFINITION } from './buildings/farm';
import { TANNERY_DEFINITION } from './buildings/tannery';
import { FORGE_DEFINITION } from './buildings/forge';
import { MAGE_TOWER_DEFINITION } from './buildings/mageTower';
import { GUILD_HALL_DEFINITION } from './buildings/guildHall';
import { EXPLORERS_GUILD_DEFINITION } from './buildings/explorersGuild';
import { ALCHEMISTS_LAB_DEFINITION } from './buildings/alchemistsLab';
import { LIBRARY_DEFINITION } from './buildings/library';
import { COLOSSEUM_DEFINITION } from './buildings/colosseum';
import { ALTAR_OF_ASCENSION_DEFINITION } from './buildings/altarOfAscension';
import { PLANETARY_MARKET_DEFINITION } from './buildings/planetaryMarket';
import { AETHERIUM_SYNTHESIZER_DEFINITION } from './buildings/aetheriumSynthesizer';
import { DEMONICON_GATE_DEFINITION } from './buildings/demoniconGate';
import { ALTAR_OF_CONVERGENCE_DEFINITION } from './buildings/altarOfConvergence';
import { ACADEMY_OF_SCHOLARS_DEFINITION } from './buildings/academyOfScholars';
import { KRIEGSAKADEMIE_DEFINITION } from './buildings/kriegsakademie'; // New

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
  'TOWN_HALL': TOWN_HALL_DEFINITION,
  'GOLD_MINE': GOLD_MINE_DEFINITION,
  'LUMBER_MILL': LUMBER_MILL_DEFINITION,
  'STONE_QUARRY': STONE_QUARRY_DEFINITION,
  'FARM': FARM_DEFINITION,
  'TANNERY': TANNERY_DEFINITION,
  'FORGE': FORGE_DEFINITION,
  'MAGE_TOWER': MAGE_TOWER_DEFINITION,
  'GUILD_HALL': GUILD_HALL_DEFINITION,
  'EXPLORERS_GUILD': EXPLORERS_GUILD_DEFINITION,
  'ALCHEMISTS_LAB': ALCHEMISTS_LAB_DEFINITION,
  'LIBRARY': LIBRARY_DEFINITION,
  'COLOSSEUM': COLOSSEUM_DEFINITION,
  'ALTAR_OF_ASCENSION': ALTAR_OF_ASCENSION_DEFINITION,
  'PLANETARY_MARKET': PLANETARY_MARKET_DEFINITION,
  'AETHERIUM_SYNTHESIZER': AETHERIUM_SYNTHESIZER_DEFINITION,
  'DEMONICON_GATE': DEMONICON_GATE_DEFINITION,
  'ALTAR_OF_CONVERGENCE': ALTAR_OF_CONVERGENCE_DEFINITION,
  'ACADEMY_OF_SCHOLARS': ACADEMY_OF_SCHOLARS_DEFINITION,
  'KRIEGSAKADEMIE': KRIEGSAKADEMIE_DEFINITION, // New
};
