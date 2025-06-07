
import { DungeonEventDefinition, DungeonEventType } from '../../types';

export const EERIE_SOUNDS_TIER1_DEFINITION: DungeonEventDefinition = {
  id: 'EERIE_SOUNDS_TIER1',
  name: 'Eerie Sounds',
  descriptionOnEnter: 'An unsettling scratching and whispering echoes from the shadows. Nothing further happens... for now.',
  effect: {
    type: DungeonEventType.TEXT_ONLY,
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: false,
};
