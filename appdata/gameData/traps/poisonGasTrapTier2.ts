
import { TrapDefinition, ResourceType } from '../../types';

export const POISON_GAS_TRAP_TIER2_DEFINITION: TrapDefinition = {
  id: 'POISON_GAS_TRAP_TIER2',
  name: 'Concentrated Poison Gas',
  descriptionWhenTriggered: 'Thick, acrid gas billows into the chamber!',
  effectDescription: 'Deals heavy damage to all heroes.',
  damageToParty: { base: 15, perTier: 7 },
  visibility: 'VISIBLE_WHEN_REVEALED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
