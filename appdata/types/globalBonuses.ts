
export interface GlobalBonuses {
  allResourceProductionBonus: number;
  waveGoldRewardBonus: number;
  waveXpRewardBonus: number;
  buildingCostReduction: number;
  heroXpGainBonus: number;
  heroRecruitmentCostReduction: number;
  heroDamageBonus: number;
  heroHpBonus: number;
  heroManaBonus: number;
  heroManaRegenBonus: number;
  dungeonBuffChoicesBonus: number;
  catacombKeyCostReduction: number;
  // Mage Tower Shield Bonuses
  allHeroMaxEnergyShieldBonus: number; // Percentage increase to max shield
  allHeroEnergyShieldRechargeRateBonus: number; // Percentage increase to recharge rate
  allHeroEnergyShieldRechargeDelayReduction: number; // Percentage reduction to recharge delay
  // New bonuses from shared skills / research
  heroicPointsGainBonus: number; // For Heroic Points from battles/waves
  enemyGoldDropBonus: number; // For Gold dropped by enemies
  buildingStoneCostReduction: number; 
  dungeonGoldRewardBonus: number;   
  potionCraftingTimeReduction: number;
  potionCraftingCostReduction: number;
  meleeDamageBonus: number;
  rangedCritChanceBonus: number;
  magicUserManaAndHealBonus: number; // Covers Heal Power and Max Mana for magic users
  colosseumHeroicPointsBonus: number;
  aethericMoteDropChanceBonus: number;
  minigameQuarryYieldBonus: number;
  minigameGoldMineYieldBonus: number;
  dungeonEventRewardBonus: number;
  worldMapGoldRewardBonus: number;
  // Specific production bonuses if needed
  woodProductionBonus: number; 
  foodProductionBonus: number;
  goldProductionBonus: number;
  // New Research Bonuses
  dungeonTrapDamageReduction: number; // Percentage
  accountXPGainBonus: number; // Percentage
  researchPointProductionBonus: number; // Percentage
  aethericMoteEffectivenessBonus: number; // Percentage
  buildingCostReductionGeneral: number; // New for ECO_EFFICIENT_TRANSPORT
  heroDodgeChance: number; // New for MIL_QUICK_REFLEXES (conceptual)
  dungeonMapVisionBonus: number; // New for EXP_MAP_REVELATION
  researchTimeReduction: number; // New for SPC_RESEARCH_EFFICIENCY
}