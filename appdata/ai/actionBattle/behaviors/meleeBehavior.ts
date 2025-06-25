


import { BattleHero, BattleEnemy, ActionBattleParticipantAIState } from '../../../types';
import { MOVEMENT_SPEED_UNITS_PER_TICK, ATTACK_RANGE_UNITS, PARTICIPANT_SIZE_UNITS } from '../../../constants';
import { calculateAStarPath, checkCollision, getAdjacentAttackSlots, heuristic } from '../../core/pathfinding'; // Added heuristic
import { findClosestTarget } from '../../core/utils';
import { calculateArriveForce, calculateSeparationForce } from '../../core/steering'; 

type BattleParticipant = BattleHero | BattleEnemy;

const AI_DECISION_COOLDOWN_MELEE = 5; 
const PROXIMITY_PENALTY_WEIGHT = 0.8;
const ALLY_PROXIMITY_THRESHOLD_SQUARED = Math.pow(PARTICIPANT_SIZE_UNITS * 1.75, 2);
const SLOWING_RADIUS_ARRIVE = PARTICIPANT_SIZE_UNITS * 2; 
const SEPARATION_RADIUS_MELEE = PARTICIPANT_SIZE_UNITS * 1.5; 
const SEPARATION_MAX_FORCE_MELEE = MOVEMENT_SPEED_UNITS_PER_TICK * 0.8; 
const ARRIVE_FORCE_WEIGHT = 1.0;
const SEPARATION_FORCE_WEIGHT = 1.5;
const SLOT_COLLISION_PENALTY = 10000; // Large penalty for a directly obstructed slot


