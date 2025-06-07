import { ResourceType } from '../enums';

export interface MinigameResourcePopupEvent {
  id: string;
  resourceType: ResourceType;
  amount: number;
  r: number; // Origin cell row
  c: number; // Origin cell column
  isPlayer: boolean;
  timestamp: number;
}