
import { Cost } from '../common';
import { BattleHero, BattleEnemy } from './participants';
import { AttackEvent, BuildingLevelUpEventInBattle, DamagePopupInState } from './events'; 
import type { ICONS } from '../../components/Icons'; // For iconName type

export interface FusionAnchor {
  id: string; // targetParticipantId can be used as id
  targetParticipantId: string;
  totalAmount: number;
  lastUpdateTime: number;
  // isCritical: boolean; // Replaced
  lastCritTimestamp: number; // Timestamp of the last critical hit that contributed to this anchor
  anchorX: number; // Fixed relative X offset for the anchor position (e.g., center of card)
  anchorY: number; // Fixed relative Y offset for the anchor position (e.g., above card)
  xOffset?: number; // Optional horizontal offset for visual variety
  feederQueue: { amount: number; isCritical: boolean }[]; // Queue for pending feeder particles
  lastFeederSpawnTime: number; // Timestamp of the last feeder particle spawn from this anchor
}

export interface FeederParticle {
  id: string; // Unique ID for the particle
  targetAnchorId: string; // The ID of the FusionAnchor it is flying towards (targetParticipantId)
  amount: number; // Damage value of this specific particle
  timestamp: number; // Creation time (Date.now()) for animation timing
  isCritical: boolean; // If this specific particle represents a critical hit
}

export interface BattleState {
  waveNumber?: number; // Undefined for dungeon battles, or current step in custom sequence
  customWaveSequence?: string[]; 
  currentCustomWaveIndex?: number; 
  dungeonRunId?: string; 
  dungeonFloor?: number; 
  isDungeonBattle?: boolean; 
  heroes: BattleHero[];
  enemies: BattleEnemy[];
  battleLog: string[];
  status: 'IDLE' | 'PREPARING' | 'FIGHTING' | 'VICTORY' | 'DEFEAT'; 
  ticksElapsed: number;
  lastAttackEvents: AttackEvent[]; 
  damagePopups: DamagePopupInState[]; // For non-HP damage (Shields, Heals)
  fusionAnchors: FusionAnchor[]; // For aggregated HP damage display
  feederParticles: FeederParticle[]; // For individual HP damage numbers flying to anchors

  // Per-wave accumulators
  battleLootCollected: Cost[];
  defeatedEnemiesWithLoot: Record<string, { loot: Cost[], originalIconName: string, originalEnemyId: string }>; 
  battleExpCollected: number;
  buildingLevelUpEventsInBattle: BuildingLevelUpEventInBattle[];

  // Session-wide accumulators for cumulative display
  sessionTotalLoot: Cost[];
  sessionTotalExp: number;
  sessionTotalBuildingLevelUps: BuildingLevelUpEventInBattle[];

  activePotionIdForUsage: string | null; 
  isDungeonGridBattle?: boolean; 
  sourceGridCell?: { r: number; c: number } | null; 
  selectedTargetId?: string | null; 

  // Demonicon Specific
  isDemoniconBattle?: boolean;
  demoniconEnemyId?: string;
  demoniconRank?: number;

  // World Map Battle Origin
  sourceMapNodeId?: string; 
  stats: { 
    [participantId: string]: { 
      damageDealt: number;
      healingDone: number;
    };
  };
}

// --- EndOfBattleModal Summary Types ---
export interface BattleSummaryHeroPerformance {
  id: string;
  name: string;
  xpGained: number;
  didLevelUp: boolean;
  oldLevel?: number;
  newLevel?: number;
  totalDamageDealt: number;
  totalHealingDone: number;
}

export interface BattleSummaryResource {
  type: string; 
  amount: number;
  iconName?: keyof typeof ICONS; 
}

export interface BattleSummaryShard {
  id: string; 
  name: string; 
  iconName?: keyof typeof ICONS;
}

export interface BattleSummaryBuildingLevelUp {
  buildingId: string;
  buildingName?: string; 
  newLevel: number;
  iconName?: keyof typeof ICONS;
}

export interface BattleSummary {
  result: 'VICTORY' | 'DEFEAT';
  xpGained: number; 
  heroes: BattleSummaryHeroPerformance[];
  resourcesGained: BattleSummaryResource[];
  shardsGained: BattleSummaryShard[];
  buildingLevelUps: BattleSummaryBuildingLevelUp[];
  
  // Navigation context
  wasDungeonGridBattle?: boolean;
  wasDungeonBattle?: boolean; 
  sourceMapNodeId?: string;
  wasDemoniconBattle?: boolean;

  // Context for Retrying the battle
  waveNumberForRetry?: number;
  customWaveSequenceForRetry?: string[];
  currentCustomWaveIndexForRetry?: number;
  demoniconEnemyIdForRetry?: string;
  demoniconRankForRetry?: number;
}
