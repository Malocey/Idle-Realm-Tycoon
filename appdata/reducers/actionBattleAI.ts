
import { BattleHero, BattleEnemy, ActionBattleState, HeroStats, Projectile, ActionBattleParticipantAIState } from '../types';
import { ARENA_WIDTH_UNITS, ARENA_HEIGHT_UNITS, PARTICIPANT_SIZE_UNITS, MOVEMENT_SPEED_UNITS_PER_TICK, RANGED_ATTACK_RANGE_UNITS_DEFAULT, ATTACK_RANGE_UNITS, GAME_TICK_MS, ATTACK_ANIMATION_TICKS, PROJECTILE_SPEED_PER_TICK } from '../constants';

type BattleParticipant = BattleHero | BattleEnemy;

// A* Pathfinding Types
interface PathNode {
    x: number;
    y: number;
    g: number; // Cost from start to this node
    h: number; // Heuristic cost from this node to target
    f: number; // g + h
    parent: PathNode | null;
}
const MAX_ASTAR_ITERATIONS = 100;
const ASTAR_CELL_SIZE = PARTICIPANT_SIZE_UNITS / 2; // Smaller cell size for more granular pathing

// AI Decision Cooldowns (in ticks)
const AI_DECISION_COOLDOWN_MELEE = 5; // Short cooldown for melee to reassess if target moves
const AI_DECISION_COOLDOWN_RANGED_HOLD = 8; // Cooldown for ranged unit holding a good position
const AI_RANGED_REPOSITION_COMMIT_TICKS = 25; // How long a ranged unit commits to a reposition target

// Heuristic function (Manhattan distance for grid movement)
const heuristic = (a: { x: number, y: number }, b: { x: number, y: number }): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Reconstruct path from A* result
const reconstructPath = (node: PathNode): { x: number, y: number }[] => {
    const path: { x: number, y: number }[] = [];
    let current: PathNode | null = node;
    while (current) {
        path.push({ x: current.x, y: current.y });
        current = current.parent;
    }
    return path.reverse();
};

const calculateAStarPath = (
    startX: number, startY: number,
    targetX: number, targetY: number,
    allParticipants: BattleParticipant[],
    ownId: string,
    arenaDimensions: { width: number, height: number, participantSize: number },
    isTargetAnAttackSlot: boolean = false,
    actualEnemyTargetIdIfSlot: string | null = null
): { x: number, y: number }[] | null => {
    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = { x: startX, y: startY, g: 0, h: heuristic({ x: startX, y: startY }, { x: targetX, y: targetY }), f: 0, parent: null };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    let iterations = 0;

    while (openList.length > 0 && iterations < MAX_ASTAR_ITERATIONS) {
        iterations++;
        openList.sort((a, b) => a.f - b.f);
        const currentNode = openList.shift()!;

        if (Math.abs(currentNode.x - targetX) < ASTAR_CELL_SIZE / 2 && Math.abs(currentNode.y - targetY) < ASTAR_CELL_SIZE / 2) {
            return reconstructPath(currentNode);
        }

        closedSet.add(`${Math.round(currentNode.x/ASTAR_CELL_SIZE)},${Math.round(currentNode.y/ASTAR_CELL_SIZE)}`);

        // More neighbors for smoother paths (including diagonals)
        const neighborOffsets = [
            { dx: ASTAR_CELL_SIZE, dy: 0, cost: ASTAR_CELL_SIZE }, { dx: -ASTAR_CELL_SIZE, dy: 0, cost: ASTAR_CELL_SIZE },
            { dx: 0, dy: ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE }, { dx: 0, dy: -ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE },
            // Diagonal (cost sqrt(2) * ASTAR_CELL_SIZE, approximated)
            { dx: ASTAR_CELL_SIZE, dy: ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 }, { dx: -ASTAR_CELL_SIZE, dy: ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 },
            { dx: ASTAR_CELL_SIZE, dy: -ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 }, { dx: -ASTAR_CELL_SIZE, dy: -ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 },
        ];

        for (const offset of neighborOffsets) {
            const neighborPos = { x: currentNode.x + offset.dx, y: currentNode.y + offset.dy };
            const gridX = Math.round(neighborPos.x / ASTAR_CELL_SIZE);
            const gridY = Math.round(neighborPos.y / ASTAR_CELL_SIZE);

            if (closedSet.has(`${gridX},${gridY}`)) continue;

            if (neighborPos.x < 0 || neighborPos.x >= arenaDimensions.width - arenaDimensions.participantSize ||
                neighborPos.y < 0 || neighborPos.y >= arenaDimensions.height - arenaDimensions.participantSize) {
                continue;
            }

            const obstaclesForPathing = allParticipants.filter(p => {
                if (p.uniqueBattleId === ownId) return false;
                if (isTargetAnAttackSlot && p.uniqueBattleId === actualEnemyTargetIdIfSlot) return false; // Don't collide with the actual enemy when moving to its slot
                if (p.currentHp <= 0 && ('isDying' in p && !(p as BattleEnemy).isDying)) return false;
                return true;
            });

            if (checkCollision_legacy(neighborPos.x, neighborPos.y, arenaDimensions.participantSize * 0.8, obstaclesForPathing, ownId)) { // Slightly smaller radius for pathfinding
                closedSet.add(`${gridX},${gridY}`);
                continue;
            }

            const gCost = currentNode.g + offset.cost;
            const hCost = heuristic(neighborPos, { x: targetX, y: targetY });
            const fCost = gCost + hCost;

            const existingNodeIndex = openList.findIndex(node => Math.abs(node.x - neighborPos.x) < 1 && Math.abs(node.y - neighborPos.y) < 1);
            if (existingNodeIndex !== -1) {
                if (openList[existingNodeIndex].g > gCost) {
                    openList[existingNodeIndex].g = gCost;
                    openList[existingNodeIndex].f = fCost;
                    openList[existingNodeIndex].parent = currentNode;
                }
            } else {
                openList.push({ x: neighborPos.x, y: neighborPos.y, g: gCost, h: hCost, f: fCost, parent: currentNode });
            }
        }
    }
    // console.warn(`A* pathfinding failed or max iterations reached for ${ownId} to (${targetX}, ${targetY})`);
    return null; // Path not found
};


