
import { TrapDefinition, ResourceType } from '../../types';

export const COLLAPSING_CEILING_TRAP_TIER2_DEFINITION: TrapDefinition = {
  id: 'COLLAPSING_CEILING_TRAP_TIER2',
  name: 'Collapsing Ceiling',
  descriptionWhenTriggered: 'Rumbling precedes a section of the ceiling caving in!',
  effectDescription: 'Deals massive damage to one random hero.',
  damageToParty: { base: 50, perTier: 15 },
  visibility: 'VISIBLE_WHEN_REVEALED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
