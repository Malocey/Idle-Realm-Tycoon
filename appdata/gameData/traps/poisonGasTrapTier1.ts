
import { TrapDefinition, ResourceType } from '../../types';

export const POISON_GAS_TRAP_TIER1_DEFINITION: TrapDefinition = {
  id: 'POISON_GAS_TRAP_TIER1',
  name: 'Poison Gas Trap',
  descriptionWhenTriggered: 'A hissing sound as poisonous gas fills the room!',
  effectDescription: 'Deals damage to all heroes.',
  damageToParty: { base: 8, perTier: 4 },
  visibility: 'VISIBLE_WHEN_REVEALED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
