
import { TrapDefinition, ResourceType } from '../../types';

export const MANA_DRAIN_TRAP_TIER2_DEFINITION: TrapDefinition = {
  id: 'MANA_DRAIN_TRAP_TIER2',
  name: 'Mana Siphon Trap',
  descriptionWhenTriggered: 'Ethereal tendrils latch onto the party, draining their magical energies!',
  effectDescription: 'Reduces current mana of all heroes by a percentage.',
  visibility: 'HIDDEN_UNTIL_TRIGGERED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
