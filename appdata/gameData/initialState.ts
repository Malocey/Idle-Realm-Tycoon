
import { GameState, ResourceType, PlayerHeroState, StoneQuarryMinigameState, ActionBattleState, PlayerSharedSkillProgress, GoldMineMinigameState, ActiveDemoniconChallenge, PerMapState, WorldMapDefinition, RunBuffDefinition, ActiveView, AutoBattlerState } from '../types';
import { INITIAL_RESOURCES, INITIAL_HEROES as INITIAL_UNLOCKED_HEROES, SQMG_GRID_SIZE, SQMG_DIRT_CLICK_YIELD, SQMG_INITIAL_GOLEM_CLICK_POWER, SQMG_INITIAL_GOLEM_CLICK_SPEED_MS, SQMG_INITIAL_GOLEM_MOVE_SPEED_MS, SQMG_ESSENCE_DROP_CHANCE, SQMG_PLAYER_MULTI_CLICK_CHANCE_BASE, SQMG_GOLEM_ESSENCE_AFFINITY_BASE, SQMG_PLAYER_CRYSTAL_FIND_CHANCE_BASE, SQMG_GOLEM_CRYSTAL_SIFTERS_BASE, SQMG_PLAYER_ADVANCED_EXCAVATION_BASE_CHANCE, BASE_GOLD_MINE_GRID_ROWS, BASE_GOLD_MINE_GRID_COLS, INITIAL_GOLD_MINE_PLAYER_STATS } from '../constants';
import * as constants from '../constants'; // Import all for autoBattler
import { MAX_POTION_SLOTS_PER_HERO } from '../types/hero';
import { getExpToNextHeroLevel, calculateGoldMinePlayerStats } from '../utils';
import { RUN_BUFF_DEFINITIONS, ACCOUNT_LEVEL_DEFINITIONS, calculateXPForAccountLevel as calculateXPForAccountLevelUtil, worldMapDefinitions, AUTOBATTLER_CARD_DEFINITIONS, AUTOBATTLER_UNIT_DEFINITIONS } from '../gameData/index';
import { AutoBattlerBuildingType } from '../types/autoBattler';


export const INITIAL_STARTING_BUILDINGS: string[] = ['TOWN_HALL'];

const CUSTOM_INITIAL_UNLOCKED_HEROES = INITIAL_UNLOCKED_HEROES.filter(id => id !== 'ARCHER');

const initialMapId = 'verdant_plains';
const initialPlayerNodeId = 'hometown';
const initialMapDefinition = worldMapDefinitions[initialMapId];

const initialRevealedMapNodeIds = initialMapDefinition?.nodes.find(node => node.id === initialPlayerNodeId)
  ? [initialPlayerNodeId, 'goblin_camp_early']
  : [];

const initialMapStates: Record<string, PerMapState> = {
  [initialMapId]: {
    playerCurrentNodeId: initialPlayerNodeId,
    revealedMapNodeIds: initialRevealedMapNodeIds,
    mapPoiCompletionStatus: {
        'archer_unlocked_verdant_plains': false,
        'lumber_mill_blueprint_obtained': false,
        'farm_blueprint_obtained': false,
        'damaged_gold_mine_access_granted': false,
        'tannery_blueprint_obtained': false,
        'stone_quarry_blueprint_obtained': false,
        'goblin_camp_early_battle_won': false,
        'gold_mine_access_battle_battle_won': false, 
        'tannery_guardians_battle_won': false, 
        'stone_quarry_guards_battle_won': false, 
        'gold_mine_blueprint_obtained': false, 
        'demonicon_gate_unlocked': false,
    }
  },
  'whispering_woods_depths_map': {
    playerCurrentNodeId: 'ww_depths_entry',
    revealedMapNodeIds: ['ww_depths_entry'],
    mapPoiCompletionStatus: {
        'ww_cleric_rescue_poi_completed': false,
        'ww_depths_optional_poi_1_collected': false,
    }
  }
};

const createInitialAutoBattlerGrid = (rows: number, cols: number): (null)[][] => {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
};

const shuffleDeck = (deck: any[]): any[] => { // TODO: type card
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const createDefaultDeck = (): any[] => { // TODO: type card
    return [
        ...(AUTOBATTLER_CARD_DEFINITIONS.FARM_CARD ? Array(5).fill(AUTOBATTLER_CARD_DEFINITIONS.FARM_CARD) : []),
        ...(AUTOBATTLER_CARD_DEFINITIONS.BARRACKS_CARD ? Array(5).fill(AUTOBATTLER_CARD_DEFINITIONS.BARRACKS_CARD) : []),
        ...(AUTOBATTLER_CARD_DEFINITIONS.WINDMILL_CARD ? Array(3).fill(AUTOBATTLER_CARD_DEFINITIONS.WINDMILL_CARD) : []),
    ];
};

export const initialAutoBattlerStateBase: Omit<AutoBattlerState, 'deck' | 'hand' | 'discard'> = {
    isActive: false, supplies: 250, grid: createInitialAutoBattlerGrid(constants.PLAYER_BUILDING_GRID_ROWS, constants.PLAYER_BUILDING_GRID_COLS), playerUnits: [], builderUnits: [],
    playerDefenses: [], enemyUnits: [],
    enemyTowers: [ 
        // Original Towers - Repositioned
        { id: 'tower1_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 4000, maxHp: 4000, x: constants.AUTOBATTLER_WORLD_WIDTH - 480, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.3, damage: 40, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower2_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 4000, maxHp: 4000, x: constants.AUTOBATTLER_WORLD_WIDTH - 480, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.7, damage: 40, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower3_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 8000, maxHp: 8000, x: constants.AUTOBATTLER_WORLD_WIDTH - 330, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.4, damage: 60, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower4_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 8000, maxHp: 8000, x: constants.AUTOBATTLER_WORLD_WIDTH - 330, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.6, damage: 60, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        // New Rear Towers
        { id: 'tower5_new_rear', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 10000, maxHp: 10000, x: constants.AUTOBATTLER_WORLD_WIDTH - 180, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.3, damage: 100, attackSpeed: 1800, attackRange: 90, attackCooldownRemainingMs: 0 },
        { id: 'tower6_new_rear', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 10000, maxHp: 10000, x: constants.AUTOBATTLER_WORLD_WIDTH - 180, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.7, damage: 100, attackSpeed: 1800, attackRange: 90, attackCooldownRemainingMs: 0 },
    ],
    enemyBase: {
        id: 'enemyBase', type: AutoBattlerBuildingType.ENEMY_BASE, hp: 5000, maxHp: 5000, 
        x: constants.AUTOBATTLER_WORLD_WIDTH - constants.ENEMY_BASE_WIDTH / 2 - 30, // Repositioned
        y: constants.ENEMY_BASE_Y, 
        producesUnitId: 'ENEMY_GRUNT', productionTimeMs: 7000, productionProgressMs: 0,
        // Base Attack Stats
        damage: 30, attackSpeed: 2500, attackRange: 120, attackCooldownRemainingMs: 0,
    },
    enemySpawnRateModifier: 1.0, 
    nextEnemySpawnPoolIndex: 0,
    towersDestroyedCountThisRun: 0,
    gameTime: 0, popups: [],
    farmBuffs: {},
    camera: { x: 0, y: 0 },
    currentViewportWidth: constants.AUTOBATTLER_VIEWPORT_WIDTH,
    currentViewportHeight: constants.AUTOBATTLER_VIEWPORT_HEIGHT,
    eliteSpawnCooldownMs: 0,
};
