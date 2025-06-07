import { BattleHero, BattleEnemy, ActionBattleParticipantAIState } from '../../../types';
import { MOVEMENT_SPEED_UNITS_PER_TICK, RANGED_ATTACK_RANGE_UNITS_DEFAULT } from '../../../constants';
import { calculateAStarPath, checkCollision } from '../../core/pathfinding';
import { findClosestTarget, performLineOfSightCheck } from '../../core/utils';

type BattleParticipant = BattleHero | BattleEnemy;

const AI_DECISION_COOLDOWN_RANGED_HOLD = 8;
const AI_RANGED_REPOSITION_COMMIT_TICKS = 25;

export const executeRangedBehavior = (
  participant: BattleParticipant,
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[],
  arenaDimensions: { width: number; height: number; participantSize: number },
  target: BattleParticipant // Target is now passed in
): {
    dx: number,
    dy: number,
    attackTargetId: string | null,
    debugMovementTarget?: { x: number, y: number },
    aiState: ActionBattleParticipantAIState,
    aiRepositioningTarget?: { x: number, y: number },
    aiDecisionCooldownTicks: number,
} => {
  let dx = 0;
  let dy = 0;
  let attackTargetId: string | null = null;
  let currentAIState: ActionBattleParticipantAIState = participant.aiState || 'IDLE';
  let currentRepositioningTarget = participant.aiRepositioningTarget;
  let debugTargetPos = participant.debugMovementTarget;
  let decisionCooldown = participant.aiDecisionCooldownTicks || 0;

  const idealRange = participant.rangedAttackRangeUnits || RANGED_ATTACK_RANGE_UNITS_DEFAULT;
  const effectiveAttackRangeSq = idealRange * idealRange;
  const dxToTarget = target.x - participant.x;
  const dyToTarget = target.y - participant.y;
  const distanceToTargetSq = dxToTarget * dxToTarget + dyToTarget * dyToTarget;
  const isReadyToAttack = participant.attackCooldownRemainingTicks <= 0;

  const LoSBlocked = performLineOfSightCheck(participant, target, [...allHeroes, ...allEnemies], arenaDimensions.participantSize);
  const isInAttackRangeAndHasLoS = distanceToTargetSq <= effectiveAttackRangeSq && !LoSBlocked;

  if (currentAIState === 'ATTACKING') {
    if (!isInAttackRangeAndHasLoS) { // Lost the shot
      currentAIState = 'IDLE';
      decisionCooldown = 0; // Force immediate re-evaluation
    } else if (isReadyToAttack) {
      attackTargetId = target.uniqueBattleId;
    }
    // Else (waiting for cooldown, still has shot), hold position (dx=0, dy=0)
  } else if (currentAIState === 'REPOSITIONING') {
    if (!currentRepositioningTarget || decisionCooldown <= 0) {
      currentAIState = 'IDLE';
      currentRepositioningTarget = undefined;
      decisionCooldown = 0;
    } else {
        const dxTotalMove = currentRepositioningTarget.x - participant.x;
        const dyTotalMove = currentRepositioningTarget.y - participant.y;
        const distanceMove = Math.sqrt(dxTotalMove * dxTotalMove + dyTotalMove * dyTotalMove);

        if (distanceMove > 1) {
            const path = calculateAStarPath(participant.x, participant.y, currentRepositioningTarget.x, currentRepositioningTarget.y, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions);
            if (path && path.path.length > 1) {
                const nextStep = path.path[1];
                const aStarDx = nextStep.x - participant.x;
                const aStarDy = nextStep.y - participant.y;
                const aStarDist = Math.sqrt(aStarDx*aStarDx + aStarDy*aStarDy);
                if (aStarDist > 0) {
                    const moveRatio = Math.min(1, MOVEMENT_SPEED_UNITS_PER_TICK / aStarDist);
                    dx = aStarDx * moveRatio;
                    dy = aStarDy * moveRatio;
                }
            } else if (distanceMove > MOVEMENT_SPEED_UNITS_PER_TICK / 2) {
                dx = (dxTotalMove / distanceMove) * MOVEMENT_SPEED_UNITS_PER_TICK;
                dy = (dyTotalMove / distanceMove) * MOVEMENT_SPEED_UNITS_PER_TICK;
            } else {
                dx = dxTotalMove;
                dy = dyTotalMove;
            }
        }
        debugTargetPos = currentRepositioningTarget;
        if (Math.abs(participant.x - currentRepositioningTarget.x) < MOVEMENT_SPEED_UNITS_PER_TICK && Math.abs(participant.y - currentRepositioningTarget.y) < MOVEMENT_SPEED_UNITS_PER_TICK) {
            currentAIState = 'IDLE'; // Reached reposition target
            currentRepositioningTarget = undefined;
            decisionCooldown = 0;
        }
    }
  } else { // IDLE or re-evaluating
    if (isInAttackRangeAndHasLoS && isReadyToAttack) {
      currentAIState = 'ATTACKING';
      attackTargetId = target.uniqueBattleId;
      decisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD;
    } else if (decisionCooldown <= 0) { // Time for a new general decision
      let desiredX = participant.x;
      let desiredY = participant.y;
      const distToTarget = Math.sqrt(distanceToTargetSq);

      if (distToTarget < idealRange * 0.7 && distToTarget > 0) { // Too close
        desiredX = participant.x - (dxToTarget / distToTarget) * (idealRange - distToTarget);
        desiredY = participant.y - (dyToTarget / distToTarget) * (idealRange - distToTarget);
      } else if (distToTarget > idealRange * 1.1 || LoSBlocked) { // Too far or LoS blocked
        if (LoSBlocked) {
          const sidestepAngleOffset = Math.random() > 0.5 ? Math.PI / 2.5 : -Math.PI / 2.5;
          const sidestepAngle = Math.atan2(dyToTarget, dxToTarget) + sidestepAngleOffset;
          desiredX = participant.x + Math.cos(sidestepAngle) * idealRange * 0.3;
          desiredY = participant.y + Math.sin(sidestepAngle) * idealRange * 0.3;
        } else if (distToTarget > 0) {
          desiredX = participant.x + (dxToTarget / distToTarget) * MOVEMENT_SPEED_UNITS_PER_TICK * 2;
          desiredY = participant.y + (dyToTarget / distToTarget) * MOVEMENT_SPEED_UNITS_PER_TICK * 2;
        }
      } else { // Good range and LoS clear, but attack not ready
        currentAIState = 'ATTACKING'; // Hold position while waiting
        decisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD;
      }
      
      const boundedX = Math.max(arenaDimensions.participantSize / 2, Math.min(desiredX, arenaDimensions.width - arenaDimensions.participantSize * 1.5));
      const boundedY = Math.max(arenaDimensions.participantSize / 2, Math.min(desiredY, arenaDimensions.height - arenaDimensions.participantSize * 1.5));
      
      const finalPos = { x: boundedX, y: boundedY };

      // If decided to move (desiredX/Y changed from current participant.x/y)
      if (Math.abs(finalPos.x - participant.x) > 1 || Math.abs(finalPos.y - participant.y) > 1) {
          if (!checkCollision(finalPos.x, finalPos.y, arenaDimensions.participantSize, [...allHeroes, ...allEnemies].filter(p => p.uniqueBattleId !== target.uniqueBattleId && p.uniqueBattleId !== participant.uniqueBattleId), participant.uniqueBattleId)) {
                currentAIState = 'REPOSITIONING';
                currentRepositioningTarget = finalPos;
                debugTargetPos = finalPos;
                decisionCooldown = AI_RANGED_REPOSITION_COMMIT_TICKS;
                
                // Movement towards this new position
                const dxTotalMove = finalPos.x - participant.x;
                const dyTotalMove = finalPos.y - participant.y;
                const distanceMove = Math.sqrt(dxTotalMove * dxTotalMove + dyTotalMove * dyTotalMove);
                if(distanceMove > 0) {
                    dx = (dxTotalMove / distanceMove) * MOVEMENT_SPEED_UNITS_PER_TICK;
                    dy = (dyTotalMove / distanceMove) * MOVEMENT_SPEED_UNITS_PER_TICK;
                }
          } else {
             currentAIState = 'IDLE'; // Can't find a clear spot, wait
             decisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD / 2;
          }
      } else if (currentAIState !== 'ATTACKING') { // If not moving and not attacking, stay idle briefly
           currentAIState = 'IDLE';
           decisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD / 2;
      }

    } else if (currentRepositioningTarget) { // Continue committed reposition if cooldown is active
       currentAIState = 'REPOSITIONING';
       const dxTotalMove = currentRepositioningTarget.x - participant.x;
       const dyTotalMove = currentRepositioningTarget.y - participant.y;
       const distanceMove = Math.sqrt(dxTotalMove * dxTotalMove + dyTotalMove * dyTotalMove);
       if (distanceMove > 1) {
           dx = (dxTotalMove / distanceMove) * MOVEMENT_SPEED_UNITS_PER_TICK;
           dy = (dyTotalMove / distanceMove) * MOVEMENT_SPEED_UNITS_PER_TICK;
       } else {
           currentRepositioningTarget = undefined; // Reached
           currentAIState = 'IDLE';
           decisionCooldown = 0;
       }
       debugTargetPos = currentRepositioningTarget;
    }
  }

  return { dx, dy, attackTargetId, debugMovementTarget: debugTargetPos, aiState: currentAIState, aiRepositioningTarget: currentRepositioningTarget, aiDecisionCooldownTicks: decisionCooldown };
};
