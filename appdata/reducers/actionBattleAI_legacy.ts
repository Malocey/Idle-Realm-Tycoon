import { BattleHero, BattleEnemy, ActionBattleParticipantAIState } from '../types';
import { executeMeleeBehavior, executeRangedBehavior, executeHealerBehavior } from '../ai/actionBattle/behaviors';
import { findClosestTarget, performLineOfSightCheck } from '../ai/core/utils';
import { calculateAStarPath, checkCollision, getAdjacentAttackSlots, heuristic, reconstructPath } from '../ai/core/pathfinding';


type BattleParticipant = BattleHero | BattleEnemy;

export { findClosestTarget as findClosestTarget_legacy, checkCollision as checkCollision_legacy }; // Exporting for actionBattleReducer

export const processParticipantAI_legacy = (
  participant: BattleParticipant,
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[],
  arenaDimensions: { width: number, height: number, participantSize: number }
): {
    dx: number,
    dy: number,
    attackTargetId: string | null,
    actualTargetId: string | null,
    debugMovementTarget?: { x: number, y: number },
    aiState: ActionBattleParticipantAIState,
    aiRepositioningTarget?: { x: number, y: number },
    aiDecisionCooldownTicks?: number,
} => {
  if (participant.currentHp <= 0 || ('isDying' in participant && (participant as BattleEnemy).isDying) || (participant.statusEffects && participant.statusEffects.some(se => se.type === 'STUN'))) {
    return { dx: 0, dy: 0, attackTargetId: null, actualTargetId: null, debugMovementTarget: undefined, aiState: 'IDLE', aiDecisionCooldownTicks: participant.aiDecisionCooldownTicks || 0, aiRepositioningTarget: undefined };
  }

  const potentialTargets: BattleParticipant[] = ('definitionId' in participant)
    ? allEnemies.filter(e => e.currentHp > 0 && !e.isDying)
    : allHeroes.filter(h => h.currentHp > 0);

  let target = potentialTargets.find(t => t.uniqueBattleId === participant.targetId);
  if (!target || target.currentHp <= 0 || (('isDying' in target) && (target as BattleEnemy).isDying)) {
    target = findClosestTarget(participant, potentialTargets, [participant.uniqueBattleId]);
    participant.targetId = target ? target.uniqueBattleId : null;
  }
  
  const actualTargetId = target ? target.uniqueBattleId : null;

  if (!target) {
    return { dx: 0, dy: 0, attackTargetId: null, actualTargetId: null, debugMovementTarget: undefined, aiState: 'IDLE', aiDecisionCooldownTicks: participant.aiDecisionCooldownTicks || 0, aiRepositioningTarget: undefined };
  }

  // Pathfinding and AI utility functions are now passed as arguments to behavior functions if needed,
  // or used internally by them by importing directly.
  // For simplicity in this refactor, the behavior functions will import them.

  if (participant.attackType === 'MELEE') {
    const result = executeMeleeBehavior(participant, allHeroes, allEnemies, arenaDimensions, target);
    return { ...result, actualTargetId };
  } else if (participant.attackType === 'RANGED') {
    const result = executeRangedBehavior(participant, allHeroes, allEnemies, arenaDimensions, target);
    return { ...result, actualTargetId };
  } else if (participant.id === 'CLERIC') { // Specific handling for cleric if needed, or general healer role
     const result = executeHealerBehavior(participant as BattleHero, allHeroes, allEnemies, arenaDimensions, target);
     return { ...result, actualTargetId };
  }


  // Default fallback (should ideally not be reached if all types are handled)
  return {
    dx: 0, dy: 0, attackTargetId: null, actualTargetId,
    debugMovementTarget: undefined, aiState: 'IDLE',
    aiRepositioningTarget: undefined, aiDecisionCooldownTicks: participant.aiDecisionCooldownTicks
  };
};
