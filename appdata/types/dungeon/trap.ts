import { Cost } from '../common';

export interface TrapDefinition {
  id: string;
  name: string;
  descriptionWhenTriggered: string;
  effectDescription: string;
  damageToParty?: { base: number, perTier?: number };
  resourceLoss?: Cost[];
  // debuffToParty?: DebuffEffect; // Future: { type: 'STUN' | 'POISON', duration: number, chance: number }
  visibility: 'HIDDEN_UNTIL_TRIGGERED' | 'VISIBLE_WHEN_REVEALED';
  iconNameWhenVisible: string;
  iconNameWhenTriggered: string;
  // disarmDifficulty?: number; // Future
  // disarmResourceCost?: Cost[]; // Future
}
