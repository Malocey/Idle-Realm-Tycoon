
import { GameState, GameAction, GlobalBonuses, CellType, GameNotification, ResourceType } from '../../types';
import { DUNGEON_DEFINITIONS } from '../../gameData/index';
import { ICONS } from '../../components/Icons';
import { NOTIFICATION_ICONS } from '../../constants';

export const handleFloorProgressionActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'END_DUNGEON_FLOOR' }>,
    globalBonuses: GlobalBonuses // Not directly used here, but good for consistency
): GameState => {
  switch (action.type) {
    case 'END_DUNGEON_FLOOR': {
      if (!state.activeDungeonRun || !state.battleState || !state.battleState.isDungeonBattle) {
        // This action is only relevant for battles originating from dungeon floors.
        return { ...state, battleState: null }; // Clear battle state if it somehow got here incorrectly.
      }

      const { outcome, collectedLoot, collectedExp, buildingLevelUps } = action.payload;
      let nextState = { ...state };
      let notifications = [...state.notifications];

      // Apply loot and XP from the battle to the main game state (not dungeon run state directly)
      if (collectedLoot) {
        collectedLoot.forEach(lootItem => {
          nextState.resources[lootItem.resource] = (nextState.resources[lootItem.resource] || 0) + lootItem.amount;
        });
      }
      if (collectedExp) {
        // For now, EXP from dungeon battles goes to the pool. Specific hero XP handling is complex here.
        nextState.resources[ResourceType.HEROIC_POINTS] = (nextState.resources[ResourceType.HEROIC_POINTS] || 0) + collectedExp;
      }
      if (buildingLevelUps && buildingLevelUps.length > 0) {
        // Apply building level ups directly to the main state.
        // This might be redundant if battleLootAndXPHandler already did this, review needed.
      }

      if (outcome === 'VICTORY') {
        // If it was a grid battle, the cell type should be updated.
        if (state.battleState.isDungeonGridBattle && state.activeDungeonGrid && state.battleState.sourceGridCell) {
            const {r, c} = state.battleState.sourceGridCell;
            const newGrid = state.activeDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
            newGrid[r][c].type = CellType.EMPTY;
            newGrid[r][c].enemyEncounterId = undefined;
            // Trap/Event might have been triggered by battle, keep that state
            nextState.activeDungeonGrid = { ...state.activeDungeonGrid, grid: newGrid };
        }
        
        const dungeonDef = DUNGEON_DEFINITIONS[nextState.activeDungeonRun.dungeonDefinitionId];
        if (nextState.activeDungeonRun.currentFloorIndex >= dungeonDef.floors.length -1) { // Last floor cleared
             notifications.push({id: Date.now().toString(), message: `${dungeonDef.name} cleared! Claim your reward.`, type: 'success', iconName: ICONS.CHECK_CIRCLE ? 'CHECK_CIRCLE' : undefined, timestamp: Date.now()});
             nextState.activeView = 'DUNGEON_REWARD';
             nextState.activeDungeonGrid = null; // Grid is done
        } else {
            // Proceed to next floor automatically by setting activeDungeonGrid to null.
            // The useDungeonManager hook will then trigger START_DUNGEON_EXPLORATION for the next floor.
             notifications.push({id: Date.now().toString(), message: `Floor ${nextState.activeDungeonRun.currentFloorIndex + 1} cleared! Proceeding...`, type: 'info', iconName: ICONS.ARROW_UP ? 'ARROW_UP' : undefined, timestamp: Date.now()});
             nextState.activeDungeonGrid = null; 
             // activeView remains 'DUNGEON_EXPLORE' to trigger floor setup, or could be set if needed.
        }
      } else { // DEFEAT
        notifications.push({id: Date.now().toString(), message: `Party defeated in ${DUNGEON_DEFINITIONS[nextState.activeDungeonRun.dungeonDefinitionId].name}! Run ended.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
        nextState.activeView = 'TOWN';
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