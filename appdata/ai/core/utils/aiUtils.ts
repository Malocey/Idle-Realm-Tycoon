import { BattleHero, BattleEnemy } from '../../../types';
import { PARTICIPANT_SIZE_UNITS } from '../../../constants'; // Assuming this is where PARTICIPANT_SIZE_UNITS is

type BattleParticipant = BattleHero | BattleEnemy;

export const findClosestTarget = <T extends BattleParticipant>(
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

export const performLineOfSightCheck = (
    attacker: BattleParticipant,
    target: BattleParticipant,
    allParticipants: BattleParticipant[],
    participantSize: number // Pass participantSize, e.g., from arenaDimensions
): boolean => {
    const obstacles = allParticipants.filter(p =>
        p.uniqueBattleId !== attacker.uniqueBattleId &&
        p.uniqueBattleId !== target.uniqueBattleId &&
        p.currentHp > 0 &&
        !(('isDying' in p) && (p as BattleEnemy).isDying)
    );

    for (const obs of obstacles) {
        const x1 = attacker.x + participantSize / 2;
        const y1 = attacker.y + participantSize / 2;
        const x2 = target.x + participantSize / 2;
        const y2 = target.y + participantSize / 2;
        const obsX = obs.x + participantSize / 2;
        const obsY = obs.y + participantSize / 2;
        const obsR = participantSize / 2;

        const lenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (lenSq === 0) continue; // Attacker and target are at the same spot

        let t = ((obsX - x1) * (x2 - x1) + (obsY - y1) * (y2 - y1)) / lenSq;
        t = Math.max(0, Math.min(1, t)); // Clamp t to the segment

        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);
        const distSqToObstacle = (closestX - obsX) * (closestX - obsX) + (closestY - obsY) * (closestY - obsY);

        // A smaller multiplier makes LoS stricter (more easily blocked)
        if (distSqToObstacle < obsR * obsR * 0.7) { // 0.7 factor to make LoS check a bit more generous with unit edges
            return true; // LoS is blocked
        }
    }
    return false; // LoS is clear
};
