
import { HeroEquipmentDefinition, HeroStats } from '../../types';

export const getTotalEquipmentStatBonus = (
  equipDef: HeroEquipmentDefinition,
  level: number
): Partial<HeroStats> => {
  const totalBonuses: Partial<HeroStats> = {};
  if (level <= 0) return totalBonuses;

  // Sum bonuses for each level up to the current equipment level
  for (let i = 1; i <= level; i++) {
    const levelBonuses = equipDef.statBonusesPerLevel(i); // Pass the specific level 'i'
    (Object.keys(levelBonuses) as Array<keyof HeroStats>).forEach(statKey => {
      totalBonuses[statKey] = (totalBonuses[statKey] || 0) + (levelBonuses[statKey] || 0);
    });
  }
  return totalBonuses;
};
