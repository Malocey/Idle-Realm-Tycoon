
import { HeroDefinition, PlayerHeroState, HeroStats } from '../hero';
import { EnemyDefinition, BossPhaseDefinition } from '../enemy'; 
import { StatusEffect, TemporaryBuff } from './effects';
import { ActionBattleParticipantAIState } from '../enums';

export interface ParticipantChannelingState {
    abilityId: string; // ID of the SpecialAttackDefinition or EnemyChannelingAbility
    sourceParticipantId: string; // Who initiated the channel
    totalDurationMs: number;
    progressMs: number;
    channelTickProgressMs?: number; // For abilities with effects during channel
    isMovementBlocked: boolean;
    areActionsBlocked: boolean;
}

export interface BattleHero extends HeroDefinition, PlayerHeroState {
  uniqueBattleId: string;
  currentHp: number;
  currentMana: number;
  calculatedStats: HeroStats;
  attackCooldown: number; 
  attackCooldownRemainingTicks: number; 
  movementSpeed: number; 
  specialAttackCooldownsRemaining: Record<string, number>; 
  isTaunting?: boolean;
  statusEffects: StatusEffect[];
  temporaryBuffs: TemporaryBuff[];
  currentEnergyShield?: number;
  shieldRechargeDelayTicksRemaining?: number;
  x: number;
  y: number;
  targetId?: string | null;
  isAttackingTicksRemaining?: number;
  potentialTargetId?: string | null; 
  attackType: 'MELEE' | 'RANGED'; 
  rangedAttackRangeUnits?: number; 
  debugMovementTarget?: { x: number, y: number };
  aiDecisionCooldownTicks?: number;
  aiState?: ActionBattleParticipantAIState;
  aiRepositioningTarget?: {x: number, y: number};
  channelingState?: ParticipantChannelingState | null; 
  isUsingSpecialAttack?: { definitionId: string, targetId?: string | null } | null; // Added optional property
  potionSlots: Array<string | null>; // Added for equipped potions
}

export interface BattleEnemy extends EnemyDefinition {
  uniqueBattleId: string;
  currentHp: number;
  calculatedStats: HeroStats; 
  attackCooldown: number; 
  attackCooldownRemainingTicks: number; 
  movementSpeed: number; 
  currentSummonCooldownMs?: number; 
  currentShieldHealCooldownMs?: number; // New property for shield healing
  currentHealCooldownMs?: number;   
  currentAoeAttackCooldownMs?: number;
  currentPeriodicEffectCooldownMs?: number; 
  statusEffects: StatusEffect[];
  isElite?: boolean; 
  currentEnergyShield?: number;
  shieldRechargeDelayTicksRemaining?: number;
  x: number;
  y: number;
  targetId?: string | null;
  isAttackingTicksRemaining?: number;
  isDying?: boolean;
  dyingTicksRemaining?: number;
  attackType: 'MELEE' | 'RANGED'; 
  rangedAttackRangeUnits?: number; 
  debugMovementTarget?: { x: number, y: number };
  aiDecisionCooldownTicks?: number;
  aiState?: ActionBattleParticipantAIState;
  aiRepositioningTarget?: {x: number, y: number};
  explosionTimerRemainingMs?: number;
  currentPhaseIndex?: number; 
  phases?: BossPhaseDefinition[]; 
  temporaryBuffs: TemporaryBuff[]; 
  channelingState?: ParticipantChannelingState | null; 
  specialAttackCooldownsRemaining?: Record<string, number>; 
  isUsingSpecialAttack?: { definitionId: string, targetId?: string | null } | null; // Added optional property
  summonStrengthModifier?: number; // New property for boss summon scaling
}