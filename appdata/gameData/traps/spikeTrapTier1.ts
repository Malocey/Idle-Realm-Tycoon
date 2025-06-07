
import { TrapDefinition, ResourceType } from '../../types';

export const SPIKE_TRAP_TIER1_DEFINITION: TrapDefinition = {
  id: 'SPIKE_TRAP_TIER1',
  name: 'Spike Trap',
  descriptionWhenTriggered: 'Hidden spikes shoot from the floor!',
  effectDescription: 'Deals damage to all heroes.',
  damageToParty: { base: 10, perTier: 5 },
  visibility: 'HIDDEN_UNTIL_TRIGGERED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
