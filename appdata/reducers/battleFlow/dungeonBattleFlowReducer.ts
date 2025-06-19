
import { GameState, GameAction, GlobalBonuses, Cost, ResourceType, BattleState, CellType, ActiveView } from '../../types';
import { DUNGEON_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../../gameData/index';
import { calculateHeroStats, calculateDungeonEnemyStats } from '../../utils';
import { NOTIFICATION_ICONS } from '../../constants';
import { ICONS } from '../../components/Icons';

// This reducer is specifically for battles that originate from the dungeon grid.
// It assumes that END_BATTLE from index.ts will dispatch here if isDungeonGridBattle is true.

export const dungeonBattleFlowReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'END_DUNGEON_GRID_BATTLE_RESULT' }>, // New action type
  globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'END_DUNGEON_GRID_BATTLE_RESULT': {
      const { outcome, battleStateFromEnd } = action.payload;
      let nextState = { ...state };
      let notifications = [...state.notifications];

      // Apply loot and XP from the battle to the main game state.
      // Loot from dungeon grid battles *does* go to the player directly.
      if (battleStateFromEnd.battleLootCollected) {
        battleStateFromEnd.battleLootCollected.forEach(lootItem => {
          nextState.resources[lootItem.resource] = (nextState.resources[lootItem.resource] || 0) + lootItem.amount;
        });
      }
      // XP from dungeon grid battles contributes to the Run XP.
      if (battleStateFromEnd.battleExpCollected && nextState.activeDungeonRun) {
        const runXpFromBattle = Math.floor(battleStateFromEnd.battleExpCollected * (1 + globalBonuses.heroXpGainBonus)); // Apply hero XP gain to run XP as well
         actionsToDispatch.push({ type: 'GAIN_RUN_XP', payload: { amount: runXpFromBattle }});
      }

      if (outcome === 'VICTORY') {
        // Update PlayerHeroState with final BattleHero stats (XP, level, skill points)
        nextState.heroes = nextState.heroes.map(playerHero => {
          const battleVersion = battleStateFromEnd.heroes.find(bh => bh.definitionId === playerHero.definitionId);
          if (battleVersion) {
            return {
              ...playerHero,
              level: battleVersion.level,
              currentExp: battleVersion.currentExp,
              expToNextLevel: battleVersion.expToNextLevel,
              skillPoints: battleVersion.skillPoints,
              // HP/Mana are handled by heroStatesAtFloorStart for next floor
            };
          }
          return playerHero;
        });

        if (nextState.activeDungeonGrid && battleStateFromEnd.sourceGridCell) {
            const {r, c} = battleStateFromEnd.sourceGridCell;
            const newGrid = nextState.activeDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
            newGrid[r][c].type = CellType.EMPTY;
            newGrid[r][c].enemyEncounterId = undefined;
            nextState.activeDungeonGrid = { ...nextState.activeDungeonGrid, grid: newGrid };
        }
        notifications.push({id: Date.now().toString(), message: `Dungeon encounter cleared!`, type: 'success', iconName: ICONS.CHECK_CIRCLE ? 'CHECK_CIRCLE' : undefined, timestamp: Date.now()});
        nextState.activeView = ActiveView.DUNGEON_EXPLORE; // Return to dungeon map
      } else { // DEFEAT in dungeon grid battle
        notifications.push({id: Date.now().toString(), message: `Party defeated in ${DUNGEON_DEFINITIONS[nextState.activeDungeonRun!.dungeonDefinitionId].name}! Run ended.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
        nextState.activeView = ActiveView.TOWN;
        nextState.activeDungeonGrid = null;
        nextState.activeDungeonRun = null;
      }
      
      nextState.battleState = null; // Clear the battle state
      nextState.notifications = notifications;
      return nextState;
    }
    default:
      return state;
  }
};

// Helper: Collect actions to dispatch later to avoid direct dispatching within reducer.
// This isn't strictly necessary if the main reducer handles these but can be a pattern.
const actionsToDispatch: GameAction[] = []; 
// Ensure this array is processed by the main reducer or a middleware after this reducer completes.
// For now, we'll assume GAIN_RUN_XP is handled by the main reducer when it sees the updated activeDungeonRun.
// Alternatively, the main reducer could dispatch GAIN_RUN_XP directly after this.