export const executeMeleeBehavior = (
  participant: BattleParticipant,
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[],
  arenaDimensions: { width: number; height: number; participantSize: number },
  target: BattleParticipant
): {
    dx: number,
    dy: number,
    attackTargetId: string | null,
    debugMovementTarget?: { x: number, y: number },
    aiState: ActionBattleParticipantAIState,
    aiDecisionCooldownTicks: number,
} => {
  let dx = 0;
  let dy = 0;
  let attackTargetId: string | null = null;
  let currentAIState: ActionBattleParticipantAIState = participant.aiState || 'IDLE';
  let debugTargetPos = participant.debugMovementTarget;
  let decisionCooldown = participant.aiDecisionCooldownTicks || 0;

  const effectiveAttackRangeSq = ATTACK_RANGE_UNITS * ATTACK_RANGE_UNITS;
  const dxToTarget = target.x - participant.x;
  const dyToTarget = target.y - participant.y;
  const distanceToTargetSq = dxToTarget * dxToTarget + dyToTarget * dyToTarget;
  const isReadyToAttack = participant.attackCooldownRemainingTicks <= 0;
  const allUnitsForCollisionCheck = [...allHeroes, ...allEnemies]; // Moved definition here

  
  if (currentAIState === 'MOVING_TO_ENGAGE' && debugTargetPos) {
    const allies = ('definitionId' in participant) ? allHeroes : allEnemies;
    const blockingAlly = allies.find(ally =>
        ally.uniqueBattleId !== participant.uniqueBattleId &&
        Math.abs(ally.x - debugTargetPos!.x) < arenaDimensions.participantSize / 2 &&
        Math.abs(ally.y - debugTargetPos!.y) < arenaDimensions.participantSize / 2
    );
    if (blockingAlly) {
        decisionCooldown = 0;
        debugTargetPos = undefined;
        currentAIState = 'IDLE';
    }
  }

  if (distanceToTargetSq <= effectiveAttackRangeSq && isReadyToAttack) {
    currentAIState = 'ATTACKING';
    attackTargetId = target.uniqueBattleId;
    dx = 0;
    dy = 0;
    debugTargetPos = { x: participant.x, y: participant.y }; 
    decisionCooldown = AI_DECISION_COOLDOWN_MELEE;
  } else { 
    if (decisionCooldown <= 0 || currentAIState !== 'MOVING_TO_ENGAGE' || !debugTargetPos) {
      const evaluatedSlots: Array<{ x: number, y: number, cost: number, finalAdjustedCost: number }> = [];
      const potentialSlots = getAdjacentAttackSlots(target.x, target.y, arenaDimensions.participantSize, arenaDimensions.participantSize);
      // Removed definition of allUnitsForCollisionCheck from here

      for (const slot of potentialSlots) {
        const boundedX = Math.max(arenaDimensions.participantSize / 2, Math.min(slot.x, arenaDimensions.width - arenaDimensions.participantSize * 1.5));
        const boundedY = Math.max(arenaDimensions.participantSize / 2, Math.min(slot.y, arenaDimensions.height - arenaDimensions.participantSize * 1.5));

        // Simplified cost: distance + collision penalty
        const distToSlot = heuristic({ x: participant.x, y: participant.y }, { x: boundedX, y: boundedY });
        let slotCost = distToSlot;
        
        // Simplified collision check for the slot itself (not full path)
        const obstaclesForSlot = allUnitsForCollisionCheck.filter(p => p.uniqueBattleId !== participant.uniqueBattleId && p.uniqueBattleId !== target.uniqueBattleId);
        if (checkCollision(boundedX, boundedY, arenaDimensions.participantSize * 0.7, obstaclesForSlot, participant.uniqueBattleId)) {
            slotCost += SLOT_COLLISION_PENALTY;
        }

        let proximityPenalty = 0;
        const allies = ('definitionId' in participant) ? allHeroes : allEnemies;
        const alliedMeleeAttackers = allies.filter(ally =>
          ally.uniqueBattleId !== participant.uniqueBattleId &&
          ally.targetId === target.uniqueBattleId &&
          ally.attackType === 'MELEE' &&
          ally.currentHp > 0 &&
          (!('isDying' in ally) || !(ally as BattleEnemy).isDying)
        );

        alliedMeleeAttackers.forEach(ally => {
          const allyPos = ally.debugMovementTarget || { x: ally.x, y: ally.y };
          const dAllyX = boundedX - allyPos.x;
          const dAllyY = boundedY - allyPos.y;
          const distToAllySq = dAllyX * dAllyX + dAllyY * dAllyY;
          if (distToAllySq < ALLY_PROXIMITY_THRESHOLD_SQUARED) {
            proximityPenalty += (slotCost * PROXIMITY_PENALTY_WEIGHT) + 500; // Proximity penalty based on the simpler slotCost
          }
        });
        evaluatedSlots.push({ x: boundedX, y: boundedY, cost: slotCost, finalAdjustedCost: slotCost + proximityPenalty });
      }

      if (evaluatedSlots.length > 0) {
        evaluatedSlots.sort((a, b) => a.finalAdjustedCost - b.finalAdjustedCost);
        debugTargetPos = { x: evaluatedSlots[0].x, y: evaluatedSlots[0].y };
      } else {
        // Fallback: If no slots evaluated (shouldn't happen if potentialSlots is populated), try to move towards target's edge
        const pathResult = calculateAStarPath(participant.x, participant.y, target.x, target.y, allUnitsForCollisionCheck, participant.uniqueBattleId, arenaDimensions, false, null);
        if (pathResult && pathResult.path.length > 1) {
            let potentialTargetPos = pathResult.path[pathResult.path.length -1];
            for(let i = pathResult.path.length -1; i >=0; i--) {
                const node = pathResult.path[i];
                const dX = target.x - node.x;
                const dY = target.y - node.y;
                if((dX*dX + dY*dY) <= effectiveAttackRangeSq * 0.9) {
                    potentialTargetPos = node;
                    break;
                }
            }
             debugTargetPos = potentialTargetPos;
        } else {
             debugTargetPos = { x: target.x, y: target.y }; // Absolute fallback
        }
      }
      currentAIState = 'MOVING_TO_ENGAGE';
      decisionCooldown = AI_DECISION_COOLDOWN_MELEE;
    }

    if (debugTargetPos) {
      const currentPos = { x: participant.x, y: participant.y };
      const currentVelocity = { x: 0, y: 0 }; 

      const arriveForce = calculateArriveForce(currentPos, debugTargetPos, currentVelocity, MOVEMENT_SPEED_UNITS_PER_TICK, SLOWING_RADIUS_ARRIVE);

      const friendlyUnits = ('definitionId' in participant) ? allHeroes : allEnemies;
      const separationForce = calculateSeparationForce(participant, friendlyUnits.filter(u => u.attackType === 'MELEE'), SEPARATION_RADIUS_MELEE, SEPARATION_MAX_FORCE_MELEE);

      let totalForce = {
        x: arriveForce.x * ARRIVE_FORCE_WEIGHT + separationForce.x * SEPARATION_FORCE_WEIGHT,
        y: arriveForce.y * ARRIVE_FORCE_WEIGHT + separationForce.y * SEPARATION_FORCE_WEIGHT,
      };

      const magnitude = Math.sqrt(totalForce.x * totalForce.x + totalForce.y * totalForce.y);
      if (magnitude > MOVEMENT_SPEED_UNITS_PER_TICK) {
        totalForce.x = (totalForce.x / magnitude) * MOVEMENT_SPEED_UNITS_PER_TICK;
        totalForce.y = (totalForce.y / magnitude) * MOVEMENT_SPEED_UNITS_PER_TICK;
      }
      dx = totalForce.x;
      dy = totalForce.y;

      const nextX = participant.x + dx;
      const nextY = participant.y + dy;
      const obstacles = allUnitsForCollisionCheck.filter(p => p.uniqueBattleId !== participant.uniqueBattleId && p.uniqueBattleId !== target.uniqueBattleId); 
      if (checkCollision(nextX, nextY, arenaDimensions.participantSize, obstacles, participant.uniqueBattleId)) {
          if (!checkCollision(participant.x + dx, participant.y, arenaDimensions.participantSize, obstacles, participant.uniqueBattleId)) {
            dy = 0;
          } else if (!checkCollision(participant.x, participant.y + dy, arenaDimensions.participantSize, obstacles, participant.uniqueBattleId)) {
            dx = 0;
          } else {
            dx = 0;
            dy = 0;
          }
      }

      const distToDebugTargetSq = (debugTargetPos.x - participant.x)**2 + (debugTargetPos.y - participant.y)**2;
      if (distToDebugTargetSq < (MOVEMENT_SPEED_UNITS_PER_TICK / 2)**2) { 
          dx = debugTargetPos.x - participant.x; 
          dy = debugTargetPos.y - participant.y;
      }
    } else if (!isReadyToAttack && distanceToTargetSq <= effectiveAttackRangeSq) {
        currentAIState = 'ATTACKING'; 
        dx = 0;
        dy = 0;
    }
  }

  return { dx, dy, attackTargetId, debugMovementTarget: debugTargetPos, aiState: currentAIState, aiDecisionCooldownTicks: decisionCooldown };
};
