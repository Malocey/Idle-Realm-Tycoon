
import { DungeonEventDefinition, DungeonEventType, RunBuffRarity } from '../../types';

export const SHRINE_OF_GREATER_EMPOWERMENT_T2_DEFINITION: DungeonEventDefinition = {
  id: 'SHRINE_OF_GREATER_EMPOWERMENT_T2',
  name: 'Altar of Greater Empowerment',
  descriptionOnEnter: 'This imposing altar radiates significant power, offering a substantial boon.',
  effect: {
    type: DungeonEventType.OFFER_RUN_BUFF_CHOICE,
    numChoicesToOffer: 3,
    possibleRarities: [RunBuffRarity.UNCOMMON, RunBuffRarity.RARE, RunBuffRarity.EPIC]
  },
  iconName: 'UPGRADE',
  removeAfterTrigger: true,
};
