
import { SpecialAttackDefinition } from '../types';
import { WARRIOR_SPECIAL_ATTACKS } from './specialAttacks/warriorSpecialAttacks';
import { ARCHER_SPECIAL_ATTACKS } from './specialAttacks/archerSpecialAttacks';
import { CLERIC_SPECIAL_ATTACKS } from './specialAttacks/clericSpecialAttacks';
import { PALADIN_SPECIAL_ATTACKS } from './specialAttacks/paladinSpecialAttacks';
import { ELEMENTALIST_SPECIAL_ATTACKS } from './specialAttacks/elementalistSpecialAttacks';

export const SPECIAL_ATTACK_DEFINITIONS: Record<string, SpecialAttackDefinition> = {
  ...WARRIOR_SPECIAL_ATTACKS,
  ...ARCHER_SPECIAL_ATTACKS,
  ...CLERIC_SPECIAL_ATTACKS,
  ...PALADIN_SPECIAL_ATTACKS,
  ...ELEMENTALIST_SPECIAL_ATTACKS,
};
