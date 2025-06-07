
import { DungeonEventDefinition, DungeonEventType } from '../../types';

export const EERIE_SOUNDS_TIER2_DEFINITION: DungeonEventDefinition = {
  id: 'EERIE_SOUNDS_TIER2',
  name: 'Intensified Eerie Sounds',
  descriptionOnEnter: 'The unsettling sounds are louder here, accompanied by a chilling draft. Your senses are heightened, but at what cost?',
  effect: {
    type: DungeonEventType.TEXT_ONLY,
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: false,
};
