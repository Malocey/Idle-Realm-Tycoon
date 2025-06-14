
import { ResourceType, ActiveView } from './enums'; // Added ActiveView
import { GameNotification, Cost } from './common';
import { PlayerBuildingState } from './building';
import { PlayerHeroState, PlayerSharedSkillsState } from './hero';
import { BattleState, BuildingLevelUpEventInBattle, BattleHero } from './battle';
import { GameAction } from './gameActions';
import { DungeonRunState, DungeonGridState } from './dungeon';
import { CraftingQueueItem } from './crafting';
import { PlayerQuest } from './quests';
import { StoneQuarryMinigameState, GoldMineMinigameState } from './minigame';
import { ActionBattleState } from './actionBattle';
import { HeroStats } from './hero';
import { ResonanceMoteType } from './aethericResonanceTypes';
import { ResearchProgress, CompletedResearchEntry } from './research';
import { AutoBattlerState } from './autoBattler'; // New import

export type ActionBattleAISystem = 'legacy' | 'behaviorTree';

export interface ActiveDemoniconChallenge {
  enemyId: string;
  currentRank: number;
  persistedHeroStatesInRun: Record<string, { 
    level: number;
    currentExp: number;
    expToNextLevel: number;
    skillPoints: number;
    currentHpForNextRank: number; 
    currentManaForNextRank: number; 
    cooldownsForNextRank: Record<string, number>; 
  }>;
  lootThisRun: Cost[]; 
  xpThisRun: number;   
}

export interface MapPoiCompletionStatus {
  archer_unlocked_verdant_plains?: boolean;
  lumber_mill_blueprint_obtained?: boolean;
  farm_blueprint_obtained?: boolean;       
  damaged_gold_mine_access_granted?: boolean; 
  tannery_blueprint_obtained?: boolean; 
  stone_quarry_blueprint_obtained?: boolean; 
  goblin_camp_early_battle_won?: boolean;
  gold_mine_access_battle_battle_won?: boolean; 
  tannery_guardians_battle_won?: boolean; 
  stone_quarry_guards_battle_won?: boolean; 
  gold_mine_blueprint_obtained?: boolean; 
  demonicon_gate_unlocked?: boolean; 
  ww_cleric_rescue_poi_completed?: boolean;
  ww_depths_optional_poi_1_collected?: boolean; 
  [key: string]: boolean | undefined; 
}

export interface PerMapState {
  playerCurrentNodeId: string;
  revealedMapNodeIds: string[];
  mapPoiCompletionStatus: MapPoiCompletionStatus;
}

export interface AccountXpGainEvent {
  id: string; 
  timestamp: number;
  amount: number;
  source: string; 
}

export interface LastAppliedResonanceMoteInfo {
  statId: keyof HeroStats;
  qualityName: 'Resonance Shard' | 'Clear Core' | 'Potent Focus'; 
  isPercentage: boolean;
  bonusValue: number;
  timestamp: number;
}

export interface GameState {
  resources: Record<ResourceType, number>;
  buildings: PlayerBuildingState[];
  heroes: PlayerHeroState[];
  unlockedHeroDefinitions: string[];
  currentWaveProgress: number;
  activeView: ActiveView; // Use ActiveView enum/type
  battleState: BattleState | null;
  activeDungeonRun: DungeonRunState | null;
  activeDungeonGrid: DungeonGridState | null;
  actionBattleState: ActionBattleState | null;
  lastTickTimestamp: number;
  gameSpeed: number;
  notifications: GameNotification[];
  totalTownXp: number;
  townHallUpgradeLevels: Record<string, number>;
  buildingSpecificUpgradeLevels: Record<string, Record<string, number>>;
  guildHallUpgradeLevels: Record<string, number>;
  totalGoldSpentOnTownHallPaths: number;
  buildingLevelUpEvents: Record<string, { timestamp: number }>;
  potions: Record<string, number>; 
  craftingQueue: CraftingQueueItem[];
  permanentPotionCraftCounts: Record<string, number>; 
  justFusedShardInstanceId?: string | null;
  activeQuests: PlayerQuest[];
  unlockedRunBuffs: string[];
  runBuffLibraryLevels: Record<string, number>;
  godModeActive: boolean;
  stoneQuarryMinigame: StoneQuarryMinigameState | null;
  goldMineMinigame: GoldMineMinigameState | null;
  playerSharedSkillPoints: number;
  playerSharedSkills: PlayerSharedSkillsState;
  actionBattleAISystem: ActionBattleAISystem;
  currentMapId: string;
  playerCurrentNodeId: string;
  revealedMapNodeIds: string[]; 
  mapPoiCompletionStatus: MapPoiCompletionStatus; 
  mapStates: Record<string, PerMapState>; 
  defeatedEnemyTypes: string[];
  demoniconHighestRankCompleted: Record<string, number>;
  activeDemoniconChallenge: ActiveDemoniconChallenge | null;
  globalDemoniconLevel: number;
  globalDemoniconXP: number;
  expToNextGlobalDemoniconLevel: number;
  achievedDemoniconMilestoneRewards: string[];
  accountLevel: number;
  accountXP: number;
  expToNextAccountLevel: number;
  firstTimeEnemyDefeatsAccountXP: string[];
  accountXpHistory: AccountXpGainEvent[];
  achievedBuildingLevelAccXpThresholds: Record<string, number[]>;
  aethericResonanceBonuses: Partial<Record<keyof HeroStats, { percentage: number; flat: number }>>;
  resonanceMotes: Partial<Record<keyof HeroStats, { faint: number; clear: number; potent: number }>>;
  lastAppliedResonanceMote: LastAppliedResonanceMoteInfo | null;
  researchProgress: Record<string, ResearchProgress>; 
  completedResearch: Record<string, CompletedResearchEntry>; 
  researchSlots: number;
  researchQueue: Array<{ researchId: string; levelToResearch: number }>;
  autoBattler: AutoBattlerState | null; // New state for Auto-Battler

  _battleCombatTickResult?: { newlyAddedToFirstTimeDefeatsForAccXp?: string[] };
  _deferredCombatActions?: GameAction[];
}
