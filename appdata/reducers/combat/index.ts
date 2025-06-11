
import { GameState, GameAction, GlobalBonuses, GameContextType } from '../../types';
// Import new battle processors
import { processWaveBattleTick } from '../../battleLogic/waveBattleProcessor';
import { processDemoniconBattleTick } from '../../battleLogic/demoniconBattleProcessor';

interface CombatTickSubResult { // Renamed from CombatTickResult to avoid confusion with the old export
    updatedGameState: GameState;
    deferredActions: GameAction[];
    newlyAddedToFirstTimeDefeatsForAccXp?: string[]; // For Account XP tracking
}

export const handleCombatTick = (
    state: GameState,
    action: Extract<GameAction, { type: 'BATTLE_ACTION' }>,
    globalBonuses: GlobalBonuses,
    staticData: GameContextType['staticData']
): GameState => { // Changed return type to GameState
  if (!state.battleState || state.battleState.status !== 'FIGHTING') {
    // Return the original state with no temporary properties if not fighting
    return state;
  }

  let result: CombatTickSubResult;
  if (state.battleState.isDemoniconBattle) {
    result = processDemoniconBattleTick(state, globalBonuses, staticData);
  } else {
    result = processWaveBattleTick(state, globalBonuses, staticData);
  }
  
  // Attach deferredActions and newlyAddedToFirstTimeDefeatsForAccXp to the updatedGameState
  return {
      ...result.updatedGameState,
      _deferredCombatActions: result.deferredActions,
      _battleCombatTickResult: { 
          newlyAddedToFirstTimeDefeatsForAccXp: result.newlyAddedToFirstTimeDefeatsForAccXp 
      }
  };
};