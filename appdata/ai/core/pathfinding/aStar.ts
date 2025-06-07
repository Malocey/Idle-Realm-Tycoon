
import { BattleHero, BattleEnemy, ActionBattleState, HeroStats, Projectile, ActionBattleParticipantAIState } from '../../../types';
import { PARTICIPANT_SIZE_UNITS, ATTACK_ANIMATION_TICKS } from '../../../constants';

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
const MAX_ASTAR_ITERATIONS = 100; // Increased slightly for potentially more complex paths
const ASTAR_CELL_SIZE = PARTICIPANT_SIZE_UNITS / 2;
const CONGESTION_RADIUS_SQUARED = Math.pow(PARTICIPANT_SIZE_UNITS * 1.5, 2); // How close friendly units need to be to add cost
const CONGESTION_PENALTY_BASE = 50; // Base penalty for being in a congested cell

// Heuristic function (Manhattan distance for grid movement)
export const heuristic = (a: { x: number, y: number }, b: { x: number, y: number }): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Reconstruct path from A* result
export const reconstructPath = (node: PathNode): { x: number, y: number }[] => {
    const path: { x: number, y: number }[] = [];
    let current: PathNode | null = node;
    while (current) {
        path.push({ x: current.x, y: current.y });
        current = current.parent;
    }
    return path.reverse();
};

export const checkCollision = (
    x: number, y: number, size: number,
    otherParticipants: BattleParticipant[],
    ownId: string
): boolean => {
    for (const other of otherParticipants) {
        if (other.uniqueBattleId === ownId || (other.currentHp <= 0 && (!('isDying' in other) || !(other as BattleEnemy).isDying))) {
            continue;
        }
        if ('isDying' in other && (other as BattleEnemy).isDying === true &&
            ('dyingTicksRemaining' in other && (other as BattleEnemy).dyingTicksRemaining !== undefined && ((other as BattleEnemy).dyingTicksRemaining! < ATTACK_ANIMATION_TICKS / 2))) {
            continue;
        }
        const dx = x - (other.x || 0);
        const dy = y - (other.y || 0);
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < (size * size * 0.8 * 0.8)) { // Reduced collision radius
            return true;
        }
    }
    return false;
};

// Neuer Helfer zur Berechnung der Überlastungskosten
const getCongestionCost = (
    x: number,
    y: number,
    allParticipants: BattleParticipant[],
    ownId: string,
    participantType: 'hero' | 'enemy' // Typ der Einheit, für die der Pfad berechnet wird
): number => {
    let penalty = 0;
    const friendlyUnits = allParticipants.filter(p => {
        if (p.uniqueBattleId === ownId || p.currentHp <= 0) return false;
        // Bestimme, ob 'p' eine verbündete Einheit ist
        const isPOwnTypeHero = 'definitionId' in p; // True if p is a BattleHero
        const isParticipantTypeHero = participantType === 'hero';
        return isPOwnTypeHero === isParticipantTypeHero;
    });

    for (const friendly of friendlyUnits) {
        const dx = x - (friendly.x || 0);
        const dy = y - (friendly.y || 0);
        const distSq = dx * dx + dy * dy;
        if (distSq < CONGESTION_RADIUS_SQUARED) {
            // Die Strafe könnte von der Entfernung abhängen, aber eine feste Strafe ist einfacher zu beginnen
            penalty += CONGESTION_PENALTY_BASE;
        }
    }
    return penalty;
};


