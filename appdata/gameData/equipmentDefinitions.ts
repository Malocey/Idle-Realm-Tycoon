
import { HeroEquipmentDefinition } from '../types';

// Import class-specific equipment objects
import { WARRIOR_EQUIPMENT } from './equipment/warriorEquipment';
import { ARCHER_EQUIPMENT } from './equipment/archerEquipment';
import { CLERIC_EQUIPMENT } from './equipment/clericEquipment';
import { PALADIN_EQUIPMENT } from './equipment/paladinEquipment';
import { MAGE_EQUIPMENT } from './equipment/mageEquipment';

export const EQUIPMENT_DEFINITIONS: Record<string, HeroEquipmentDefinition> = {
  ...WARRIOR_EQUIPMENT,
  ...ARCHER_EQUIPMENT,
  ...CLERIC_EQUIPMENT,
  ...PALADIN_EQUIPMENT,
  ...MAGE_EQUIPMENT,
};
