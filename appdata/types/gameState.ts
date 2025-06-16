
import { ResourceType } from './enums';
import { GameNotification, Cost } from './common'; // Added Cost import
import { PlayerBuildingState } from './building';
import { PlayerHeroState, PlayerSharedSkillsState } from './hero'; // Added PlayerSharedSkillsState
import { BattleState, BuildingLevelUpEventInBattle, BattleHero } from './battle'; // Added BattleHero
import { GameAction } from './gameActions'; // Corrected import path
import { DungeonRunState, DungeonGridState } from './dungeon';
import { CraftingQueueItem } from './crafting';
import { PlayerQuest } from './quests';
import { StoneQuarryMinigameState, GoldMineMinigameState } from './minigame'; // Added GoldMineMinigameState
import { ActionBattleState } from './actionBattle';
import { HeroStats } from './hero'; // Added HeroStats
import { ResonanceMoteType } from './aethericResonanceTypes'; // Import ResonanceMoteType
import { ResearchProgress, CompletedResearchEntry } from './research';
<<<<<<< Updated upstream
=======
import { AutoBattlerState } from './autoBattler'; 
>>>>>>> Stashed changes

export type ActionBattleAISystem = 'legacy' | 'behaviorTree';

export interface ActiveDemoniconChallenge {
  enemyId: string;
  currentRank: number;
  persistedHeroStatesInRun: Record<string, { // Keyed by heroDefinitionId
    level: number;
    currentExp: number;
    expToNextLevel: number;
    skillPoints: number;
    currentHpForNextRank: number; // HP to start the next rank with
    currentManaForNextRank: number; // Mana to start the next rank with
    cooldownsForNextRank: Record<string, number>; // Cooldowns to start the next rank with
  }>;
  lootThisRun: Cost[]; // For run summary if abandoned, not main loot
  xpThisRun: number;   // Total HERO EXP gained by heroes this run (for UI summary)
}

export interface PerMapState {
  playerCurrentNodeId: string;
  revealedMapNodeIds: string[];
  mapPoiCompletionStatus: Record<string, boolean>;
}

export interface AccountXpGainEvent {
  id: string; // Unique ID for the event (e.g., timestamp + random string)
  timestamp: number;
  amount: number;
  source: string; // Description of the source, e.g., "Wave 5 Clear", "Goblin Defeat", "Hero Level Up"
}

// Information about the last applied Resonance Mote for UI feedback
export interface LastAppliedResonanceMoteInfo {
  statId: keyof HeroStats;
  qualityName: 'Resonance Shard' | 'Clear Core' | 'Potent Focus'; // English names
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
<<<<<<< Updated upstream
  activeView: 'TOWN' | 'BATTLEFIELD' | 'DUNGEON_REWARD' | 'HERO_ACADEMY' | 'DUNGEON_EXPLORE' | 'STONE_QUARRY_MINIGAME' | 'ACTION_BATTLE_VIEW' | 'SHARED_SKILL_TREE' | 'GOLD_MINE_MINIGAME' | 'DEMONICON_PORTAL' | 'WORLD_MAP';
=======
  activeView: ActiveView; 
>>>>>>> Stashed changes
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
  mapPoiCompletionStatus: Record<string, boolean>; // Status für die aktuelle Karte

  mapStates: Record<string, PerMapState>; // Status für alle Karten

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

  // Research System
  researchProgress: Record<string, ResearchProgress>; // Keyed by researchId
  completedResearch: Record<string, CompletedResearchEntry>; // Keyed by researchId (researchId: {level: number})
  researchSlots: number;
<<<<<<< Updated upstream
  researchQueue: Array<{ researchId: string; levelToResearch: number }>; // Array of researchIds and target levels
=======
  researchQueue: Array<{ researchId: string; levelToResearch: number }>;
  autoBattler: AutoBattlerState | null;
>>>>>>> Stashed changes

  _battleCombatTickResult?: { newlyAddedToFirstTimeDefeatsForAccXp?: string[] };
  _deferredCombatActions?: GameAction[];
}