export const findClosestTarget_legacy = <T extends BattleParticipant>(
  participant: BattleParticipant,
  potentialTargets: T[],
  ignoreIds: string[] = []
): T | null => {
  let closestTarget: T | null = null;
  let minDistanceSq = Infinity;

  potentialTargets.forEach(target => {
    if (target.currentHp > 0 && !ignoreIds.includes(target.uniqueBattleId) && !(('isDying' in target) && (target as BattleEnemy).isDying)) {
      const dx = (target.x || 0) - (participant.x || 0);
      const dy = (target.y || 0) - (participant.y || 0);
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestTarget = target;
      }
    }
  });
  return closestTarget;
};

export const checkCollision_legacy = (
    x: number, y: number, size: number,
    otherParticipants: BattleParticipant[],
    ownId: string
): boolean => {
    for (const other of otherParticipants) {
        if (other.uniqueBattleId === ownId || (other.currentHp <= 0 && (!('isDying' in other) || !(other as BattleEnemy).isDying))) {
            continue;
        }

        // If the other participant is dying and the animation is almost over, ignore for collision to prevent units getting stuck on fading bodies.
        if ('isDying' in other && (other as BattleEnemy).isDying === true &&
            ('dyingTicksRemaining' in other && (other as BattleEnemy).dyingTicksRemaining !== undefined && ((other as BattleEnemy).dyingTicksRemaining! < ATTACK_ANIMATION_TICKS / 2))) {
            continue;
        }

        const dx = x - (other.x || 0);
        const dy = y - (other.y || 0);
        const distanceSq = dx * dx + dy * dy;
        // Use a slightly smaller collision radius to allow units to get closer, e.g., 0.8 * size
        if (distanceSq < (size * size * 0.8 * 0.8)) {
            return true;
        }
    }
    return false;
};

