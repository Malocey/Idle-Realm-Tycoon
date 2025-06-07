
import { useEffect } from 'react';
import { GameState, GameAction } from '../types';
import { GAME_TICK_MS } from '../constants';

export const useGameTick = (
  dispatch: React.Dispatch<GameAction>,
  gameSpeed: GameState['gameSpeed']
) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: 'PROCESS_TICK' });
    }, GAME_TICK_MS / gameSpeed);
    return () => clearInterval(intervalId);
  }, [gameSpeed, dispatch]);
};
