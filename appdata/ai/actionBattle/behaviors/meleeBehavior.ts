
import { BattleHero, BattleEnemy, ActionBattleParticipantAIState } from '../../../types';
import { MOVEMENT_SPEED_UNITS_PER_TICK, ATTACK_RANGE_UNITS, PARTICIPANT_SIZE_UNITS } from '../../../constants';
import { calculateAStarPath, checkCollision, getAdjacentAttackSlots } from '../../core/pathfinding';
import { findClosestTarget } from '../../core/utils';
import { calculateArriveForce, calculateSeparationForce } from '../../core/steering'; // Import steering behaviors

type BattleParticipant = BattleHero | BattleEnemy;

const AI_DECISION_COOLDOWN_MELEE = 5; // Ticks
const PROXIMITY_PENALTY_WEIGHT = 0.8;
const ALLY_PROXIMITY_THRESHOLD_SQUARED = Math.pow(PARTICIPANT_SIZE_UNITS * 1.75, 2);
const SLOWING_RADIUS_ARRIVE = PARTICIPANT_SIZE_UNITS * 2; // Radius, in dem die Einheit beginnt zu verlangsamen
const SEPARATION_RADIUS_MELEE = PARTICIPANT_SIZE_UNITS * 1.5; // Radius für die Trennungskraft
const SEPARATION_MAX_FORCE_MELEE = MOVEMENT_SPEED_UNITS_PER_TICK * 0.8; // Maximale Stärke der Trennungskraft
const ARRIVE_FORCE_WEIGHT = 1.0;
const SEPARATION_FORCE_WEIGHT = 1.5;


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

  // Neubewertung, wenn der aktuelle Ziel-Slot von einem Verbündeten blockiert ist
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
    // Im Angriffsmodus nicht bewegen, außer die Attacke selbst hat eine kleine Bewegungskomponente
    dx = 0;
    dy = 0;
    debugTargetPos = { x: participant.x, y: participant.y }; // Halte Position zum Angreifen
    decisionCooldown = AI_DECISION_COOLDOWN_MELEE;
  } else { // Muss sich bewegen oder auf Cooldown warten
    if (decisionCooldown <= 0 || currentAIState !== 'MOVING_TO_ENGAGE' || !debugTargetPos) {
      const evaluatedSlots: Array<{ x: number, y: number, cost: number, finalAdjustedCost: number }> = [];
      const potentialSlots = getAdjacentAttackSlots(target.x, target.y, arenaDimensions.participantSize, arenaDimensions.participantSize);

      for (const slot of potentialSlots) {
        const boundedX = Math.max(arenaDimensions.participantSize / 2, Math.min(slot.x, arenaDimensions.width - arenaDimensions.participantSize * 1.5));
        const boundedY = Math.max(arenaDimensions.participantSize / 2, Math.min(slot.y, arenaDimensions.height - arenaDimensions.participantSize * 1.5));

        const pathResult = calculateAStarPath(participant.x, participant.y, boundedX, boundedY, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions, true, target.uniqueBattleId);
        if (pathResult) {
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
              proximityPenalty += (pathResult.cost * PROXIMITY_PENALTY_WEIGHT) + 500;
            }
          });
          evaluatedSlots.push({ x: boundedX, y: boundedY, cost: pathResult.cost, finalAdjustedCost: pathResult.cost + proximityPenalty });
        }
      }

      if (evaluatedSlots.length > 0) {
        evaluatedSlots.sort((a, b) => a.finalAdjustedCost - b.finalAdjustedCost);
        debugTargetPos = { x: evaluatedSlots[0].x, y: evaluatedSlots[0].y };
      } else {
        const directPathToTarget = calculateAStarPath(participant.x, participant.y, target.x, target.y, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions, false, null);
        if (directPathToTarget && directPathToTarget.path.length > 1) {
            let potentialTargetPos = directPathToTarget.path[directPathToTarget.path.length -1];
            for(let i = directPathToTarget.path.length -1; i >=0; i--) {
                const node = directPathToTarget.path[i];
                const dX = target.x - node.x;
                const dY = target.y - node.y;
                if((dX*dX + dY*dY) <= effectiveAttackRangeSq * 0.9) {
                    potentialTargetPos = node;
                    break;
                }
            }
             debugTargetPos = potentialTargetPos;
        } else {
             debugTargetPos = { x: target.x, y: target.y };
        }
      }
      currentAIState = 'MOVING_TO_ENGAGE';
      decisionCooldown = AI_DECISION_COOLDOWN_MELEE; // Kurzer Cooldown, um nicht ständig Slots neu zu bewerten, außer es gibt eine Blockade
    }

    // Steering-basierte Bewegung, wenn ein Ziel-Slot (debugTargetPos) gesetzt ist
    if (debugTargetPos) {
      const currentPos = { x: participant.x, y: participant.y };
      const currentVelocity = { x: 0, y: 0 }; // Vereinfachung: keine aktuelle Geschwindigkeit für die Berechnung

      // Ankunftskraft zum Ziel-Slot
      const arriveForce = calculateArriveForce(currentPos, debugTargetPos, currentVelocity, MOVEMENT_SPEED_UNITS_PER_TICK, SLOWING_RADIUS_ARRIVE);

      // Trennungskraft von verbündeten Nahkämpfern
      const friendlyUnits = ('definitionId' in participant) ? allHeroes : allEnemies;
      const separationForce = calculateSeparationForce(participant, friendlyUnits.filter(u => u.attackType === 'MELEE'), SEPARATION_RADIUS_MELEE, SEPARATION_MAX_FORCE_MELEE);

      // Kombinierte Kraft
      let totalForce = {
        x: arriveForce.x * ARRIVE_FORCE_WEIGHT + separationForce.x * SEPARATION_FORCE_WEIGHT,
        y: arriveForce.y * ARRIVE_FORCE_WEIGHT + separationForce.y * SEPARATION_FORCE_WEIGHT,
      };

      // Geschwindigkeit auf maximale Bewegungsgeschwindigkeit begrenzen
      const magnitude = Math.sqrt(totalForce.x * totalForce.x + totalForce.y * totalForce.y);
      if (magnitude > MOVEMENT_SPEED_UNITS_PER_TICK) {
        totalForce.x = (totalForce.x / magnitude) * MOVEMENT_SPEED_UNITS_PER_TICK;
        totalForce.y = (totalForce.y / magnitude) * MOVEMENT_SPEED_UNITS_PER_TICK;
      }
      dx = totalForce.x;
      dy = totalForce.y;

      // Einfache Kollisionsprüfung für den resultierenden Schritt
      const nextX = participant.x + dx;
      const nextY = participant.y + dy;
      const obstacles = [...allHeroes, ...allEnemies].filter(p => p.uniqueBattleId !== participant.uniqueBattleId && p.uniqueBattleId !== target.uniqueBattleId); // Exclude self and target
      if (checkCollision(nextX, nextY, arenaDimensions.participantSize, obstacles, participant.uniqueBattleId)) {
          // Versuche, nur X oder Y zu bewegen, oder stoppe, wenn beides blockiert ist.
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
      if (distToDebugTargetSq < (MOVEMENT_SPEED_UNITS_PER_TICK / 2)**2) { // Nahe genug am Ziel-Slot
          dx = debugTargetPos.x - participant.x; // Letzter kleiner Sprung
          dy = debugTargetPos.y - participant.y;
          // Nicht direkt auf IDLE setzen, damit die Angriffsbereitschaft im nächsten Tick geprüft wird
      }
    } else if (!isReadyToAttack && distanceToTargetSq <= effectiveAttackRangeSq) {
        // Im Bereich, aber Angriff auf Cooldown -> Halte Position
        currentAIState = 'ATTACKING'; // Setze Status auf Angreifen, obwohl wir nur warten
        dx = 0;
        dy = 0;
    }
  }

  return { dx, dy, attackTargetId, debugMovementTarget: debugTargetPos, aiState: currentAIState, aiDecisionCooldownTicks: decisionCooldown };
};
