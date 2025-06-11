
import { StatusEffectDefinition, StatusEffectType, HeroStats } from '../types';

export const STATUS_EFFECT_DEFINITIONS: Record<string, StatusEffectDefinition> = {
   'GENERIC_STUN': {
    id: 'GENERIC_STUN',
    name: 'Stun',
    type: StatusEffectType.STUN,
    durationMs: 1500, 
    iconName: 'STUNNED',
  },
  'WARRIOR_UNYIELDING_DEFENSE_BUFF': {
    id: 'WARRIOR_UNYIELDING_DEFENSE_BUFF',
    name: 'Unyielding Defense',
    type: StatusEffectType.BUFF,
    durationMs: 5000, // 5 seconds
    iconName: 'SHIELD_BADGE',
    statAffected: 'defense' as keyof HeroStats,
    modifierType: 'PERCENTAGE_ADDITIVE', 
    value: 0, // Base value, actual value will be determined by skill level
  },
  'ARCHER_CRIPPLING_SHOT_SLOW': {
    id: 'ARCHER_CRIPPLING_SHOT_SLOW',
    name: 'Crippling Shot',
    type: StatusEffectType.DEBUFF,
    durationMs: 3000, // 3 seconds
    iconName: 'WARNING', 
    statAffected: 'attackSpeed' as keyof HeroStats, 
    modifierType: 'PERCENTAGE_ADDITIVE', 
    value: 0, // Base value, actual value will be determined by skill level
  },
   'PALADIN_DEFENDER_BUFF': {
    id: 'PALADIN_DEFENDER_BUFF',
    name: 'Steadfast Defense',
    type: StatusEffectType.BUFF,
    durationMs: 4000, // 4 seconds
    iconName: 'SHIELD_BADGE',
    statAffected: 'defense' as keyof HeroStats,
    modifierType: 'PERCENTAGE_ADDITIVE',
    value: 0, // Base value, actual value will be determined by skill level
  },
  'CLERIC_DIVINE_FAVOR_SHIELD': {
    id: 'CLERIC_DIVINE_FAVOR_SHIELD',
    name: 'Divine Shield',
    type: StatusEffectType.BUFF,
    durationMs: 6000, // 6 seconds, for example
    iconName: 'SHIELD', 
    statAffected: 'maxHp' as keyof HeroStats, // Will also affect currentHp
    modifierType: 'FLAT', 
    value: 0, // Actual shield amount determined by proc
  },
};
