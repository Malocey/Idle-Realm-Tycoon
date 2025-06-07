
import {
    GameState, GlobalBonuses, TownHallUpgradeDefinition, BuildingSpecificUpgradeDefinition, GuildHallUpgradeDefinition,
    TownHallUpgradeEffectDefinition, TownHallUpgradeEffectType, GlobalEffectTarget, BuildingDefinition, Production,
    Cost, ResourceType, ShardDefinition, BuildingSpecificUpgradeEffectDefinition 
} from '../types';
import { ENEMY_DEFINITIONS } from '../gameData/index'; 
import { formatNumber } from './formatters'; 

export const getTownHallUpgradeEffectValue = (effectDef: TownHallUpgradeEffectDefinition | BuildingSpecificUpgradeEffectDefinition | GuildHallUpgradeDefinition['effects'][0], level: number): number => {
  if (level <= 0) return 0;
  const params = effectDef.effectParams;
  let effectValue = 0;
  switch (params.type) {
    case TownHallUpgradeEffectType.Additive:
      effectValue = params.baseIncrease + (level - 1) * params.additiveStep;
      break;
    case TownHallUpgradeEffectType.PercentageBonus:
      effectValue = params.baseAmount + (level - 1) * params.additiveStep;
      break;
  }
  return effectValue;
};

export const getShardDisplayValueUtil = (shardDef: ShardDefinition, level: number): number => {
    if (!shardDef || level <= 0) return 0;
    return parseFloat((shardDef.baseValue * Math.pow(shardDef.scalingFactor, level - 1)).toFixed(2));
};

export const calculateGlobalBonusesFromAllSources = (
    gameState: GameState,
    townHallUpgradeDefinitions: Record<string, TownHallUpgradeDefinition>,
    buildingSpecificUpgradeDefinitions: Record<string, BuildingSpecificUpgradeDefinition[]>,
    guildHallUpgradeDefinitions: Record<string, GuildHallUpgradeDefinition>
): GlobalBonuses => {
    const bonuses: GlobalBonuses = {
        allResourceProductionBonus: 0,
        waveGoldRewardBonus: 0,
        waveXpRewardBonus: 0,
        buildingCostReduction: 0,
        heroXpGainBonus: 0,
        heroRecruitmentCostReduction: 0,
        heroDamageBonus: 0,
        heroHpBonus: 0,
        heroManaBonus: 0,
        heroManaRegenBonus: 0,
        dungeonBuffChoicesBonus: 0,
        catacombKeyCostReduction: 0,
        allHeroMaxEnergyShieldBonus: 0,
        allHeroEnergyShieldRechargeRateBonus: 0,
        allHeroEnergyShieldRechargeDelayReduction: 0,
    };

    // Town Hall Upgrades
    Object.entries(gameState.townHallUpgradeLevels).forEach(([upgradeId, level]) => {
        if (level > 0) {
            const upgradeDef = townHallUpgradeDefinitions[upgradeId];
            if (upgradeDef) {
                upgradeDef.effects.forEach(effectDef => {
                    const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
                    if (effectDef.globalEffectTarget) {
                        switch (effectDef.globalEffectTarget) {
                            case GlobalEffectTarget.ALL_RESOURCE_PRODUCTION: bonuses.allResourceProductionBonus += effectValue; break;
                            case GlobalEffectTarget.WAVE_GOLD_REWARD: bonuses.waveGoldRewardBonus += effectValue; break;
                            case GlobalEffectTarget.WAVE_XP_REWARD: bonuses.waveXpRewardBonus += effectValue; break;
                            case GlobalEffectTarget.BUILDING_COST_REDUCTION: bonuses.buildingCostReduction += effectValue; break;
                            case GlobalEffectTarget.HERO_XP_GAIN: bonuses.heroXpGainBonus += effectValue; break;
                            case GlobalEffectTarget.DUNGEON_BUFF_CHOICES_BONUS: bonuses.dungeonBuffChoicesBonus += effectValue; break;
                            case GlobalEffectTarget.CATACOMB_KEY_COST_REDUCTION: bonuses.catacombKeyCostReduction += effectValue; break;
                        }
                    } else if (effectDef.stat) {
                        if (effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) {
                           if (effectDef.stat === 'damage') bonuses.heroDamageBonus += effectValue;
                           if (effectDef.stat === 'maxHp') bonuses.heroHpBonus += effectValue;
                           if (effectDef.stat === 'maxMana') bonuses.heroManaBonus += effectValue;
                           if (effectDef.stat === 'manaRegen') bonuses.heroManaRegenBonus += effectValue;
                        }
                    }
                });
            }
        }
    });

    // Building Specific Upgrades (Mage Tower for shield bonuses)
    Object.entries(gameState.buildingSpecificUpgradeLevels).forEach(([buildingId, upgrades]) => {
        const buildingSpecificDefs = buildingSpecificUpgradeDefinitions[buildingId];
        if (buildingSpecificDefs) {
            Object.entries(upgrades).forEach(([upgradeId, level]) => {
                if (level > 0) {
                    const upgradeDef = buildingSpecificDefs.find(def => def.id === upgradeId);
                    if (upgradeDef) {
                        upgradeDef.effects.forEach(effectDef => {
                            const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
                            if (effectDef.stat === 'maxMana' && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) bonuses.heroManaBonus += effectValue;
                            if (effectDef.stat === 'manaRegen' && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) bonuses.heroManaRegenBonus += effectValue;
                            if (effectDef.stat === 'maxEnergyShield' && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) bonuses.allHeroMaxEnergyShieldBonus += effectValue;
                            if (effectDef.stat === 'energyShieldRechargeRate' && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) bonuses.allHeroEnergyShieldRechargeRateBonus += effectValue;
                            if (effectDef.stat === 'energyShieldRechargeDelay' && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) bonuses.allHeroEnergyShieldRechargeDelayReduction += effectValue;
                        });
                    }
                }
            });
        }
    });

    // Guild Hall Upgrades
    Object.entries(gameState.guildHallUpgradeLevels).forEach(([upgradeId, level]) => {
        if (level > 0) {
            const upgradeDef = guildHallUpgradeDefinitions[upgradeId];
            if (upgradeDef) {
                upgradeDef.effects.forEach(effectDef => {
                    const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
                    if (effectDef.globalEffectTarget) {
                         switch (effectDef.globalEffectTarget) {
                            case GlobalEffectTarget.HERO_XP_GAIN: bonuses.heroXpGainBonus += effectValue; break;
                            case GlobalEffectTarget.HERO_RECRUITMENT_COST_REDUCTION: bonuses.heroRecruitmentCostReduction += effectValue; break;
                            case GlobalEffectTarget.WAVE_GOLD_REWARD: bonuses.waveGoldRewardBonus += effectValue; break;
                        }
                    }
                });
            }
        }
    });

    // Global Demonicon Level Bonuses
    if (gameState.globalDemoniconLevel > 1) {
        const demoniconLevelBonus = (gameState.globalDemoniconLevel - 1) * 0.05; // 5% per level *after* level 1
        bonuses.allResourceProductionBonus += demoniconLevelBonus;
        bonuses.heroXpGainBonus += demoniconLevelBonus;
    }

    return bonuses;
};

