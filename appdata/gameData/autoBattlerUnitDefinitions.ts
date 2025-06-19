
import { AutoBattlerUnitDefinition } from '../types';

export const AUTOBATTLER_UNIT_DEFINITIONS: Record<string, AutoBattlerUnitDefinition> = {
  SOLDIER: {
    id: 'SOLDIER',
    name: 'Soldier',
    hp: 100,
    maxHp: 100,
    damage: 10,
    attackSpeed: 1000, // Attacks every 1000ms (1 attack per second)
    speed: 30, // Moves 30 pixels per second
    attackRange: 40, // Can attack enemies within 40 pixels
  },
  ENEMY_GRUNT: {
    id: 'ENEMY_GRUNT',
    name: 'Enemy Grunt',
    hp: 80,
    maxHp: 80,
    damage: 8,
    attackSpeed: 1200, // Attacks every 1200ms
    speed: 25, // Moves 25 pixels per second
    attackRange: 35, // Can attack enemies within 35 pixels
  },
  SCARECROW_SLASHER: {
    id: 'SCARECROW_SLASHER',
    name: 'Scarecrow Slasher',
    hp: 40,
    maxHp: 40,
    damage: 12,
    attackSpeed: 800, // Attacks every 800ms
    speed: 50, // Moves 50 pixels per second
    attackRange: 30, // Melee range
  },
  CROP_GOLEM: {
    id: 'CROP_GOLEM',
    name: 'Crop Golem',
    hp: 250,
    maxHp: 250,
    damage: 25,
    attackSpeed: 2000, // Attacks every 2000ms
    speed: 15, // Moves 15 pixels per second
    attackRange: 45, // Slightly longer melee range
  },
  ELITE_GUARD: {
    id: 'ELITE_GUARD',
    name: 'Elite Guard',
    hp: 1500,
    maxHp: 1500,
    damage: 120,
    attackSpeed: 833, // Approx 1.2 attacks per second
    speed: 20, 
    attackRange: 40, 
  },
  // Add other unit definitions (ARCHER, BUILDER, etc.) here later
};
