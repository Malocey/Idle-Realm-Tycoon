
import { HeroStats } from '../hero';
import { PotionEffectDefinition } from '../crafting';
import { StatusEffectType } from '../enums/battle'; // Added import

export interface StatusEffectDefinition {
  id: string;
  name: string;
  type: StatusEffectType;
  durationMs: number;
  iconName?: string;
  // For BUFF/DEBUFF
  statAffected?: keyof HeroStats;
  modifierType?: 'FLAT' | 'PERCENTAGE_ADDITIVE'; // PERCENTAGE_ADDITIVE will add to a sum of percentage bonuses
  value?: number;
  // For DOT
  damagePerTick?: number;
  tickIntervalMs?: number; // How often the DOT ticks
  // For STUN (no extra properties beyond base needed yet)
}

export interface StatusEffect {
  instanceId: string; // Unique ID for this specific application of the effect
  definitionId?: string; // Link to the StatusEffectDefinition if predefined
  type: StatusEffectType;
  name: string; // Copied from definition or generated for inline
  iconName?: string; // Copied from definition or default
  remainingDurationMs: number;
  sourceId: string; // uniqueBattleId of the caster
  appliedAtTick: number; // Game tick when applied

  // Properties copied from definition or inline for active effects
  statAffected?: keyof HeroStats;
  modifierType?: 'FLAT' | 'PERCENTAGE_ADDITIVE';
  value?: number;

  damagePerTick?: number;
  tickIntervalMs?: number;
  // Ensure this is optional as it only applies to DOTs
  timeUntilNextDotTickMs?: number; // Time in MS until the next DOT tick, relative to current game time.
}

export interface TemporaryBuff {
  id: string;
  potionId: string;
  effectType: PotionEffectDefinition['type'];
  stat?: keyof HeroStats;
  modifierType?: 'FLAT' | 'PERCENTAGE_ADDITIVE'; // Changed to include 'PERCENTAGE_ADDITIVE'
  value: number;
  remainingDurationMs: number;
  appliedAtTick: number;
}