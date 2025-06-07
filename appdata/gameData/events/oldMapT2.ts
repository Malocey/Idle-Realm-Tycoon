
import { DungeonEventDefinition, DungeonEventType } from '../../types';

export const OLD_MAP_T2_DEFINITION: DungeonEventDefinition = {
  id: 'OLD_MAP_T2',
  name: 'Tattered Map Fragment',
  descriptionOnEnter: 'A piece of an old map depicts nearby corridors. It might reveal a secret passage or a hidden danger.',
  effect: {
    type: DungeonEventType.TEXT_ONLY,
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: false,
};
