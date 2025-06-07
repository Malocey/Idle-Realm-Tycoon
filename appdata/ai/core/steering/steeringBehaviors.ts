
import { BattleHero, BattleEnemy } from '../../../types';
import { MOVEMENT_SPEED_UNITS_PER_TICK, PARTICIPANT_SIZE_UNITS } from '../../../constants';

type BattleParticipant = BattleHero | BattleEnemy;

interface Vector2D {
  x: number;
  y: number;
}

// Helferfunktion: Vektorlänge quadriert
const magnitudeSq = (v: Vector2D): number => v.x * v.x + v.y * v.y;

// Helferfunktion: Vektor normalisieren
const normalize = (v: Vector2D): Vector2D => {
  const mag = Math.sqrt(magnitudeSq(v));
  if (mag > 0) {
    return { x: v.x / mag, y: v.y / mag };
  }
  return { x: 0, y: 0 };
};

// Helferfunktion: Vektor skalieren
const scale = (v: Vector2D, scalar: number): Vector2D => {
  return { x: v.x * scalar, y: v.y * scalar };
};

// Helferfunktion: Vektor subtrahieren
const subtract = (v1: Vector2D, v2: Vector2D): Vector2D => {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
};

// Helferfunktion: Vektor addieren
const add = (v1: Vector2D, v2: Vector2D): Vector2D => {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
};


export const calculateSeekForce = (
  currentPos: Vector2D,
  targetPos: Vector2D,
  maxSpeed: number
): Vector2D => {
  const desiredVelocity = normalize(subtract(targetPos, currentPos));
  return scale(desiredVelocity, maxSpeed);
};

export const calculateArriveForce = (
  currentPos: Vector2D,
  targetPos: Vector2D,
  currentVelocity: Vector2D,
  maxSpeed: number,
  slowingRadius: number
): Vector2D => {
  const desiredOffset = subtract(targetPos, currentPos);
  const distance = Math.sqrt(magnitudeSq(desiredOffset));

  if (distance < 0.1) { // Nahezu am Ziel
    return { x: 0, y: 0 }; // Keine Kraft benötigt oder leichte Bremskraft
  }

  let rampedSpeed = maxSpeed;
  if (distance < slowingRadius) {
    rampedSpeed = maxSpeed * (distance / slowingRadius);
  }

  const desiredVelocity = scale(normalize(desiredOffset), rampedSpeed);
  const steeringForce = subtract(desiredVelocity, currentVelocity);
  // Begrenze die Lenkkraft, falls erforderlich (hier nicht explizit, da maxSpeed bereits beachtet wird)
  return steeringForce;
};

export const calculateSeparationForce = (
  currentParticipant: BattleParticipant,
  otherUnits: BattleParticipant[],
  separationRadius: number,
  maxForce: number // Maximale Stärke der Separationskraft
): Vector2D => {
  let totalForce: Vector2D = { x: 0, y: 0 };
  let neighborsCount = 0;

  otherUnits.forEach(other => {
    if (other.uniqueBattleId === currentParticipant.uniqueBattleId || other.currentHp <= 0) return;

    const distanceVector = subtract({x: currentParticipant.x, y: currentParticipant.y}, {x: other.x, y: other.y});
    const distanceSq = magnitudeSq(distanceVector);

    if (distanceSq > 0 && distanceSq < separationRadius * separationRadius) {
      // Die Kraft ist umgekehrt proportional zur Entfernung
      const repulsionStrength = 1 / Math.sqrt(distanceSq); // Stärker, je näher
      const force = scale(normalize(distanceVector), repulsionStrength);
      totalForce = add(totalForce, force);
      neighborsCount++;
    }
  });

  if (neighborsCount > 0) {
    // Durchschnittliche Kraft (optional, kann auch Summe bleiben)
    // totalForce = { x: totalForce.x / neighborsCount, y: totalForce.y / neighborsCount };
    
    // Normalisieren und auf maximale Kraft begrenzen
    const normalizedForce = normalize(totalForce);
    return scale(normalizedForce, maxForce);
  }

  return { x: 0, y: 0 };
};
