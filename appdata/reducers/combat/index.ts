
import { GameState, GameAction, GlobalBonuses, GameContextType } from '../../types';
// Import new battle processors
import { processWaveBattleTick } from '../../battleLogic/waveBattleProcessor';
import { processDemoniconBattleTick } from '../../battleLogic/demoniconBattleProcessor';

export const handleCombatTick = (
    state: GameState,
    action: Extract<GameAction, { type: 'BATTLE_ACTION' }>,
    globalBonuses: GlobalBonuses,
    staticData: GameContextType['staticData']
): GameState => {
  if (!state.battleState || state.battleState.status !== 'FIGHTING') return state;

  if (state.battleState.isDemoniconBattle) {
    return processDemoniconBattleTick(state, globalBonuses, staticData);
  } else {
    return processWaveBattleTick(state, globalBonuses, staticData);
  }
};
