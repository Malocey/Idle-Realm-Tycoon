
import { TrapDefinition, ResourceType } from '../../types';

export const SPIKE_TRAP_TIER2_DEFINITION: TrapDefinition = {
  id: 'SPIKE_TRAP_TIER2',
  name: 'Reinforced Spike Trap',
  descriptionWhenTriggered: 'Reinforced spikes erupt violently from the floor!',
  effectDescription: 'Deals significant damage to all heroes.',
  damageToParty: { base: 20, perTier: 8 },
  visibility: 'HIDDEN_UNTIL_TRIGGERED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
