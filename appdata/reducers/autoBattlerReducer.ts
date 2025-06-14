
import { GameState, GameAction, AutoBattlerState, AutoBattlerBuildingType, AutoBattlerEnemyTower, AutoBattlerBaseStructure } from '../types';

const createInitialAutoBattlerGrid = (rows: number, cols: number): (AutoBattlerBuildingType | null)[][] => {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
};

const initialAutoBattlerState: AutoBattlerState = {
  isActive: false,
  supplies: 100, // Starting supplies
  grid: createInitialAutoBattlerGrid(6, 10) as any, // Type assertion for simplicity, ensure correct type later
  playerUnits: [],
  builderUnits: [],
  playerDefenses: [],
  enemyUnits: [],
  enemyTowers: [
    { id: 'tower1', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: 0, y: 0 }, // Positions to be refined
    { id: 'tower2', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: 0, y: 0 },
    { id: 'tower3', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: 0, y: 0 },
    { id: 'tower4', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: 0, y: 0 },
  ],
  enemyBase: { 
    id: 'enemyBase', 
    type: AutoBattlerBuildingType.ENEMY_BASE, 
    hp: 5000, 
    maxHp: 5000,
    x: 0, y: 0 // Position to be refined
  },
  enemySpawnRateModifier: 1.0,
  deck: [], // Will be populated by player's deck choice
  hand: [],
  discard: [],
  currentPhase: 'SETUP',
  gameTime: 0,
};

export const autoBattlerReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'INITIALIZE_AUTO_BATTLER' // Add more actions later
  }>
): GameState => {
  switch (action.type) {
    case 'INITIALIZE_AUTO_BATTLER':
      if (state.autoBattler && state.autoBattler.isActive && state.autoBattler.currentPhase !== 'ENDED') {
        // Do not re-initialize if a game is active and not ended
        return state;
      }
      return {
        ...state,
        autoBattler: {
          ...initialAutoBattlerState,
          // Potentially load deck, enemy tower positions, etc. based on meta-progression or fixed setup
        },
      };
    // Add other auto-battler specific actions here
    default:
      return state;
  }
};
