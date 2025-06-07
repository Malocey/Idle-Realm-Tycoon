
import { GameState, ResourceType, PlayerHeroState, StoneQuarryMinigameState, ActionBattleState, PlayerSharedSkillProgress, GoldMineMinigameState, ActiveDemoniconChallenge } from './types';
import { INITIAL_RESOURCES, INITIAL_HEROES, SQMG_GRID_SIZE, SQMG_DIRT_CLICK_YIELD, SQMG_INITIAL_GOLEM_CLICK_POWER, SQMG_INITIAL_GOLEM_CLICK_SPEED_MS, SQMG_INITIAL_GOLEM_MOVE_SPEED_MS, SQMG_ESSENCE_DROP_CHANCE, SQMG_PLAYER_MULTI_CLICK_CHANCE_BASE, SQMG_GOLEM_ESSENCE_AFFINITY_BASE, SQMG_PLAYER_CRYSTAL_FIND_CHANCE_BASE, SQMG_GOLEM_CRYSTAL_SIFTERS_BASE, SQMG_PLAYER_ADVANCED_EXCAVATION_BASE_CHANCE, BASE_GOLD_MINE_GRID_ROWS, BASE_GOLD_MINE_GRID_COLS, INITIAL_GOLD_MINE_PLAYER_STATS } from './constants';
import { getExpToNextHeroLevel, calculateGoldMinePlayerStats } from './utils'; 
import { RUN_BUFF_DEFINITIONS } from './gameData/index';
import { worldMapDefinitions } from './gameData/maps/index'; // Updated import path

export const INITIAL_STARTING_BUILDINGS: string[] = ['TOWN_HALL'];

const initialMapId = 'verdant_plains'; 
const initialPlayerNodeId = 'hometown'; 
const initialMapDefinition = worldMapDefinitions[initialMapId];

const initialRevealedMapNodeIds = initialMapDefinition?.nodes.find(node => node.id === initialPlayerNodeId)
  ? [initialPlayerNodeId, 'goblin_camp_early'] 
  : [];


