
import { TrapDefinition, ResourceType } from '../../types';

export const RESOURCE_DRAIN_TRAP_TIER1_DEFINITION: TrapDefinition = {
  id: 'RESOURCE_DRAIN_TRAP_TIER1',
  name: 'Resource Drain Trap',
  descriptionWhenTriggered: 'Magical runes flare, siphoning some of your supplies!',
  effectDescription: 'Loses a small amount of Gold.',
  resourceLoss: [{ resource: ResourceType.GOLD, amount: 25 }],
  visibility: 'VISIBLE_WHEN_REVEALED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
