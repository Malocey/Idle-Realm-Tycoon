
import { BattleHero, BattleEnemy, ActionBattleParticipantAIState, HeroStats } from '../../types';
import { executeMeleeBehavior, executeRangedBehavior, executeHealerBehavior } from './behaviors';
import { findClosestTarget, performLineOfSightCheck } from '../core/utils'; // Adjusted import path
// calculateAStarPath etc. werden jetzt direkt von den Behavior-Modulen importiert, falls benötigt.
// Die `calculateMovementTowards_legacy` Funktion wurde entfernt.

type BattleParticipant = BattleHero | BattleEnemy;

// Helper function for pre-action checks
const handlePreActionChecks_BT = (participant: BattleParticipant): boolean => {
  return !(participant.currentHp <= 0 || ('isDying' in participant && (participant as BattleEnemy).isDying) || (participant.statusEffects && participant.statusEffects.some(se => se.type === 'STUN')));
};

// Helper function for target acquisition
const updateCurrentTarget_BT = (
  participant: BattleParticipant,
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[]
): BattleParticipant | null => {
  const potentialTargets: BattleParticipant[] = ('definitionId' in participant)
    ? allEnemies.filter(e => e.currentHp > 0 && !e.isDying)
    : allHeroes.filter(h => h.currentHp > 0);

  let currentTarget = potentialTargets.find(t => t.uniqueBattleId === participant.targetId);
  if (!currentTarget || currentTarget.currentHp <= 0 || (('isDying' in currentTarget) && (currentTarget as BattleEnemy).isDying)) {
    currentTarget = findClosestTarget(participant, potentialTargets, [participant.uniqueBattleId]);
    // Note: participant.targetId should be updated by the caller if this function is used to change it.
  }
  return currentTarget;
};


export const processParticipantAI_behaviorTree = (
  participant: BattleParticipant,
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[],
  arenaDimensions: { width: number, height: number, participantSize: number }
): {
    dx: number,
    dy: number,
    attackTargetId: string | null,
    actualTargetId: string | null, // The entity the AI is focused on (e.g. for movement)
    debugMovementTarget?: { x: number, y: number },
    aiState: ActionBattleParticipantAIState,
    aiRepositioningTarget?: { x: number, y: number },
    aiDecisionCooldownTicks?: number,
} => {
  if (!handlePreActionChecks_BT(participant)) {
    return { dx: 0, dy: 0, attackTargetId: null, actualTargetId: null, debugMovementTarget: undefined, aiState: 'IDLE', aiDecisionCooldownTicks: participant.aiDecisionCooldownTicks || 0, aiRepositioningTarget: undefined };
  }

  const target = updateCurrentTarget_BT(participant, allHeroes, allEnemies);
  const actualTargetId = target ? target.uniqueBattleId : null;
  
  // Update participant's targetId if the target changed
  if (participant.targetId !== actualTargetId) {
    participant.targetId = actualTargetId;
    // Reset AI state when target changes to allow fresh decision making
    participant.aiState = 'IDLE';
    participant.aiDecisionCooldownTicks = 0;
    participant.aiRepositioningTarget = undefined;
    participant.debugMovementTarget = undefined;
  }


  if (!target) {
    return { dx: 0, dy: 0, attackTargetId: null, actualTargetId: null, debugMovementTarget: undefined, aiState: 'IDLE', aiDecisionCooldownTicks: participant.aiDecisionCooldownTicks || 0, aiRepositioningTarget: undefined };
  }
  
  if (participant.aiDecisionCooldownTicks && participant.aiDecisionCooldownTicks > 0) {
      participant.aiDecisionCooldownTicks -=1;
  }

  if (participant.attackType === 'MELEE') {
    const result = executeMeleeBehavior(participant, allHeroes, allEnemies, arenaDimensions, target);
    return { ...result, actualTargetId };
  } else if (participant.attackType === 'RANGED') {
    const result = executeRangedBehavior(participant, allHeroes, allEnemies, arenaDimensions, target);
    return { ...result, actualTargetId };
  } else if (participant.id === 'CLERIC') { 
    const result = executeHealerBehavior(participant as BattleHero, allHeroes, allEnemies, arenaDimensions, target);
    return { ...result, actualTargetId };
  }

  // Default fallback
  return {
    dx: 0, dy: 0, attackTargetId: null, actualTargetId,
    debugMovementTarget: undefined, aiState: 'IDLE',
    aiRepositioningTarget: undefined, aiDecisionCooldownTicks: participant.aiDecisionCooldownTicks
  };
};
