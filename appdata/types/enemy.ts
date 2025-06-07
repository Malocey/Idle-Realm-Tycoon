
import { Cost } from './common';
import { HeroStats, ChannelingProperties, AbilityEffect } from './hero'; // Added ChannelingProperties, AbilityEffect
import { StatusEffectDefinition } from './battle/effects';
import { StatusEffectType } from './enums/battle'; 

export interface SummonAbility {
  enemyIdToSummon: string;
  count: number;
  cooldownMs: number;
  initialCooldownMs?: number;
  scaleWithWave?: boolean;
}

export interface ShieldHealAbility { // New Interface
  healAmount: number; // Shield points
  cooldownMs: number;
  initialCooldownMs?: number;
  targetPriority: 'LOWEST_SHIELD_ABSOLUTE' | 'LOWEST_SHIELD_PERCENTAGE' | 'RANDOM_ALLY_WITH_SHIELD';
}

export interface EnemyHealAbility {
  healAmount: number;
  healFactor?: number; 
  cooldownMs: number;
  initialCooldownMs?: number;
  targetPriority: 'LOWEST_HP_ABSOLUTE' | 'LOWEST_HP_PERCENTAGE'; 
}

export interface ExplosionAbilityDetails {
  timerMs: number;
  damage: number;
  damageType?: 'FIXED' | 'SCALED_WITH_ATTACK';
  aoeRadius?: number;
}

export enum BossPhaseAbilityType {
  SELF_HEAL = 'SELF_HEAL',
  SHIELD_BOOST = 'SHIELD_BOOST',
  STAT_BUFF = 'STAT_BUFF',
  SUMMON_MINIONS = 'SUMMON_MINIONS',
  APPLY_STATUS_EFFECT_TO_TARGET = 'APPLY_STATUS_EFFECT_TO_TARGET', 
  APPLY_STATUS_EFFECT_TO_ALL_HEROES = 'APPLY_STATUS_EFFECT_TO_ALL_HEROES', 
}

export interface BossPhaseAbility {
  type: BossPhaseAbilityType;
  value?: number;
  stat?: keyof HeroStats;
  durationTicks?: number;
  cooldownTicks?: number;
  triggeredInPhase?: boolean;
  summonParams?: {
    enemyId: string;
    count: number;
    isElite?: boolean;
  };
  statusEffectId?: string; 
  inlineStatusEffect?: Omit<StatusEffectDefinition, 'id'>; 
  statusEffectChance?: number; 
}

export interface BossPhaseDefinition {
  hpThreshold: number;
  name?: string;
  abilities: BossPhaseAbility[];
  oneTimeEffectsApplied?: boolean;
}

export interface EnemyAbilityOnAttack {
  chance: number; 
  statusEffectId?: string;
  inlineStatusEffect?: Omit<StatusEffectDefinition, 'id'>;
}

export interface PeriodicEffectAbilityDetails { 
  cooldownMs: number;
  initialCooldownMs?: number;
  statusEffect: Omit<StatusEffectDefinition, 'id'>; 
}

export interface EnemyChannelingAbilityDefinition {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  cooldownMs: number;
  initialCooldownMs?: number;
  manaCost?: number; // If enemies use mana for these
  targetType: 'SELF' | 'ENEMY_TARGET' | 'ALLY_TARGET' | 'AREA'; // Define targeting
  channelingProperties: ChannelingProperties;
  // Effects are now within channelingProperties
}

export interface EnemyDefinition {
  id: string;
  name: string;
  stats: HeroStats;
  loot: Cost[];
  iconName: string;
  expReward: number;
  dungeonTierScale?: {
    hpFactor?: number;
    damageFactor?: number;
    defenseFactor?: number;
  };
  summonAbility?: SummonAbility;
  shieldHealAbility?: ShieldHealAbility; // New Property
  healAbility?: EnemyHealAbility;
  aoeAttackChance?: number;
  aoeDamageFactor?: number;
  aoeAttackCooldownBaseMs?: number;
  attackType?: 'MELEE' | 'RANGED';
  rangedAttackRangeUnits?: number;
  explosionAbility?: ExplosionAbilityDetails;
  phases?: BossPhaseDefinition[];
  onAttackAbilities?: EnemyAbilityOnAttack[];
  periodicEffectAbility?: PeriodicEffectAbilityDetails; 
  channelingAbilities?: EnemyChannelingAbilityDefinition[]; // New
}