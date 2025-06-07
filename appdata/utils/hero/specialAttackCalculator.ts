
import { SpecialAttackDefinition, CalculatedSpecialAttackData, SpecialAttackEffectDefinition } from '../../types';

export const calculateSpecialAttackData = (
  specialAttackDef: SpecialAttackDefinition,
  level: number
): CalculatedSpecialAttackData => {
  const effectDef = specialAttackDef.effects[0]; // Assuming one primary effect for now

  const calculateForLevel = (lvl: number): Omit<CalculatedSpecialAttackData, 'nextLevelDamageMultiplier' | 'nextLevelNumHits' | 'nextLevelCooldownMs' | 'nextLevelHealAmount' | 'nextLevelManaCost'> => {
    if (lvl <= 0) return { currentDamageMultiplier: 0, currentNumHits: 0, currentCooldownMs: specialAttackDef.cooldownBaseMs, currentHealAmount: 0, currentManaCost: specialAttackDef.manaCostBase || 0 };

    const currentDamageMultiplier = effectDef.damageMultiplierBase + (lvl - 1) * effectDef.damageMultiplierIncreasePerLevel;
    const currentNumHits = effectDef.numHitsBase + Math.floor((lvl - 1) * effectDef.numHitsIncreasePerLevel);
    const currentCooldownMs = Math.max(500, specialAttackDef.cooldownBaseMs - (lvl - 1) * specialAttackDef.cooldownReductionPerLevelMs);
    const currentHealAmount = (effectDef.healAmountBase || 0) + (lvl - 1) * (effectDef.healAmountIncreasePerLevel || 0);
    const currentManaCost = (specialAttackDef.manaCostBase || 0) + (lvl - 1) * (specialAttackDef.manaCostIncreasePerLevel || 0);

    return { currentDamageMultiplier, currentNumHits, currentCooldownMs, currentHealAmount, currentManaCost };
  };

  const currentData = calculateForLevel(level);
  let nextLevelData: Partial<CalculatedSpecialAttackData> = {};

  if (level < specialAttackDef.maxLevel || specialAttackDef.maxLevel === -1) {
    const nlData = calculateForLevel(level + 1);
    nextLevelData.nextLevelDamageMultiplier = nlData.currentDamageMultiplier;
    nextLevelData.nextLevelNumHits = nlData.currentNumHits;
    nextLevelData.nextLevelCooldownMs = nlData.currentCooldownMs;
    nextLevelData.nextLevelHealAmount = nlData.currentHealAmount;
    nextLevelData.nextLevelManaCost = nlData.currentManaCost;
  }

  return {
    ...currentData,
    ...nextLevelData,
  };
};
