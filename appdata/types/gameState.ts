
import { ResourceType } from './enums';
import { GameNotification, Cost } from './common'; // Added Cost import
import { PlayerBuildingState } from './building';
import { PlayerHeroState, PlayerSharedSkillsState } from './hero'; // Added PlayerSharedSkillsState
import { BattleState, BuildingLevelUpEventInBattle, BattleHero } from './battle'; // Added BattleHero
import { DungeonRunState, DungeonGridState } from './dungeon';
import { CraftingQueueItem } from './crafting';
import { PlayerQuest } from './quests';
import { StoneQuarryMinigameState, GoldMineMinigameState } from './minigame'; // Added GoldMineMinigameState
import { ActionBattleState } from './actionBattle';

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

export interface GameState {
  resources: Record<ResourceType, number>;
  buildings: PlayerBuildingState[];
  heroes: PlayerHeroState[];
  unlockedHeroDefinitions: string[];
  currentWaveProgress: number;
  activeView: 'TOWN' | 'BATTLEFIELD' | 'DUNGEON_REWARD' | 'HERO_ACADEMY' | 'DUNGEON_EXPLORE' | 'STONE_QUARRY_MINIGAME' | 'ACTION_BATTLE_VIEW' | 'SHARED_SKILL_TREE' | 'GOLD_MINE_MINIGAME' | 'DEMONICON_PORTAL'; // Added GOLD_MINE_MINIGAME and DEMONICON_PORTAL
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
  goldMineMinigame: GoldMineMinigameState | null; // New state for Gold Mine Minigame
  playerSharedSkillPoints: number; // New
  playerSharedSkills: PlayerSharedSkillsState; // New
  actionBattleAISystem: ActionBattleAISystem;

  // Demonicon State
  defeatedEnemyTypes: string[]; // List of enemy IDs defeated at least once
  demoniconHighestRankCompleted: Record<string, number>; // Keyed by enemy ID, stores highest rank
  activeDemoniconChallenge: ActiveDemoniconChallenge | null; // State for an ongoing Demonicon challenge
  globalDemoniconLevel: number;
  globalDemoniconXP: number;
  expToNextGlobalDemoniconLevel: number;
  achievedDemoniconMilestoneRewards: string[]; // New: Stores IDs of achieved milestone rewards
}