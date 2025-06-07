
import { DungeonEventDefinition, DungeonEventType, ResourceType } from '../../types';

export const HIDDEN_CACHE_TIER1_DEFINITION: DungeonEventDefinition = {
  id: 'HIDDEN_CACHE_TIER1',
  name: 'Hidden Cache',
  descriptionOnEnter: 'Loose stones in the wall conceal a small alcove.',
  effect: {
    type: DungeonEventType.RESOURCE_GAIN,
    resourceType: ResourceType.GOLD,
    amount: 50,
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: true,
};
