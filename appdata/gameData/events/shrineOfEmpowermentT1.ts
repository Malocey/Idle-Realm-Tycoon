
import { DungeonEventDefinition, DungeonEventType, RunBuffRarity } from '../../types';

export const SHRINE_OF_EMPOWERMENT_T1_DEFINITION: DungeonEventDefinition = {
  id: 'SHRINE_OF_EMPOWERMENT_T1',
  name: 'Altar of Empowerment',
  descriptionOnEnter: 'An ancient altar hums with faint energy. You feel a surge of possibility.',
  effect: {
    type: DungeonEventType.OFFER_RUN_BUFF_CHOICE,
    numChoicesToOffer: 3,
    possibleRarities: [RunBuffRarity.COMMON, RunBuffRarity.UNCOMMON]
  },
  iconName: 'EVENT_ICON',
  removeAfterTrigger: true,
};
