import { ResourceType } from '../enums';

export interface MinigameGridCellState {
  r: number;
  c: number;
  currentResource: ResourceType;
  currentClicks: number;
  clicksToNextResource: number;
}