const getAdjacentAttackSlots_legacy = (targetX: number, targetY: number, targetSize: number, attackerSize: number): Array<{x: number, y: number}> => {
    const step = targetSize * 0.9; // slightly closer slots
    return [
        { x: targetX, y: targetY - step },
        { x: targetX, y: targetY + step },
        { x: targetX - step, y: targetY },
        { x: targetX + step, y: targetY },
        // Diagonals can be useful too
        { x: targetX - step * 0.707, y: targetY - step * 0.707 },
        { x: targetX + step * 0.707, y: targetY - step * 0.707 },
        { x: targetX - step * 0.707, y: targetY + step * 0.707 },
        { x: targetX + step * 0.707, y: targetY + step * 0.707 },
    ].sort(() => Math.random() - 0.5); // Shuffle to vary slot preference
}


export const getOptimalAttackPosition_legacy = (
  attacker: BattleParticipant,
  target: BattleParticipant,
  allParticipants: BattleParticipant[],
  arenaDimensions: { width: number, height: number, participantSize: number }
): { x: number, y: number } | null => {
    const { width: arenaWidth, height: arenaHeight, participantSize } = arenaDimensions;

    if (attacker.attackType === 'MELEE') {
        const slots = getAdjacentAttackSlots_legacy(target.x, target.y, participantSize, participantSize);
        let bestSlot: { x: number, y: number } | null = null;
        let minSlotDistSq = Infinity;

        for (const slot of slots) {
            const boundedX = Math.max(participantSize / 2, Math.min(slot.x, arenaWidth - participantSize * 1.5));
            const boundedY = Math.max(participantSize / 2, Math.min(slot.y, arenaHeight - participantSize * 1.5));

            // Check collision against all OTHER participants, excluding the current attacker and the target itself (as we are trying to get close to target)
            if (!checkCollision_legacy(boundedX, boundedY, participantSize,
                                allParticipants.filter(p => p.uniqueBattleId !== attacker.uniqueBattleId && p.uniqueBattleId !== target.uniqueBattleId),
                                attacker.uniqueBattleId)) {
                const dxToSlot = boundedX - attacker.x;
                const dyToSlot = boundedY - attacker.y;
                const slotDistSq = dxToSlot*dxToSlot + dyToSlot*dyToSlot;
                if (slotDistSq < minSlotDistSq) {
                    minSlotDistSq = slotDistSq;
                    bestSlot = { x: boundedX, y: boundedY };
                }
            }
        }
        return bestSlot; // Can be null if no valid slot found

    } else { // RANGED
        const idealRange = attacker.rangedAttackRangeUnits || RANGED_ATTACK_RANGE_UNITS_DEFAULT;
        const dxToTarget = target.x - attacker.x;
        const dyToTarget = target.y - attacker.y;
        const distToTarget = Math.sqrt(dxToTarget * dxToTarget + dyToTarget * dyToTarget);

        let desiredX = attacker.x;
        let desiredY = attacker.y;

        // Line of Sight Check (simplified: checks direct line for obstacles)
        let LoSBlocked = false;
        const obstacles = allParticipants.filter(p => p.uniqueBattleId !== attacker.uniqueBattleId && p.uniqueBattleId !== target.uniqueBattleId && p.currentHp > 0 && !(('isDying' in p) && (p as BattleEnemy).isDying) );
        for (const obs of obstacles) {
            // Simplified bounding box check for LoS (not perfect ray-casting)
            const x1 = attacker.x + participantSize / 2; const y1 = attacker.y + participantSize / 2;
            const x2 = target.x + participantSize / 2;   const y2 = target.y + participantSize / 2;
            const obsX = obs.x + participantSize / 2;     const obsY = obs.y + participantSize / 2;
            const obsR = participantSize / 2; // Radius of obstacle

            // Check if obstacle is between attacker and target
            // This is a very simplified LoS check, more robust would involve segment intersection or ray casting
            const lenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            if (lenSq === 0) continue; // Attacker and target are at the same spot
            let t = ((obsX - x1) * (x2 - x1) + (obsY - y1) * (y2 - y1)) / lenSq;
            t = Math.max(0, Math.min(1, t)); // Clamp t to the segment
            const closestX = x1 + t * (x2 - x1);
            const closestY = y1 + t * (y2 - y1);
            const distSqToObstacle = (closestX - obsX) * (closestX - obsX) + (closestY - obsY) * (closestY - obsY);
            if (distSqToObstacle < obsR * obsR * 0.7) { // Check if projection is within obstacle radius (0.7 factor for tolerance)
                LoSBlocked = true;
                break;
            }
        }

        if (distToTarget < idealRange * 0.7 && distToTarget > 0) { // Too close, move away
            desiredX = attacker.x - (dxToTarget / distToTarget) * (idealRange - distToTarget); // Move back along line from target
            desiredY = attacker.y - (dyToTarget / distToTarget) * (idealRange - distToTarget);
        } else if (distToTarget > idealRange * 1.1 || LoSBlocked) { // Too far or LoS blocked
            if (LoSBlocked) { // If LoS blocked, try a sidestep or move to a point perpendicular to target
                const sidestepAngleOffset = Math.random() > 0.5 ? Math.PI / 2.5 : -Math.PI / 2.5; // Wider angle for sidestep
                const sidestepAngle = Math.atan2(dyToTarget, dxToTarget) + sidestepAngleOffset;
                desiredX = attacker.x + Math.cos(sidestepAngle) * idealRange * 0.3; // Sidestep a fraction of ideal range
                desiredY = attacker.y + Math.sin(sidestepAngle) * idealRange * 0.3;
            } else if (distToTarget > 0) { // If just too far, move closer
                desiredX = attacker.x + (dxToTarget / distToTarget) * MOVEMENT_SPEED_UNITS_PER_TICK * 2;
                desiredY = attacker.y + (dyToTarget / distToTarget) * MOVEMENT_SPEED_UNITS_PER_TICK * 2;
            }
        } else {
            // Already in a good position (correct range, LoS clear)
            return {x: attacker.x, y: attacker.y};
        }

        const boundedX = Math.max(participantSize / 2, Math.min(desiredX, arenaWidth - participantSize * 1.5));
        const boundedY = Math.max(participantSize / 2, Math.min(desiredY, arenaHeight - participantSize * 1.5));

        // Final check if the new desired position is not colliding (excluding self and target)
        if (!checkCollision_legacy(boundedX, boundedY, participantSize, allParticipants.filter(p => p.uniqueBattleId !== target.uniqueBattleId && p.uniqueBattleId !== attacker.uniqueBattleId), attacker.uniqueBattleId)) {
            return { x: boundedX, y: boundedY };
        }
        return null; // Can't find a good position
    }
};


