import { HeroStats } from './hero';
import { Cost } from './common';
import { ResourceType } from './enums';

export interface PotionEffectDefinition {
  type: 'INSTANT_HEAL' | 'TEMPORARY_STAT_MODIFIER';
  targetType: 'SELF';
  stat?: keyof HeroStats;
  modifierType?: 'FLAT' | 'PERCENTAGE';
  value: number;
  durationMs?: number;
}

export interface PotionDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  costs: Cost[];
  effects: PotionEffectDefinition[];
  baseCraftTimeMs: number;
}

export interface CraftingQueueItem {
  id: string;
  potionId: string;
  quantity: number;
  totalCraftTimeMs: number;
  remainingCraftTimeMs: number;
  startTime?: number;
}
