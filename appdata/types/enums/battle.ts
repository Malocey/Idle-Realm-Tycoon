
export enum SpecialAttackTargetType {
  SINGLE_ENEMY = 'SINGLE_ENEMY',
  ALL_ENEMIES = 'ALL_ENEMIES',
  RANDOM_ENEMY = 'RANDOM_ENEMY',
  SINGLE_ALLY = 'SINGLE_ALLY',
  ALL_ALLIES = 'ALL_ALLIES',
}

export type ActionBattleParticipantAIState = 'IDLE' | 'MOVING_TO_ENGAGE' | 'ATTACKING' | 'REPOSITIONING' | 'FLEEING' | 'CHANNELING';

export enum StatusEffectType {
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF',
  STUN = 'STUN',
  DOT = 'DOT', // Damage Over Time
}

export enum AbilityEffectTriggerType {
  ON_CHANNEL_START = 'ON_CHANNEL_START',
  ON_CHANNEL_TICK = 'ON_CHANNEL_TICK',
  ON_CHANNEL_COMPLETE = 'ON_CHANNEL_COMPLETE',
  ON_CHANNEL_INTERRUPT = 'ON_CHANNEL_INTERRUPT',
}
