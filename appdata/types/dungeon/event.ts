import { DungeonEventType, ResourceType, RunBuffRarity } from '../enums';

export interface DungeonEventEffect {
  type: DungeonEventType;
  resourceType?: ResourceType; // For RESOURCE_GAIN/LOSS
  amount?: number;             // For RESOURCE_GAIN/LOSS or HEAL_PARTY (flat)
  percentage?: number;         // For HEAL_PARTY (percentage) or DAMAGE_PARTY (percentage)
  numChoicesToOffer?: number;  // For OFFER_RUN_BUFF_CHOICE
  possibleRarities?: RunBuffRarity[]; // For OFFER_RUN_BUFF_CHOICE
  // Potential future: buffToApply, debuffToApply, enemyToSpawn, etc.
}

export interface DungeonEventDefinition {
  id: string;
  name: string;
  descriptionOnEnter: string; // Text shown when player enters the cell
  effect: DungeonEventEffect;
  iconName: string;
  removeAfterTrigger: boolean; // Does the event cell become empty after triggering?
}