export const initialGameState: GameState = {
  resources: { ...INITIAL_RESOURCES },
  buildings: INITIAL_STARTING_BUILDINGS.map(id => ({ id, level: 1 })),
  heroes: INITIAL_HEROES.map(id => ({
    definitionId: id,
    level: 1,
    currentExp: 0,
    expToNextLevel: getExpToNextHeroLevel(1),
    skillPoints: 1,
    skillLevels: {},
    specialAttackLevels: {},
    equipmentLevels: {},
    permanentBuffs: [],
    ownedShards: [],
  })),
  unlockedHeroDefinitions: [...INITIAL_HEROES],
  currentWaveProgress: 0,
  activeView: 'TOWN',
  battleState: null,
  activeDungeonRun: null,
  activeDungeonGrid: null,
  actionBattleState: null,
  lastTickTimestamp: Date.now(),
  gameSpeed: 1,
  notifications: [],
  totalTownXp: 0,
  townHallUpgradeLevels: {},
  buildingSpecificUpgradeLevels: {},
  guildHallUpgradeLevels: {},
  totalGoldSpentOnTownHallPaths: 0,
  buildingLevelUpEvents: {},
  potions: {},
  craftingQueue: [],
  justFusedShardInstanceId: null,
  activeQuests: [],
  unlockedRunBuffs: Object.values(RUN_BUFF_DEFINITIONS)
                        .filter(buff => buff.isBaseUnlocked !== false)
                        .map(buff => buff.id),
  runBuffLibraryLevels: {},
  godModeActive: false,
  stoneQuarryMinigame: { 
      gridInitialized: false,
      gridCells: [],
      resources: {
        [ResourceType.MINIGAME_DIRT]: 0,
        [ResourceType.MINIGAME_CLAY]: 0,
        [ResourceType.MINIGAME_SAND]: 0,
        [ResourceType.MINIGAME_ESSENCE]: 0,
        [ResourceType.MINIGAME_CRYSTAL]: 0,
        [ResourceType.MINIGAME_EMERALD]: 0,
        [ResourceType.MINIGAME_RUBY]: 0,
        [ResourceType.MINIGAME_SAPPHIRE]: 0,
      },
      golems: [],
      moles: [],
      playerClickPower: SQMG_DIRT_CLICK_YIELD,
      lastGolemActionTimestamp: 0,
      golemBaseClickPower: SQMG_INITIAL_GOLEM_CLICK_POWER,
      golemBaseClickSpeedMs: SQMG_INITIAL_GOLEM_CLICK_SPEED_MS,
      golemBaseMoveSpeedMs: SQMG_INITIAL_GOLEM_MOVE_SPEED_MS,
      golemClickPowerUpgradeLevel: 0,
      golemClickSpeedUpgradeLevel: 0,
      golemMoveSpeedUpgradeLevel: 0,
      essenceDropChance: SQMG_ESSENCE_DROP_CHANCE,
      essenceDropChanceUpgradeLevel: 0,
      playerMultiClickChance: SQMG_PLAYER_MULTI_CLICK_CHANCE_BASE,
      playerMultiClickChanceUpgradeLevel: 0,
      golemEssenceAffinity: SQMG_GOLEM_ESSENCE_AFFINITY_BASE,
      golemEssenceAffinityUpgradeLevel: 0,
      playerCrystalFindChance: SQMG_PLAYER_CRYSTAL_FIND_CHANCE_BASE,
      playerCrystalFindChanceUpgradeLevel: 0,
      golemCrystalSifters: SQMG_GOLEM_CRYSTAL_SIFTERS_BASE,
      golemCrystalSiftersUpgradeLevel: 0,
      playerAdvancedExcavationChance: SQMG_PLAYER_ADVANCED_EXCAVATION_BASE_CHANCE,
      playerAdvancedExcavationUpgradeLevel: 0,
      emeraldExpertiseChance: 0,
      emeraldExpertiseUpgradeLevel: 0,
      rubyRefinementChance: 0,
      rubyRefinementUpgradeLevel: 0,
      sapphireSynthesisChance: 0,
      sapphireSynthesisUpgradeLevel: 0,
      golemSynchronizationLevel: 0,
      activeMinigameEvent: null,
      popupEvents: [],
      dirtGolemsCraftedCount: 0, 
  },
  goldMineMinigame: {
    status: 'IDLE_AT_SURFACE',
    grid: [],
    gridRows: BASE_GOLD_MINE_GRID_ROWS, 
    gridCols: BASE_GOLD_MINE_GRID_COLS, 
    playerGridPos: { r: 0, c: 0 },
    currentStamina: INITIAL_GOLD_MINE_PLAYER_STATS.maxStamina,
    playerStats: calculateGoldMinePlayerStats(INITIAL_GOLD_MINE_PLAYER_STATS, {}), 
    currentDepth: 1,
    maxUnlockedDepth: 1, 
    resourcesCollectedThisRun: {},
    permanentUpgradeLevels: {},
    popupEvents: [],
    runStartTime: null,
    totalTimeInMineSeconds: 0,
  },
  playerSharedSkillPoints: 5,
  playerSharedSkills: {
    'SHARED_ORIGIN': { currentMajorLevel: 1, currentMinorLevel: 0 } 
  },
  actionBattleAISystem: 'legacy', 
  currentMapId: initialMapId,
  playerCurrentNodeId: initialPlayerNodeId, 
  revealedMapNodeIds: initialRevealedMapNodeIds,
  mapPoiCompletionStatus: {
    'archer_unlocked_verdant_plains': false,
    'lumber_mill_blueprint_obtained': false,
    'farm_blueprint_obtained': false,
    'damaged_gold_mine_access_granted': false,
    'tannery_blueprint_obtained': false,
    'cleric_recruitment_unlocked': false,
    'stone_quarry_blueprint_obtained': false,
  },

  defeatedEnemyTypes: [],
  demoniconHighestRankCompleted: {},
  activeDemoniconChallenge: null,
  globalDemoniconLevel: 1,
  globalDemoniconXP: 0,
  expToNextGlobalDemoniconLevel: 20, 
  achievedDemoniconMilestoneRewards: [], 
};
