
import { DungeonEventDefinition, DungeonEventType } from '../../types';

export const RESTFUL_SHRINE_T2_DEFINITION: DungeonEventDefinition = {
  id: 'RESTFUL_SHRINE_T2',
  name: 'Restful Shrine',
  descriptionOnEnter: 'A serene shrine offers a moment of respite. The party feels invigorated.',
  effect: {
    type: DungeonEventType.HEAL_PARTY,
    percentage: 0.50,
  },
  iconName: 'HEALTH_POTION',
  removeAfterTrigger: true,
};