export const calculateBuildingProduction = (def: BuildingDefinition, level: number): Production[] => {
  return def.baseProduction.map(prod => ({
    ...prod,
    amountPerTick: parseFloat((prod.amountPerTick * Math.pow(def.productionScalingFactor, level - 1)).toFixed(3))
  }));
};

export const calculateIndividualEnemyLoot = (
  baseLoot: Cost[],
  difficultyScale: number,
  isElite?: boolean,
  dungeonTier?: number // New optional parameter
): Cost[] => {
  if (!baseLoot) return [];
  
  const eliteMultiplier = isElite ? 1.25 : 1.0;
  const tierLootMultiplier = (dungeonTier && dungeonTier > 0) ? (1 + (dungeonTier * 0.5)) : 1.0;

  let finalLootItems: Cost[] = baseLoot.map(lootItem => {
    let finalAmount = Math.floor(lootItem.amount * difficultyScale * eliteMultiplier);
    finalAmount = Math.floor(finalAmount * tierLootMultiplier);
    return { resource: lootItem.resource, amount: Math.max(1, finalAmount) };
  });

  // Handle Crystal and Blueprint drops, applying tier multiplier to their *amount* if they drop
  const baseCrystalChance = 0.05;
  const eliteCrystalBonusChance = isElite ? 0.15 : 0;
  if (difficultyScale > 1.5 && Math.random() < (baseCrystalChance * (difficultyScale - 1.4) + eliteCrystalBonusChance)) {
    let crystalAmount = 1;
    crystalAmount = Math.floor(crystalAmount * tierLootMultiplier);
    finalLootItems.push({ resource: ResourceType.CRYSTALS, amount: Math.max(1, crystalAmount) });
  }
  
  const baseBlueprintChance = 0.03;
  const eliteBlueprintBonusChance = isElite ? 0.05 : 0;
  if (difficultyScale > 2.0 && Math.random() < (baseBlueprintChance * (difficultyScale - 1.9) + eliteBlueprintBonusChance)) {
    let blueprintAmount = 1;
    blueprintAmount = Math.floor(blueprintAmount * tierLootMultiplier);
    finalLootItems.push({ resource: ResourceType.CATACOMB_BLUEPRINT, amount: Math.max(1, blueprintAmount) });
  }

  return finalLootItems;
};
