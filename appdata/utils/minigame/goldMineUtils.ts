
import { GoldMinePlayerStats, GoldMineUpgradeDefinition } from '../../types';
import { INITIAL_GOLD_MINE_PLAYER_STATS } from '../../constants'; // Corrected import path
import { GOLD_MINE_UPGRADE_DEFINITIONS } from '../../gameData';

export const calculateGoldMinePlayerStats = (
  baseStats: typeof INITIAL_GOLD_MINE_PLAYER_STATS,
  permanentUpgradeLevels: Record<string, number>
): GoldMinePlayerStats => {
  const calculatedStats: GoldMinePlayerStats = { ...baseStats };

  Object.entries(permanentUpgradeLevels).forEach(([upgradeId, level]) => {
    const upgradeDef = GOLD_MINE_UPGRADE_DEFINITIONS[upgradeId];
    if (upgradeDef && level > 0) {
      upgradeDef.effects.forEach(effect => {
        if (calculatedStats[effect.stat] !== undefined) {
          let bonus = effect.value * level;
          if (effect.isPercentage) {
            (calculatedStats[effect.stat] as number) *= (1 + bonus);
          } else {
            (calculatedStats[effect.stat] as number) += bonus;
          }
        }
      });
    }
  });

  // Ensure stats are whole numbers or appropriate precision if needed
  calculatedStats.maxStamina = Math.floor(calculatedStats.maxStamina);
  calculatedStats.miningSpeed = Math.floor(calculatedStats.miningSpeed);
  calculatedStats.fogOfWarRadius = Math.floor(calculatedStats.fogOfWarRadius);

  return calculatedStats;
};
