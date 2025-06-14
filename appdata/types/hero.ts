
import { Cost } from './common';
import { EquipmentSlot, ResourceType, SpecialAttackTargetType, StatusEffectType, AbilityEffectTriggerType, GlobalEffectTarget } from './enums'; // Added GlobalEffectTarget
import { PlayerOwnedShard } from './shards';
import { StatusEffectDefinition } from './battle/effects';
import { GlobalBonuses } from './globalBonuses'; // Added GlobalBonuses

export const MAX_POTION_SLOTS_PER_HERO = 3; // Max Trank-Slots pro Held

export interface HeroStats {
  maxHp: number;
  damage: number;
  defense: number;
  attackSpeed: number;
  critChance?: number;
  critDamage?: number;
  healPower?: number;
  maxMana?: number;
  manaRegen?: number;
  hpRegen?: number;
  maxEnergyShield?: number;
  energyShieldRechargeRate?: number; 
  energyShieldRechargeDelay?: number; 
}

export type PermanentHeroBuff = {
  stat: keyof HeroStats;
  value: number;
  description: string;
};

export interface HeroDefinition {
  id: string;
  name: string;
  description: string;
  baseStats: HeroStats; 
  iconName: string;
  skillTreeId: string;
  recruitmentCost?: Cost[];
  unlockWaveRequirement?: number;
  attackType?: 'MELEE' | 'RANGED';
  rangedAttackRangeUnits?: number;
}

export interface PlayerHeroState {
  definitionId: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  skillPoints: number;
  skillLevels: Record<string, number>;
  specialAttackLevels: Record<string, number>;
  equipmentLevels: Record<string, number>;
  permanentBuffs: Array<PermanentHeroBuff>;
  ownedShards: PlayerOwnedShard[];
  appliedPermanentStats?: Partial<Record<keyof HeroStats, {flat: number, percent: number}>>; // Added for permanent potions
  potionSlots: Array<string | null>; 
}

// --- Ability Effect Definitions ---
export type AbilityEffectTargetScope = 'SELF' | 'CURRENT_TARGET' | 'ALL_ENEMIES_IN_RANGE' | 'ALL_ALLIES_IN_RANGE' | 'ALL_ENEMIES' | 'ALL_ALLIES';

interface BaseAbilityEffect {
    targetScope: AbilityEffectTargetScope;
    range?: number; 
}

export interface DamageAbilityEffect extends BaseAbilityEffect {
    type: 'DAMAGE';
    damageMultiplier: number; 
    numHits?: number; 
}

export interface HealAbilityEffect extends BaseAbilityEffect {
    type: 'HEAL';
    healAmount?: number; 
    healMultiplier?: number; 
    shieldHealPercentage?: number; 
}

export interface ApplyStatusAbilityEffect extends BaseAbilityEffect {
    type: 'APPLY_STATUS';
    statusEffectId?: string;
    inlineStatusEffect?: Omit<StatusEffectDefinition, 'id'>;
    chance?: number; 
}

export interface SummonAbilityEffect extends BaseAbilityEffect {
    type: 'SUMMON';
    enemyIdToSummon: string;
    count: number;
    isElite?: boolean;
}

export interface StatBuffDebuffAbilityEffect extends BaseAbilityEffect {
    type: 'STAT_MODIFIER';
    stat: keyof HeroStats;
    value: number;
    modifierType: 'FLAT' | 'PERCENTAGE_ADDITIVE';
    durationMs: number;
}

export interface TriggerChannelingAbilityEffect extends BaseAbilityEffect {
    type: 'TRIGGER_CHANNELING_ABILITY';
    abilityIdToTrigger: string; 
}

export interface TransformIntoEnemyEffect extends BaseAbilityEffect {
    type: 'TRANSFORM_INTO_ENEMY';
    enemyIdToTransformInto: string;
    inheritEliteStatus?: boolean; // Default true
}

export type AbilityEffect = 
  | DamageAbilityEffect 
  | HealAbilityEffect 
  | ApplyStatusAbilityEffect 
  | SummonAbilityEffect 
  | StatBuffDebuffAbilityEffect
  | TriggerChannelingAbilityEffect
  | TransformIntoEnemyEffect; // Added TransformIntoEnemyEffect


