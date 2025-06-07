
import { Cost } from '../common';
import { PermanentHeroBuff } from '../hero';
import { DungeonEncounterDefinition } from './encounter';
import { TrapDefinition } from './trap';
import { DungeonEventDefinition } from './event';
import { MapNode } from '../mapTypes';


export interface DungeonFloorDefinition {
  floorNumber: number; // 1-indexed for display, 0-indexed for array access
  enemies: DungeonEncounterDefinition[];
  floorName?: string;
  description?: string;
  modifiers?: Array<{ type: string; value: number }>; // E.g., { type: 'ENEMY_HP_MULTIPLIER', value: 1.2 }
  possibleTraps?: Array<{ definitionId: string; weight: number }>;
  possibleEvents?: Array<{ definitionId: string; weight: number }>;
  rows?: number; // Optional: Number of rows for this floor's grid
  cols?: number; // Optional: Number of columns for this floor's grid
  // bossEncounterId?: string; // If a specific boss encounter is guaranteed
}

export interface DungeonDefinition {
  id: string;
  name: string;
  description: string;
  entryCost: Cost[];
  tier: number; // For scaling difficulty/rewards, e.g., 1, 2, 3...
  minExplorerGuildLevel: number;
  floors: DungeonFloorDefinition[];
  finalReward: {
    resourceCache?: Cost[]; // Gold, materials, etc.
    permanentBuffChoices: number; // How many buffs to choose from
    // equipmentRewardIds?: string[]; // Future: Specific equipment pieces
  };
  possiblePermanentBuffs: Array<Omit<PermanentHeroBuff, 'description'>>; // Template for buffs
}

export interface WorldMapDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: MapNode[];
  entryNodeId: string;
}