export const calculateAStarPath = (
    startX: number, startY: number,
    targetX: number, targetY: number,
    allParticipants: BattleParticipant[],
    ownId: string,
    arenaDimensions: { width: number, height: number, participantSize: number },
    isTargetAnAttackSlot: boolean = false,
    actualEnemyTargetIdIfSlot: string | null = null
): { path: { x: number, y: number }[], cost: number } | null => {
    const _reconstructPathInternal = reconstructPath; // Alias the function

    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    const selfParticipant = allParticipants.find(p => p.uniqueBattleId === ownId);
    if (!selfParticipant) return null; // Eigene Einheit nicht gefunden
    const selfType = 'definitionId' in selfParticipant ? 'hero' : 'enemy';


    const startNode: PathNode = { x: startX, y: startY, g: 0, h: heuristic({ x: startX, y: startY }, { x: targetX, y: targetY }), f: 0, parent: null };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    let iterations = 0;

    while (openList.length > 0 && iterations < MAX_ASTAR_ITERATIONS) {
        iterations++;
        openList.sort((a, b) => a.f - b.f);
        const currentNode = openList.shift()!;

        if (Math.abs(currentNode.x - targetX) < ASTAR_CELL_SIZE / 2 && Math.abs(currentNode.y - targetY) < ASTAR_CELL_SIZE / 2) {
            return { path: _reconstructPathInternal(currentNode), cost: currentNode.g }; // Use alias
        }

        closedSet.add(`${Math.round(currentNode.x/ASTAR_CELL_SIZE)},${Math.round(currentNode.y/ASTAR_CELL_SIZE)}`);

        const neighborOffsets = [
            { dx: ASTAR_CELL_SIZE, dy: 0, cost: ASTAR_CELL_SIZE }, { dx: -ASTAR_CELL_SIZE, dy: 0, cost: ASTAR_CELL_SIZE },
            { dx: 0, dy: ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE }, { dx: 0, dy: -ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE },
            { dx: ASTAR_CELL_SIZE, dy: ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 }, { dx: -ASTAR_CELL_SIZE, dy: ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 },
            { dx: ASTAR_CELL_SIZE, dy: -ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 }, { dx: -ASTAR_CELL_SIZE, dy: -ASTAR_CELL_SIZE, cost: ASTAR_CELL_SIZE * 1.414 },
        ];

        for (const offset of neighborOffsets) {
            const neighborPos = { x: currentNode.x + offset.dx, y: currentNode.y + offset.dy };
            const gridX = Math.round(neighborPos.x / ASTAR_CELL_SIZE);
            const gridY = Math.round(neighborPos.y / ASTAR_CELL_SIZE);

            if (closedSet.has(`${gridX},${gridY}`)) continue;

            if (neighborPos.x < arenaDimensions.participantSize / 2 || neighborPos.x >= arenaDimensions.width - arenaDimensions.participantSize * 1.5 ||
                neighborPos.y < arenaDimensions.participantSize / 2 || neighborPos.y >= arenaDimensions.height - arenaDimensions.participantSize * 1.5) {
                continue;
            }
            
            const obstaclesForPathing = allParticipants.filter(p => {
                if (p.uniqueBattleId === ownId) return false;
                if (isTargetAnAttackSlot && actualEnemyTargetIdIfSlot === p.uniqueBattleId) return false;
                if (p.currentHp <= 0 && ('isDying' in p && !(p as BattleEnemy).isDying)) return false;
                // Friendly units are not direct obstacles here, but contribute to congestion cost
                const isPOwnTypeHero = 'definitionId' in p;
                const isParticipantTypeHero = selfType === 'hero';
                if (isPOwnTypeHero === isParticipantTypeHero) return false; // Don't consider friendlies as hard obstacles here
                return true; // Consider enemies (or heroes if pathing for enemy) as hard obstacles
            });

            if (checkCollision(neighborPos.x, neighborPos.y, arenaDimensions.participantSize * 0.7, obstaclesForPathing, ownId)) {
                closedSet.add(`${gridX},${gridY}`);
                continue;
            }
            
            const congestionCost = getCongestionCost(neighborPos.x, neighborPos.y, allParticipants, ownId, selfType);
            const gCost = currentNode.g + offset.cost + congestionCost; // Add congestion cost
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
    return null; 
};

export const getAdjacentAttackSlots = (targetX: number, targetY: number, targetSize: number, attackerSize: number): Array<{x: number, y: number}> => {
    const step = targetSize * 0.85; 
    const diagonalStep = step * 0.707;
    return [ 
        { x: targetX, y: targetY - step }, { x: targetX, y: targetY + step },
        { x: targetX - step, y: targetY }, { x: targetX + step, y: targetY },
        { x: targetX - diagonalStep, y: targetY - diagonalStep }, { x: targetX + diagonalStep, y: targetY - diagonalStep },
        { x: targetX - diagonalStep, y: targetY + diagonalStep }, { x: targetX + diagonalStep, y: targetY + diagonalStep },
    ];
};
