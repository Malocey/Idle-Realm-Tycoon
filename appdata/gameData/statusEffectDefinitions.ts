
import { StatusEffectDefinition, StatusEffectType, HeroStats } from '../types';

export const STATUS_EFFECT_DEFINITIONS: Record<string, StatusEffectDefinition> = {
   'GENERIC_STUN': {
    id: 'GENERIC_STUN',
    name: 'Stun',
    type: StatusEffectType.STUN,
    durationMs: 1500, 
    iconName: 'STUNNED',
  },
};
