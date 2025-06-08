
import { Cost } from '../common';
import { BattleHero, BattleEnemy } from './participants';
import { AttackEvent, BuildingLevelUpEventInBattle } from './events';

export interface BattleState {
  waveNumber?: number; // Undefined for dungeon battles, or current step in custom sequence
  customWaveSequence?: string[]; // New: Array of WaveDefinition IDs for custom map battles
  currentCustomWaveIndex?: number; // New: Index for the current wave in customWaveSequence
  dungeonRunId?: string; // For dungeon battles
  dungeonFloor?: number; // For dungeon battles
  isDungeonBattle?: boolean; // True if it's a standard dungeon floor battle (not grid)
  heroes: BattleHero[];
  enemies: BattleEnemy[];
  battleLog: string[];
  status: 'IDLE' | 'PREPARING' | 'FIGHTING' | 'VICTORY' | 'DEFEAT'; // PREPARING used for Colosseum
  ticksElapsed: number;
  lastAttackEvents: AttackEvent[]; // Store the last few events for UI display
  
  // Per-wave accumulators
  battleLootCollected: Cost[];
  defeatedEnemiesWithLoot: Record<string, { loot: Cost[], originalIconName: string, originalEnemyId: string }>; // Keyed by uniqueBattleId
  battleExpCollected: number;
  buildingLevelUpEventsInBattle: BuildingLevelUpEventInBattle[]; 

  // Session-wide accumulators for cumulative display
  sessionTotalLoot: Cost[];
  sessionTotalExp: number;
  sessionTotalBuildingLevelUps: BuildingLevelUpEventInBattle[];

  activePotionIdForUsage: string | null; // Potion selected in BattleView to be used on a hero
  isDungeonGridBattle?: boolean; // True if the battle originated from a dungeon grid encounter
  sourceGridCell?: { r: number; c: number } | null; // Coordinates of the grid cell that triggered this battle
  selectedTargetId?: string | null; // Player-selected enemy target

  // Demonicon Specific
  isDemoniconBattle?: boolean;
  demoniconEnemyId?: string;
  demoniconRank?: number;

  // World Map Battle Origin
  sourceMapNodeId?: string; // ID of the MapNode that triggered this battle
}