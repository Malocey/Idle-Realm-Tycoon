
import { MinigameGridCellState, ResourceType, MinigameResourcePopupEvent } from '../../types';
import { SQMG_GRID_SIZE, SQMG_DIRT_TO_CLAY_CLICKS } from '../../constants';

export const initializeGridCells = (): MinigameGridCellState[][] => {
  return Array.from({ length: SQMG_GRID_SIZE }, (_, r) =>
    Array.from({ length: SQMG_GRID_SIZE }, (_, c) => ({
      r,
      c,
      currentResource: ResourceType.MINIGAME_DIRT,
      currentClicks: 0,
      clicksToNextResource: SQMG_DIRT_TO_CLAY_CLICKS,
    }))
  );
};

export const createPopupEvent = (
  resourceType: ResourceType,
  amount: number,
  r: number,
  c: number,
  isPlayer: boolean
): MinigameResourcePopupEvent => {
  return {
    id: `popup-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    resourceType,
    amount,
    r,
    c,
    isPlayer,
    timestamp: Date.now(),
  };
};