export const calculateMovementTowards_legacy = (
  currentX: number, currentY: number,
  targetX: number, targetY: number,
  speed: number,
  allParticipants: BattleParticipant[],
  ownId: string,
  attackerSize: number,
  arenaDimensions: { width: number, height: number, participantSize: number },
  isTargetAnAttackSlot: boolean = false,
  actualEnemyTargetIdIfSlot: string | null = null
): { dx: number, dy: number } => {
  const dxTotal = targetX - currentX;
  const dyTotal = targetY - currentY;
  const distance = Math.sqrt(dxTotal * dxTotal + dyTotal * dyTotal);

  if (distance < speed / 2 && distance > 1) { // If very close, just make the final hop
    return { dx: dxTotal, dy: dyTotal };
  } else if (distance <= 1) { // Already at target
    return { dx: 0, dy: 0 };
  }

  let moveDx = (dxTotal / distance) * speed;
  let moveDy = (dyTotal / distance) * speed;

  let nextX = currentX + moveDx;
  let nextY = currentY + moveDy;

  // Filter out self and, if moving to an attack slot, the actual enemy target for collision checks during pathing
  const obstacles = allParticipants.filter(p => {
    if (p.uniqueBattleId === ownId) return false;
    if (isTargetAnAttackSlot && p.uniqueBattleId === actualEnemyTargetIdIfSlot) return false;
    return true;
  });


  if (checkCollision_legacy(nextX, nextY, attackerSize, obstacles, ownId)) {
    // A* pathfinding attempt
    const aStarPath = calculateAStarPath(currentX, currentY, targetX, targetY, allParticipants, ownId, arenaDimensions, isTargetAnAttackSlot, actualEnemyTargetIdIfSlot);
    if (aStarPath && aStarPath.length > 1) {
        const nextStep = aStarPath[1]; // The first step in the path (after current position)
        const aStarDx = nextStep.x - currentX;
        const aStarDy = nextStep.y - currentY;
        const aStarDist = Math.sqrt(aStarDx*aStarDx + aStarDy*aStarDy);
        if (aStarDist > 0) {
            // Move one A* step or 'speed' units along it, whichever is smaller
            const moveRatio = Math.min(1, speed / aStarDist);
            return { dx: aStarDx * moveRatio, dy: aStarDy * moveRatio };
        }
    }

    // Fallback: Try to slide along X or Y axis if direct path is blocked
    if (!checkCollision_legacy(currentX + moveDx, currentY, attackerSize, obstacles, ownId)) {
      return { dx: moveDx, dy: 0 };
    }
    if (!checkCollision_legacy(currentX, currentY + moveDy, attackerSize, obstacles, ownId)) {
      return { dx: 0, dy: moveDy };
    }
    // No clear path, stay put or try very small random jitter later if needed
    return { dx: 0, dy: 0 };
  }

  return { dx: moveDx, dy: moveDy };
};

