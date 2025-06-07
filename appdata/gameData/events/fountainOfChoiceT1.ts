
import { DungeonEventDefinition, DungeonEventType, RunBuffRarity } from '../../types';

export const FOUNTAIN_OF_CHOICE_T1_DEFINITION: DungeonEventDefinition = {
  id: 'FOUNTAIN_OF_CHOICE_T1',
  name: 'Fountain of Choice',
  descriptionOnEnter: 'A shimmering fountain offers visions of power.',
  effect: {
    type: DungeonEventType.OFFER_RUN_BUFF_CHOICE,
    numChoicesToOffer: 3,
    possibleRarities: [RunBuffRarity.COMMON, RunBuffRarity.UNCOMMON, RunBuffRarity.RARE]
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: true,
};
