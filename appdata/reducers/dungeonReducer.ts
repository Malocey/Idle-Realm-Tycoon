
import { GameState, GameAction, GlobalBonuses } from '../../types';
import { handleRunStateActions } from './dungeonReducer/runStateManagement';
import { handleGridInteractionActions } from './dungeonReducer/gridInteraction';
import { handleFloorProgressionActions } from './dungeonReducer/floorProgression';

export const handleDungeonActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'START_DUNGEON_RUN' | 'END_DUNGEON_FLOOR' | 'END_DUNGEON_RUN' | 'START_DUNGEON_EXPLORATION' | 'MOVE_PARTY_ON_GRID' | 'UPDATE_GRID_CELL' | 'EXIT_DUNGEON_EXPLORATION' | 'GAIN_RUN_XP' | 'APPLY_CHOSEN_RUN_BUFF' | 'PRESENT_RUN_BUFF_CHOICES' }>,
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'START_DUNGEON_RUN':
    case 'END_DUNGEON_RUN':
    case 'EXIT_DUNGEON_EXPLORATION':
    case 'GAIN_RUN_XP':
    case 'APPLY_CHOSEN_RUN_BUFF':
    case 'PRESENT_RUN_BUFF_CHOICES':
      return handleRunStateActions(state, action, globalBonuses);

    case 'START_DUNGEON_EXPLORATION':
    case 'MOVE_PARTY_ON_GRID':
    case 'UPDATE_GRID_CELL':
      return handleGridInteractionActions(state, action, globalBonuses);

    case 'END_DUNGEON_FLOOR':
      return handleFloorProgressionActions(state, action, globalBonuses);
      
    // Deprecated/Unused actions previously in dungeonReducer, if any, should be handled or removed.
    // For now, assuming TRIGGER_GRID_ENCOUNTER, LEVEL_UP_RUN, PROCEED_TO_NEXT_DUNGEON_FLOOR are handled internally.
    default:
      // This should not be reached if types are correct, but as a fallback:
      // console.warn(`Unhandled dungeon action type: ${(action as any).type}`);
      return state;
  }
};
