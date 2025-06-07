import { CellType } from '../enums';
import { Cost } from '../common';

export interface DungeonCell {
  type: CellType;
  isRevealed: boolean;
  isVisited: boolean; // Has the party stepped on this cell?
  enemyEncounterId?: string;
  lootData?: Cost[];
  shardLoot?: Array<{ definitionId: string; level: number; count: number }>;
  trapId?: string;
  eventId?: string;
  isTrapTriggered?: boolean; // So traps don't re-trigger
  isEventTriggered?: boolean; // So events don't re-trigger
}

export interface DungeonGridState {
  grid: DungeonCell[][];
  rows: number;
  cols: number;
  partyPosition: { r: number; c: number };
  dungeonDefinitionId: string; // To know which dungeon this grid belongs to
  currentFloor: number; // To know which floor this grid represents
}
