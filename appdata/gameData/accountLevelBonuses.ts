
import { AccountLevelDefinition } from '../types/accountLevelTypes';
import { GlobalBonuses } from '../types/globalBonuses';

export const ACCOUNT_LEVEL_XP_BASE = 100;
export const ACCOUNT_LEVEL_XP_FACTOR = 1.15;

// Chance für Gebäude-Upgrade durch Loot, basierend auf Account-Level
export const BUILDING_INSTANT_UPGRADE_BASE_CHANCE_ACCOUNT_LVL_5 = 0.02; // 2% bei Lvl 5
export const BUILDING_INSTANT_UPGRADE_MAX_CHANCE_ACCOUNT_LVL_10 = 0.05; // 5% bei Lvl 10

export const calculateXPForAccountLevel = (level: number): number => {
  if (level <= 1) return ACCOUNT_LEVEL_XP_BASE; // XP needed to reach level 2
  return Math.floor(ACCOUNT_LEVEL_XP_BASE * Math.pow(ACCOUNT_LEVEL_XP_FACTOR, level - 1));
};

export const ACCOUNT_LEVEL_DEFINITIONS: AccountLevelDefinition[] = [
  { level: 1, xpToNextLevel: calculateXPForAccountLevel(1), effects: [] },
  { level: 2, xpToNextLevel: calculateXPForAccountLevel(2), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.005, isPercentage: true }] },
  { level: 3, xpToNextLevel: calculateXPForAccountLevel(3), effects: [{ targetStat: 'heroXpGainBonus', value: 0.005, isPercentage: true }] },
  { level: 4, xpToNextLevel: calculateXPForAccountLevel(4), effects: [{ targetStat: 'heroicPointsGainBonus', value: 0.005, isPercentage: true }] },
  { level: 5, xpToNextLevel: calculateXPForAccountLevel(5), effects: [{ targetStat: 'enemyGoldDropBonus', value: 0.01, isPercentage: true }] }, // Building upgrade chance starts at 2% this level via code
  { level: 6, xpToNextLevel: calculateXPForAccountLevel(6), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.005, isPercentage: true }] }, 
  { level: 7, xpToNextLevel: calculateXPForAccountLevel(7), effects: [{ targetStat: 'heroDamageBonus', value: 0.005, isPercentage: true }] },
  { level: 8, xpToNextLevel: calculateXPForAccountLevel(8), effects: [{ targetStat: 'heroHpBonus', value: 0.005, isPercentage: true }] },
  { level: 9, xpToNextLevel: calculateXPForAccountLevel(9), effects: [{ targetStat: 'buildingCostReduction', value: 0.002, isPercentage: true }] },
  { level: 10, xpToNextLevel: calculateXPForAccountLevel(10), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.01, isPercentage: true }] }, // Building upgrade chance reaches 5% at this level
  { level: 11, xpToNextLevel: calculateXPForAccountLevel(11), effects: [{ targetStat: 'researchPointProductionBonus', value: 0.01, isPercentage: true }] },
  { level: 12, xpToNextLevel: calculateXPForAccountLevel(12), effects: [{ targetStat: 'heroXpGainBonus', value: 0.01, isPercentage: true }] },
  { level: 13, xpToNextLevel: calculateXPForAccountLevel(13), effects: [{ targetStat: 'heroicPointsGainBonus', value: 0.01, isPercentage: true }] },
  { level: 14, xpToNextLevel: calculateXPForAccountLevel(14), effects: [{ targetStat: 'enemyGoldDropBonus', value: 0.015, isPercentage: true }] },
  { level: 15, xpToNextLevel: calculateXPForAccountLevel(15), effects: [{ targetStat: 'researchTimeReduction', value: 0.01, isPercentage: true }] },
  { level: 16, xpToNextLevel: calculateXPForAccountLevel(16), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.01, isPercentage: true }] },
  { level: 17, xpToNextLevel: calculateXPForAccountLevel(17), effects: [{ targetStat: 'heroDamageBonus', value: 0.01, isPercentage: true }] },
  { level: 18, xpToNextLevel: calculateXPForAccountLevel(18), effects: [{ targetStat: 'heroHpBonus', value: 0.01, isPercentage: true }] },
  { level: 19, xpToNextLevel: calculateXPForAccountLevel(19), effects: [{ targetStat: 'buildingCostReduction', value: 0.003, isPercentage: true }] },
  { level: 20, xpToNextLevel: calculateXPForAccountLevel(20), effects: [{ targetStat: 'allResourceProductionBonus', value: 0.015, isPercentage: true }] },
  // Add more levels as needed
];