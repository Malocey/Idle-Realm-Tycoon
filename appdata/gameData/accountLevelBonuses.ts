
import { AccountLevelDefinition } from '../types/accountLevelTypes';
import { GlobalBonuses } from '../types/globalBonuses';

export const ACCOUNT_LEVEL_XP_BASE = 100;
export const ACCOUNT_LEVEL_XP_FACTOR = 1.15;

export const calculateXPForAccountLevel = (level: number): number => {
  if (level <= 1) return ACCOUNT_LEVEL_XP_BASE;
  return Math.floor(ACCOUNT_LEVEL_XP_BASE * Math.pow(ACCOUNT_LEVEL_XP_FACTOR, level - 1));
};

export const ACCOUNT_LEVEL_DEFINITIONS: AccountLevelDefinition[] = [
  { level: 1, xpToNextLevel: calculateXPForAccountLevel(1), effects: [] },
  { level: 2, xpToNextLevel: calculateXPForAccountLevel(2), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.005, isPercentage: true }] },
  { level: 3, xpToNextLevel: calculateXPForAccountLevel(3), effects: [{ targetStat: 'heroXpGainBonus', value: 0.005, isPercentage: true }] },
  { level: 4, xpToNextLevel: calculateXPForAccountLevel(4), effects: [{ targetStat: 'heroicPointsGainBonus', value: 0.005, isPercentage: true }] },
  { level: 5, xpToNextLevel: calculateXPForAccountLevel(5), effects: [{ targetStat: 'enemyGoldDropBonus', value: 0.01, isPercentage: true }] },
  { level: 6, xpToNextLevel: calculateXPForAccountLevel(6), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.005, isPercentage: true }] }, // Total +1%
  { level: 7, xpToNextLevel: calculateXPForAccountLevel(7), effects: [{ targetStat: 'heroDamageBonus', value: 0.005, isPercentage: true }] },
  { level: 8, xpToNextLevel: calculateXPForAccountLevel(8), effects: [{ targetStat: 'heroHpBonus', value: 0.005, isPercentage: true }] },
  { level: 9, xpToNextLevel: calculateXPForAccountLevel(9), effects: [{ targetStat: 'buildingCostReduction', value: 0.002, isPercentage: true }] },
  { level: 10, xpToNextLevel: calculateXPForAccountLevel(10), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.01, isPercentage: true }] }, // Total +2%
  // Add more levels as needed
];