// --- Channeling Properties ---
export interface ChannelingProperties {
    channelDurationMs: number;
    blocksMovementWhileChanneling?: boolean; // Default true
    blocksActionsWhileChanneling?: boolean;  // Default true
    channelTickIntervalMs?: number; 
    effects: Partial<Record<AbilityEffectTriggerType, AbilityEffect[]>>; 
}

export interface SpecialAttackEffectDefinition {
  damageMultiplierBase: number;
  damageMultiplierIncreasePerLevel: number;
  numHitsBase: number;
  numHitsIncreasePerLevel: number;
  healAmountBase?: number;
  healAmountIncreasePerLevel?: number;
}

export interface SpecialAttackStatusEffectApplication {
  effectId?: string; 
  inlineEffect?: Omit<StatusEffectDefinition, 'id'>; 
  chance: number; 
  durationMsOverride?: (level: number) => number; 
}

export interface SpecialAttackDefinition {
  id: string;
  name: string;
  description: (level: number, calculatedData: CalculatedSpecialAttackData) => string;
  iconName: string;
  cooldownBaseMs: number;
  cooldownReductionPerLevelMs: number;
  targetType: SpecialAttackTargetType;
  effects: SpecialAttackEffectDefinition[]; 
  statusEffectsToApply?: SpecialAttackStatusEffectApplication[]; 
  channelingProperties?: ChannelingProperties; 
  maxLevel: number;
  costResource: ResourceType;
  costBase: number;
  costIncreasePerLevel: number;
  manaCostBase?: number;
  manaCostIncreasePerLevel?: number;
}

export interface CalculatedSpecialAttackData {
  currentDamageMultiplier: number;
  currentNumHits: number;
  currentCooldownMs: number;
  currentHealAmount?: number;
  currentManaCost?: number;
  nextLevelDamageMultiplier?: number;
  nextLevelNumHits?: number;
  nextLevelCooldownMs?: number;
  nextLevelHealAmount?: number;
  nextLevelManaCost?: number;
}

export interface HeroEquipmentDefinition {
  id: string;
  heroDefinitionId: string;
  slot: EquipmentSlot;
  name: string;
  description: (level: number, totalBonus: Partial<HeroStats>) => string;
  iconName: string;
  maxLevel: number;
  costsPerLevel: (currentLevel: number) => Cost[];
  statBonusesPerLevel: (level: number) => Partial<HeroStats>;
  unlockForgeLevel?: number; 
}

export interface StatBreakdownItem {
  source: string;
  value: number | string; 
  isPercentage?: boolean;
  isFlat?: boolean;
  valueDisplay?: string; 
}

export interface SharedSkillEffect {
  // `stat` can now be a key of HeroStats OR GlobalBonuses for flexibility
  stat: keyof HeroStats | keyof GlobalBonuses | 'heroXpGainBonus' | 'heroicPointsGainBonus' | 'enemyGoldDropBonus';
  baseValuePerMajorLevel: number[] | Array<{ flat?: number, percent?: number }>; // Can be simple number array (for direct stat) or object for combined flat/percent
  minorValuePerMinorLevel: number[] | Array<{ flat?: number, percent?: number }>; // Same as above
  isPercentage: boolean; // Overall type of bonus if simple numbers are used
}


export interface SharedSkillDefinition {
  id: string;
  name: string;
  description: (currentBonus: number | {flat: number, percent: number}, nextBonusPerMinorLevel: number | {flat: number, percent: number} | null, nextBonusPerMajorLevelUnlock: number | {flat: number, percent: number} | null, isPercentage: boolean) => string;
  iconName: string;
  maxMajorLevels: number;
  minorLevelsPerMajorTier: number[]; 
  costSharedSkillPointsPerMajorLevel: number[]; 
  costHeroXpPoolPerMinorLevel: (currentMajorLevel: number, currentMinorLevel: number) => number;
  effects: SharedSkillEffect[];
  prerequisites?: Array<{ skillId: string; majorLevel: number }>; 
  position?: { x: number; y: number }; 
  isPassiveEffect?: boolean; 
  nodeSize?: 'normal' | 'large'; 
}

export interface PlayerSharedSkillProgress {
  currentMajorLevel: number;
  currentMinorLevel: number;
}

export type PlayerSharedSkillsState = Record<string, PlayerSharedSkillProgress>;
