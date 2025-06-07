
import { useEffect } from 'react';
import { GameState, GameAction } from '../types';
import { GAME_TICK_MS } from '../constants';

export const useBattleManager = (
  dispatch: React.Dispatch<GameAction>,
  activeView: GameState['activeView'],
  battleStateStatus: GameState['battleState_status'],
  actionBattleStateStatus: GameState['actionBattleState_status'],
  gameSpeed: GameState['gameSpeed']
) => {
  useEffect(() => {
    let battleIntervalId: number | undefined;
    if (activeView === 'BATTLEFIELD' && battleStateStatus === 'FIGHTING') {
      battleIntervalId = window.setInterval(() => {
        dispatch({ type: 'BATTLE_ACTION' });
      }, GAME_TICK_MS / gameSpeed);
    } else if (
      activeView === 'ACTION_BATTLE_VIEW' &&
      actionBattleStateStatus &&
      (actionBattleStateStatus === 'FIGHTING' || actionBattleStateStatus === 'PREPARING')
    ) {
      battleIntervalId = window.setInterval(() => {
        dispatch({ type: 'ACTION_BATTLE_TICK' });
      }, GAME_TICK_MS / gameSpeed);
    }
    return () => {
      if (battleIntervalId) clearInterval(battleIntervalId);
    };
  }, [activeView, battleStateStatus, actionBattleStateStatus, gameSpeed, dispatch]);
};
