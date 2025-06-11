
import {
    GameState, GlobalBonuses, TownHallUpgradeDefinition, BuildingSpecificUpgradeDefinition, GuildHallUpgradeDefinition,
    TownHallUpgradeEffectDefinition, TownHallUpgradeEffectType, GlobalEffectTarget, BuildingDefinition, Production,
    Cost, ResourceType, ShardDefinition, BuildingSpecificUpgradeEffectDefinition, SharedSkillDefinition,
    AccountLevelDefinition, ResearchDefinition, ResearchEffectDefinition
} from '../types';
import { ENEMY_DEFINITIONS, SHARED_SKILL_DEFINITIONS, ACCOUNT_LEVEL_DEFINITIONS, RESEARCH_DEFINITIONS } from '../gameData/index';
import { formatNumber } from './formatters';
import { TownHallUpgradeEffectParams } from '../types';

interface EffectDefinitionForValueCalculation {
  effectParams: TownHallUpgradeEffectParams;
}

export const getTownHallUpgradeEffectValue = (effectDef: EffectDefinitionForValueCalculation | ResearchEffectDefinition, level: number): number => {
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
        heroicPointsGainBonus: 0,
        enemyGoldDropBonus: 0,
        buildingStoneCostReduction: 0,
        dungeonGoldRewardBonus: 0,
        potionCraftingTimeReduction: 0,
        potionCraftingCostReduction: 0,
        meleeDamageBonus: 0,
        rangedCritChanceBonus: 0,
        magicUserManaAndHealBonus: 0,
        colosseumHeroicPointsBonus: 0,
        aethericMoteDropChanceBonus: 0,
        minigameQuarryYieldBonus: 0,
        minigameGoldMineYieldBonus: 0,
        dungeonEventRewardBonus: 0,
        worldMapGoldRewardBonus: 0,
        woodProductionBonus: 0,
        foodProductionBonus: 0,
        goldProductionBonus: 0,
        dungeonTrapDamageReduction: 0,
        accountXPGainBonus: 0,
        researchPointProductionBonus: 0,
        aethericMoteEffectivenessBonus: 0,
        buildingCostReductionGeneral: 0,
        heroDodgeChance: 0,
        dungeonMapVisionBonus: 0,
        researchTimeReduction: 0,
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

    // Building Specific Upgrades
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
                            // Add other building-specific global bonus handling here
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

    // Shared Passive Skills
    Object.entries(gameState.playerSharedSkills).forEach(([skillId, progress]) => {
        if (progress.currentMajorLevel > 0) {
            const skillDef = SHARED_SKILL_DEFINITIONS[skillId];
            if (skillDef && skillDef.effects) {
                skillDef.effects.forEach(effect => {
                    if (bonuses.hasOwnProperty(effect.stat) && effect.isPercentage) {
                        let totalEffectValuePercentage = 0;
                        for (let i = 0; i < progress.currentMajorLevel; i++) {
                            const majorValue = effect.baseValuePerMajorLevel[i];
                             if (typeof majorValue === 'number') totalEffectValuePercentage += majorValue;
                             else if (majorValue) totalEffectValuePercentage += majorValue.percent || 0;
                           if (i < progress.currentMajorLevel -1) {
                              const minorValue = effect.minorValuePerMinorLevel[i];
                              const numMinors = skillDef.minorLevelsPerMajorTier[i] || 0;
                              if (typeof minorValue === 'number') totalEffectValuePercentage += minorValue * numMinors;
                              else if (minorValue) totalEffectValuePercentage += (minorValue.percent || 0) * numMinors;
                          }
                        }
                        if (progress.currentMajorLevel > 0 && progress.currentMinorLevel > 0) {
                            const minorValueCurrentTier = effect.minorValuePerMinorLevel[progress.currentMajorLevel - 1];
                            if (typeof minorValueCurrentTier === 'number') totalEffectValuePercentage += minorValueCurrentTier * progress.currentMinorLevel;
                            else if (minorValueCurrentTier) totalEffectValuePercentage += (minorValueCurrentTier.percent || 0) * progress.currentMinorLevel;
                        }
                        if (totalEffectValuePercentage !== 0) {
                            (bonuses[effect.stat as keyof GlobalBonuses] as number) += totalEffectValuePercentage;
                        }
                    }
                });
            }
        }
    });

    // Global Demonicon Level Bonuses
    if (gameState.globalDemoniconLevel > 1) {
        const demoniconLevelBonus = (gameState.globalDemoniconLevel - 1) * 0.05;
        bonuses.allResourceProductionBonus += demoniconLevelBonus;
        bonuses.heroXpGainBonus += demoniconLevelBonus;
        bonuses.heroicPointsGainBonus += demoniconLevelBonus;
        bonuses.enemyGoldDropBonus += demoniconLevelBonus;
    }

    // Account Level Bonuses
    if (ACCOUNT_LEVEL_DEFINITIONS) {
        for (let i = 0; i < gameState.accountLevel; i++) {
            const levelDef = ACCOUNT_LEVEL_DEFINITIONS.find(def => def.level === i + 1);
            if (levelDef) {
                levelDef.effects.forEach(effect => {
                    if (bonuses.hasOwnProperty(effect.targetStat)) {
                        (bonuses[effect.targetStat] as number) += effect.value;
                    }
                });
            }
        }
    }

    // Research Bonuses
    Object.entries(gameState.completedResearch).forEach(([researchId, entry]) => {
      const researchDef = RESEARCH_DEFINITIONS[researchId];
      if (researchDef && entry.level > 0) {
        researchDef.effects.forEach(effectDef => { 
          const effectValue = getTownHallUpgradeEffectValue(effectDef, entry.level);
          const statKey = effectDef.stat as keyof GlobalBonuses;
          if (statKey && bonuses.hasOwnProperty(statKey)) {
            if (effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) {
                (bonuses[statKey] as number) += effectValue;
            } else if (effectDef.effectParams.type === TownHallUpgradeEffectType.Additive) {
                // Assuming direct addition for flat bonuses from research to potentially percentage-based global bonuses.
                // This might need more nuanced handling if a flat value should modify a percentage, or vice-versa.
                (bonuses[statKey] as number) += effectValue; 
            }
          } else if (statKey) { 
             // console.warn(`Research effect for "${statKey}" has no corresponding GlobalBonus field or is a new flat bonus to a perc. field.`);
          }
        });
      }
    });

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
  dungeonTier?: number
): Cost[] => {
  if (!baseLoot) return [];

  const eliteMultiplier = isElite ? 1.25 : 1.0;
  const tierLootMultiplier = (dungeonTier && dungeonTier > 0) ? (1 + (dungeonTier * 0.5)) : 1.0;

  let finalLootItems: Cost[] = baseLoot.map(lootItem => {
    let finalAmount = Math.floor(lootItem.amount * difficultyScale * eliteMultiplier);
    finalAmount = Math.floor(finalAmount * tierLootMultiplier);
    return { resource: lootItem.resource, amount: Math.max(1, finalAmount) };
  });

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
