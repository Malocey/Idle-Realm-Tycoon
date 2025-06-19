
import { HeroStats } from './hero';
import { Cost } from './common';
import { ResourceType } from './enums';

export interface PotionEffectDefinition {
  type: 'INSTANT_HEAL' | 'TEMPORARY_STAT_MODIFIER';
  targetType: 'SELF';
  stat?: keyof HeroStats;
  modifierType?: 'FLAT' | 'PERCENTAGE_ADDITIVE'; // Changed 'PERCENTAGE' to 'PERCENTAGE_ADDITIVE'
  value: number;
  durationMs?: number;
}

export interface PotionDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  costs: Cost[]; // For non-permanent potions
  effects: PotionEffectDefinition[];
  baseCraftTimeMs: number; // For non-permanent potions

  // Fields for Permanent Potions
  isPermanent?: boolean;
  permanentStatBonuses?: Array<{ stat: keyof HeroStats; value: number; isPercentage?: boolean }>;
  baseCostForPermanentPotion?: Cost[];
  costScalingFactorPerCraft?: number; // e.g., 1.2 for 20% cost increase per global craft
  researchUnlockId?: string;
}

export interface CraftingQueueItem {
  id: string;
  potionId: string;
  quantity: number;
  totalCraftTimeMs: number;
  remainingCraftTimeMs: number;
  startTime?: number;
}
