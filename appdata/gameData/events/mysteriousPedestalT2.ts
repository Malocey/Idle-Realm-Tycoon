
import { DungeonEventDefinition, DungeonEventType, ResourceType } from '../../types';

export const MYSTERIOUS_PEDESTAL_T2_DEFINITION: DungeonEventDefinition = {
  id: 'MYSTERIOUS_PEDESTAL_T2',
  name: 'Mysterious Pedestal',
  descriptionOnEnter: 'A pedestal with two indentations. Touching one might yield a reward, the other a consequence.',
  effect: {
    type: DungeonEventType.RESOURCE_GAIN,
    resourceType: ResourceType.CRYSTALS,
    amount: 15,
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: true,
};
