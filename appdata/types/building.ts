import { Cost, Production } from './common';

export interface BuildingDefinition {
  id: string;
  name: string;
  description: string;
  baseCost: Cost[];
  costScalingFactor: number;
  baseProduction: Production[];
  productionScalingFactor: number;
  maxLevel: number;
  iconName: string;
  isProducer?: boolean;
  isUtility?: boolean;
  unlockWaveRequirement?: number;
  hasMinigame?: boolean;
}

export interface PlayerBuildingState {
  id: string;
  level: number;
}
