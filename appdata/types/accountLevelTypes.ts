
import { GlobalBonuses } from './globalBonuses';

export interface AccountLevelBonusEffect {
  targetStat: keyof GlobalBonuses;
  value: number;
  isPercentage?: boolean;
}

export interface AccountLevelDefinition {
  level: number;
  xpToNextLevel: number; // XP needed to reach THIS level from the previous one
  effects: AccountLevelBonusEffect[];
}
