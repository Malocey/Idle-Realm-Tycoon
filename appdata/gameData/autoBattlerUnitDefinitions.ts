
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
  // Add other unit definitions (ARCHER, BUILDER, etc.) here later
};