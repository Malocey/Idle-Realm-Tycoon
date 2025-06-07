
import { DungeonEventDefinition, DungeonEventType } from '../../types';

export const OLD_DIARY_TIER1_DEFINITION: DungeonEventDefinition = {
  id: 'OLD_DIARY_TIER1',
  name: 'Old Diary',
  descriptionOnEnter: 'A tattered diary lies on a pedestal. It speaks of the catacombs\' dangers and a hidden treasure.',
  effect: {
      type: DungeonEventType.TEXT_ONLY,
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: false,
};
