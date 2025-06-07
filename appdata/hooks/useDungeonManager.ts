
import { useEffect } from 'react';
import { GameState, GameAction, GameContextType } from '../types';
import { NOTIFICATION_ICONS } from '../constants';

export const useDungeonManager = (
  dispatch: React.Dispatch<GameAction>,
  gameState: GameState,
  staticData: GameContextType['staticData']
) => {
  useEffect(() => {
    if (gameState.activeQuests.length === 0) {
      dispatch({ type: 'GENERATE_NEW_QUESTS' });
    }

    if (
      gameState.activeDungeonRun &&
      gameState.activeDungeonGrid === null &&
      gameState.battleState === null &&
      gameState.activeView === 'DUNGEON_EXPLORE'
    ) {
      if (!staticData) {
        console.error("CRITICAL: staticData is undefined in useEffect for dungeon progression (floor change). gameState.activeDungeonRun:", JSON.stringify(gameState.activeDungeonRun));
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'TOWN' });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Critical Error: Game data missing during dungeon. Returning to town.`, type: 'error', iconName: NOTIFICATION_ICONS.error }});
        return;
      }
      if (!staticData.dungeonDefinitions) {
        console.error("CRITICAL: staticData.dungeonDefinitions is undefined in useEffect for dungeon progression (floor change). gameState.activeDungeonRun:", JSON.stringify(gameState.activeDungeonRun));
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'TOWN' });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Critical Error: Dungeon definitions missing. Returning to town.`, type: 'error', iconName: NOTIFICATION_ICONS.error }});
        return;
      }

      const dungeonDef = staticData.dungeonDefinitions[gameState.activeDungeonRun.dungeonDefinitionId];
      const nextFloorIndex = gameState.activeDungeonRun.currentFloorIndex;

      if (!dungeonDef) {
        console.error(`Dungeon definition not found for ID: ${gameState.activeDungeonRun.dungeonDefinitionId} when trying to proceed to next floor. Returning to town.`);
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'TOWN' });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Error: Dungeon data missing for ${gameState.activeDungeonRun.dungeonDefinitionId}. Returning to town.`, type: 'error', iconName: NOTIFICATION_ICONS.error }});
        return;
      }

      if (nextFloorIndex < dungeonDef.floors.length) {
        dispatch({ type: 'START_DUNGEON_EXPLORATION', payload: { dungeonId: dungeonDef.id, floorIndex: nextFloorIndex } });
      } else {
        console.warn("Trying to proceed beyond max floors, should be in reward state for dungeon:", dungeonDef.id);
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'DUNGEON_REWARD' });
      }
    }
  }, [gameState.activeQuests.length, dispatch, gameState.activeDungeonRun, gameState.activeDungeonGrid, gameState.battleState, gameState.activeView, staticData]);
};