export const processParticipantAI_legacy = (
  participant: BattleParticipant,
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[],
  arenaDimensions: { width: number, height: number, participantSize: number }
): {
    dx: number,
    dy: number,
    attackTargetId: string | null,
    actualTargetId: string | null, // The entity the AI is focused on (e.g. for movement)
    debugMovementTarget?: { x: number, y: number }, // The specific point it's trying to reach
    aiState: ActionBattleParticipantAIState,
    aiRepositioningTarget?: { x: number, y: number },
    aiDecisionCooldownTicks?: number,
} => {
  let currentAIState = participant.aiState || 'IDLE';
  let currentDecisionCooldown = participant.aiDecisionCooldownTicks || 0;
  let currentRepositioningTarget = participant.aiRepositioningTarget; // For ranged units committing to a move

  let dx = 0;
  let dy = 0;
  let attackTargetId: string | null = null;
  let actualTargetIdForOutput: string | null = participant.targetId || null;
  let debugTargetPos: {x: number, y: number} | undefined = participant.debugMovementTarget;

  // Handle dead or stunned participants
  if (participant.currentHp <= 0 ||
      ('isDying' in participant && (participant as BattleEnemy).isDying) ||
      (participant.statusEffects && participant.statusEffects.some(se => se.type === 'STUN'))) {
    return { dx: 0, dy: 0, attackTargetId: null, actualTargetId: null, debugMovementTarget: undefined, aiState: 'IDLE', aiDecisionCooldownTicks: currentDecisionCooldown, aiRepositioningTarget: undefined };
  }

  // Decrement decision cooldown
  if (currentDecisionCooldown > 0) currentDecisionCooldown--;

  // Determine potential targets
  const potentialTargets: BattleParticipant[] = ('definitionId' in participant) // Is Hero
    ? allEnemies.filter(e => e.currentHp > 0 && !e.isDying)
    : allHeroes.filter(h => h.currentHp > 0);

  // Target acquisition/validation
  let target = potentialTargets.find(t => t.uniqueBattleId === participant.targetId);
  if (!target || target.currentHp <= 0 || (('isDying' in target) && (target as BattleEnemy).isDying)) {
    target = findClosestTarget_legacy(participant, potentialTargets, [participant.uniqueBattleId]);
    participant.targetId = target ? target.uniqueBattleId : null;
    actualTargetIdForOutput = participant.targetId;
    currentAIState = 'IDLE'; // Force re-evaluation with new target
    currentDecisionCooldown = 0;
    currentRepositioningTarget = undefined;
  }

  if (!target) { // No valid targets left
    return { dx: 0, dy: 0, attackTargetId: null, actualTargetId: null, debugMovementTarget: undefined, aiState: 'IDLE', aiDecisionCooldownTicks: currentDecisionCooldown, aiRepositioningTarget: undefined };
  }

  // --- Main AI Logic based on participant type ---
  const attackRange = participant.attackType === 'RANGED'
    ? (participant.rangedAttackRangeUnits || RANGED_ATTACK_RANGE_UNITS_DEFAULT)
    : ATTACK_RANGE_UNITS;
  const effectiveAttackRangeSq = attackRange * attackRange;

  const dxToTarget = target.x - participant.x;
  const dyToTarget = target.y - participant.y;
  const distanceToTargetSq = dxToTarget * dxToTarget + dyToTarget * dyToTarget;
  const isReadyToAttack = participant.attackCooldownRemainingTicks <= 0;

  if (participant.attackType === 'MELEE') {
    if (distanceToTargetSq <= effectiveAttackRangeSq && isReadyToAttack) {
      currentAIState = 'ATTACKING';
      attackTargetId = target.uniqueBattleId;
      debugTargetPos = { x: participant.x, y: participant.y }; // Holding position to attack
      currentDecisionCooldown = AI_DECISION_COOLDOWN_MELEE; // Short cooldown after attacking
    } else { // Need to move
      if (currentDecisionCooldown <= 0 || currentAIState !== 'MOVING_TO_ENGAGE' || !debugTargetPos) {
        const optimalPos = getOptimalAttackPosition_legacy(participant, target, [...allHeroes, ...allEnemies], arenaDimensions);
        debugTargetPos = optimalPos || { x: target.x, y: target.y }; // Fallback to target's center
        currentAIState = 'MOVING_TO_ENGAGE';
        currentDecisionCooldown = AI_DECISION_COOLDOWN_MELEE;
      }
      if (debugTargetPos) {
        const movementResult = calculateMovementTowards_legacy(participant.x, participant.y, debugTargetPos.x, debugTargetPos.y, MOVEMENT_SPEED_UNITS_PER_TICK, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions.participantSize, arenaDimensions, true, target.uniqueBattleId);
        dx = movementResult.dx;
        dy = movementResult.dy;
      }
    }
  } else { // RANGED logic
    let LoSBlocked = false;
    // Simplified LoS check (as before)
    const obstacles = [...allHeroes, ...allEnemies].filter(p => p.uniqueBattleId !== participant.uniqueBattleId && p.uniqueBattleId !== target!.uniqueBattleId && p.currentHp > 0 && !(('isDying' in p) && (p as BattleEnemy).isDying) );
    for (const obs of obstacles) {
        const x1 = participant.x + arenaDimensions.participantSize / 2; const y1 = participant.y + arenaDimensions.participantSize / 2;
        const x2 = target.x + arenaDimensions.participantSize / 2;   const y2 = target.y + arenaDimensions.participantSize / 2;
        const obsX = obs.x + arenaDimensions.participantSize / 2;     const obsY = obs.y + arenaDimensions.participantSize / 2;
        const obsR = arenaDimensions.participantSize / 2;
        const lenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (lenSq === 0) continue;
        let t = ((obsX - x1) * (x2 - x1) + (obsY - y1) * (y2 - y1)) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);
        const distSqToObstacle = (closestX - obsX) * (closestX - obsX) + (closestY - obsY) * (closestY - obsY);
        if (distSqToObstacle < obsR * obsR * 0.8) { LoSBlocked = true; break; }
    }

    const isInAttackRangeAndHasLoS = distanceToTargetSq <= effectiveAttackRangeSq && !LoSBlocked;

    if (currentAIState === 'ATTACKING') {
      if (!isInAttackRangeAndHasLoS) { // Lost the shot
        currentAIState = 'IDLE';
        currentDecisionCooldown = 0; // Force immediate re-evaluation
      } else if (isReadyToAttack) {
        attackTargetId = target.uniqueBattleId;
      }
      // Else (waiting for cooldown, still has shot), hold position (dx=0, dy=0)
    } else if (currentAIState === 'REPOSITIONING') {
      if (!currentRepositioningTarget || currentDecisionCooldown <= 0) {
        currentAIState = 'IDLE';
        currentRepositioningTarget = undefined;
        currentDecisionCooldown = 0;
      } else {
        const movementResult = calculateMovementTowards_legacy(participant.x, participant.y, currentRepositioningTarget.x, currentRepositioningTarget.y, MOVEMENT_SPEED_UNITS_PER_TICK, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions.participantSize, arenaDimensions);
        dx = movementResult.dx;
        dy = movementResult.dy;
        debugTargetPos = currentRepositioningTarget;
        if (Math.abs(participant.x - currentRepositioningTarget.x) < MOVEMENT_SPEED_UNITS_PER_TICK && Math.abs(participant.y - currentRepositioningTarget.y) < MOVEMENT_SPEED_UNITS_PER_TICK) {
          currentAIState = 'IDLE'; // Reached reposition target
          currentRepositioningTarget = undefined;
          currentDecisionCooldown = 0;
        }
      }
    } else { // IDLE or MOVING_TO_ENGAGE, time to decide
      if (isInAttackRangeAndHasLoS && isReadyToAttack) {
        currentAIState = 'ATTACKING';
        attackTargetId = target.uniqueBattleId;
        currentDecisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD;
      } else if (currentDecisionCooldown <= 0) { // Time for a new general decision
        const optimalPos = getOptimalAttackPosition_legacy(participant, target, [...allHeroes, ...allEnemies], arenaDimensions);
        if (optimalPos) {
          const distToOptimalSq = Math.pow(optimalPos.x - participant.x, 2) + Math.pow(optimalPos.y - participant.y, 2);
          if (distToOptimalSq < (MOVEMENT_SPEED_UNITS_PER_TICK * 1.5) && isInAttackRangeAndHasLoS) { // Already close to optimal and has a shot (but attack not ready)
            currentAIState = 'ATTACKING'; // Hold position while waiting for cooldown
            currentDecisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD;
          } else { // Need to move to a new optimal position
            currentAIState = 'REPOSITIONING';
            currentRepositioningTarget = optimalPos;
            debugTargetPos = optimalPos;
            currentDecisionCooldown = AI_RANGED_REPOSITION_COMMIT_TICKS;
            const movementResult = calculateMovementTowards_legacy(participant.x, participant.y, optimalPos.x, optimalPos.y, MOVEMENT_SPEED_UNITS_PER_TICK, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions.participantSize, arenaDimensions);
            dx = movementResult.dx;
            dy = movementResult.dy;
          }
        } else { // No good optimal position found (e.g., target heavily obscured)
          currentAIState = 'IDLE'; // Wait and re-evaluate soon
          currentDecisionCooldown = AI_DECISION_COOLDOWN_RANGED_HOLD / 2;
        }
      } else if (currentRepositioningTarget) { // Continue committed reposition if cooldown is active
         currentAIState = 'REPOSITIONING'; // Ensure state reflects action
         const movementResult = calculateMovementTowards_legacy(participant.x, participant.y, currentRepositioningTarget.x, currentRepositioningTarget.y, MOVEMENT_SPEED_UNITS_PER_TICK, [...allHeroes, ...allEnemies], participant.uniqueBattleId, arenaDimensions.participantSize, arenaDimensions);
         dx = movementResult.dx;
         dy = movementResult.dy;
         debugTargetPos = currentRepositioningTarget;
      }
      // If cooldown active and not repositioning, just wait (dx=0, dy=0)
    }
  }

  return {
    dx,
    dy,
    attackTargetId,
    actualTargetId: actualTargetIdForOutput,
    debugMovementTarget: debugTargetPos,
    aiState: currentAIState,
    aiRepositioningTarget: currentRepositioningTarget,
    aiDecisionCooldownTicks: currentDecisionCooldown,
  };
};
// Renaming the file effectively changes the names of the exported functions.
// To maintain clarity, I'll explicitly rename them in the content.
// `checkCollision` -> `checkCollision_legacy`
// `findClosestTarget` -> `findClosestTarget_legacy`
// `getAdjacentAttackSlots` -> `getAdjacentAttackSlots_legacy`
// `getOptimalAttackPosition` -> `getOptimalAttackPosition_legacy`
// `calculateMovementTowards` -> `calculateMovementTowards_legacy`
// `processParticipantAI` -> `processParticipantAI_legacy`

// The new `behaviorTreeAI.ts` will initially export a function `processParticipantAI_behaviorTree` which can be a copy of `processParticipantAI_legacy`.
// The existing `actionBattleAI.ts` will become `actionBattleAI_legacy.ts` and its contents updated with the `_legacy` suffix for its functions.
// Then `actionBattleReducer.ts` will be updated to use these.
