
import { DungeonEventDefinition, DungeonEventType, ResourceType } from '../../types';

export const ANCIENT_ARMORY_T2_DEFINITION: DungeonEventDefinition = {
  id: 'ANCIENT_ARMORY_T2',
  name: 'Ancient Armory',
  descriptionOnEnter: 'You stumble upon a dusty, forgotten armory. Most weapons are unusable, but a few enhancement shards might be salvageable.',
  effect: {
    type: DungeonEventType.RESOURCE_GAIN,
    resourceType: ResourceType.IRON,
    amount: 25,
  },
  iconName: 'ANVIL',
  removeAfterTrigger: true,
};
