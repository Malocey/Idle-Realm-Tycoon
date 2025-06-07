import { ShardType } from './enums';
import { HeroStats } from './hero';

export interface ShardDefinition {
  id: string;
  type: ShardType;
  name: string;
  iconName: string;
  statAffected: keyof HeroStats;
  baseValue: number;
  scalingFactor: number;
  maxFusionLevel: number;
}

export interface PlayerOwnedShard {
  instanceId: string;
  definitionId: string;
  level: number;
}
