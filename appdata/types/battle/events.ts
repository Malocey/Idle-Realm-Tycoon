export interface AttackEvent {
  attackerId: string;
  targetId: string;
  damage: number; // HP damage
  shieldDamage?: number; // Shield damage
  isCrit: boolean;
  timestamp: number;
  isSpecialAttack?: boolean;
  specialAttackName?: string;
  isHeal?: boolean;
  healAmount?: number;
  shieldHealAmount?: number; // New: Amount of shield healed
  appliedStatusEffectName?: string; // Optional: Name of status effect applied by this attack
  isDotDamage?: boolean; // Flag if this damage came from a DOT
}

export interface BuildingLevelUpEventInBattle {
  id: string;
  buildingId: string;
  buildingName: string;
  newLevel: number;
  iconName: string;
  timestamp: number;
}

export interface DamagePopupInState {
  id: string; // Unique ID for React key
  targetParticipantId: string; // To find the participant for positioning
  amount: number;
  type: 'damage' | 'crit' | 'heal' | 'shield'; // For styling
  timestamp: number; // Creation timestamp for animation timing
}