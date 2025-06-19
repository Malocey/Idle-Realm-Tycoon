

import { useMemo } from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, HeroStats, StatBreakdownItem, TownHallUpgradeEffectType, GlobalEffectTarget, BattleHero, RunBuffEffect, StatusEffectType } from '../types'; 
import { formatNumber, getShardDisplayValueUtil, getTownHallUpgradeEffectValue, getTotalEquipmentStatBonus } from '../utils';
// FIX: Corrected import path for game data definitions
import { TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, SHARD_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, SHARED_SKILL_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, DEMONICON_MILESTONE_REWARDS, AETHERIC_RESONANCE_STAT_CONFIGS, RUN_BUFF_DEFINITIONS as runBuffDefinitions } from '../gameData/index';


export const useStatBreakdown = (
  heroState: PlayerHeroState | BattleHero | null, // Allow BattleHero for status effects
  statKey: keyof HeroStats | null
): StatBreakdownItem[] => {
  const { gameState, staticData, getGlobalBonuses } = useGameContext();

  return useMemo(() => {
    if (!heroState || !statKey) {
      return [];
    }

    const heroDef = staticData.heroDefinitions[heroState.definitionId];
    if (!heroDef) return [];

    const breakdown: StatBreakdownItem[] = [];
    const baseStatValue = heroDef.baseStats[statKey] || 0;
    let levelScaledBase = baseStatValue;

    const isDemoniconBattle = !!(gameState.battleState && gameState.battleState.isDemoniconBattle);
    const achievedDemoniconMilestoneRewards = gameState.achievedDemoniconMilestoneRewards;


    // Level Scaling for Base Stats
    if (statKey === 'maxHp') levelScaledBase = Math.floor(baseStatValue * (1 + (heroState.level - 1) * 0.1));
    else if (statKey === 'damage') levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.1);
    else if (statKey === 'defense') levelScaledBase = Math.floor(baseStatValue * (1 + (heroState.level - 1) * 0.05));
    else if (statKey === 'healPower' && baseStatValue > 0) levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.1);
    else if (statKey === 'maxMana' && baseStatValue > 0) levelScaledBase = Math.floor(baseStatValue * (1 + (heroState.level - 1) * 0.08));
    else if (statKey === 'manaRegen' && baseStatValue > 0) levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.05);
    else if (statKey === 'hpRegen' && baseStatValue > 0) levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.05);
    
    breakdown.push({ source: `Basiswert (Lvl ${heroState.level})`, value: levelScaledBase, isFlat: true });

    let initialFlatSum = levelScaledBase;
    const percentageBonusSources: StatBreakdownItem[] = [];

    const mageTowerBuilt = gameState.buildings.some(b => b.id === 'MAGE_TOWER' && b.level > 0);


    // Hero Skills (Flat Bonuses)
    const skillTree = staticData.skillTrees[heroDef.skillTreeId];
    if (skillTree) {
      Object.entries(heroState.skillLevels).forEach(([skillId, skillLevel]) => {
        const skillDef = skillTree.nodes.find(s => s.id === skillId);
        if (skillDef?.statBonuses && skillLevel > 0) {
          const bonuses = skillDef.statBonuses(skillLevel);
          if (bonuses[statKey] !== undefined && bonuses[statKey] !== 0) {
            breakdown.push({ source: `Skill: ${skillDef.name}`, value: bonuses[statKey]!, isFlat: true });
            initialFlatSum += bonuses[statKey]!;
          }
        }
      });
    }

    // Town Hall Upgrades (Flat Bonuses)
    Object.entries(gameState.townHallUpgradeLevels).forEach(([upgradeId, level]) => {
      if (level > 0) {
        const upgradeDef = staticData.townHallUpgradeDefinitions[upgradeId];
        if (upgradeDef) {
          upgradeDef.effects.forEach(effectDef => {
            if (effectDef.stat === statKey && !effectDef.globalEffectTarget && effectDef.effectParams.type === TownHallUpgradeEffectType.Additive) {
              const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
              if (effectValue !== 0) {
                breakdown.push({ source: `Rathaus: ${upgradeDef.name}`, value: effectValue, isFlat: true });
                initialFlatSum += effectValue;
              }
            }
          });
        }
      }
    });
    
    // Equipment (Flat Bonuses)
    if (heroState.equipmentLevels) {
      Object.entries(heroState.equipmentLevels).forEach(([equipmentId, equipmentLevel]) => {
        if (equipmentLevel > 0) {
          const equipDef = staticData.equipmentDefinitions[equipmentId];
          if (equipDef && equipDef.heroDefinitionId === heroDef.id) {
            const totalBonusFromEquip = getTotalEquipmentStatBonus(equipDef, equipmentLevel);
            if (totalBonusFromEquip[statKey] !== undefined && totalBonusFromEquip[statKey] !== 0) {
              breakdown.push({ source: `Ausrüstung: ${equipDef.name}`, value: totalBonusFromEquip[statKey]!, isFlat: true });
              initialFlatSum += totalBonusFromEquip[statKey]!;
            }
          }
        }
      });
    }

    // Permanent Buffs (Flat Bonuses)
    if (heroState.permanentBuffs) {
      heroState.permanentBuffs.forEach(buff => {
        if (buff.stat === statKey && buff.value !== 0) {
          breakdown.push({ source: `Permanenter Buff`, value: buff.value, isFlat: true, valueDisplay: buff.description.includes('%') ? buff.description : `+${formatNumber(buff.value)}` });
          initialFlatSum += buff.value;
        }
      });
    }
   // Permanent Potion Stats (applied as flat for this model)
  if (heroState.appliedPermanentStats) {
    (Object.keys(heroState.appliedPermanentStats) as Array<keyof HeroStats>).forEach(pStatKey => {
        if (pStatKey === statKey) {
            const bonus = heroState.appliedPermanentStats![pStatKey];
            if (bonus && bonus.flat !== 0) {
                breakdown.push({ source: `Elixier (Flach)`, value: bonus.flat, isFlat: true });
                initialFlatSum += bonus.flat;
            }
        }
      });
    }


    // Shards (Flat Bonuses)
    if (heroState.ownedShards) {
      heroState.ownedShards.forEach(shardInstance => {
        const shardDef = staticData.shardDefinitions[shardInstance.definitionId];
        if (shardDef && shardDef.statAffected === statKey) {
          const shardValue = getShardDisplayValueUtil(shardDef, shardInstance.level);
          if (shardValue !== 0) {
            breakdown.push({ source: `Splitter: ${shardDef.name} Lvl ${shardInstance.level}`, value: shardValue, isFlat: true });
            initialFlatSum += shardValue;
          }
        }
      });
    }
    
    // Shared Passive Skills - Flat Contributions
    Object.entries(gameState.playerSharedSkills).forEach(([skillId, progress]) => {
      if (progress.currentMajorLevel > 0) {
        const skillDef = staticData.sharedSkillDefinitions[skillId];
        if (skillDef && skillDef.effects) {
          skillDef.effects.forEach(effect => {
            if (effect.stat === statKey && !effect.isPercentage) { // Check if effect.stat is the one we're breaking down
              let totalEffectValueFlat = 0;
              for (let i = 0; i < progress.currentMajorLevel; i++) {
                const majorValue = effect.baseValuePerMajorLevel[i];
                if (typeof majorValue === 'number') {
                    totalEffectValueFlat += majorValue;
                } else if (majorValue) {
                    totalEffectValueFlat += majorValue.flat || 0;
                }
                if (i < progress.currentMajorLevel - 1) {
                    const minorValue = effect.minorValuePerMinorLevel[i];
                    const numMinors = skillDef.minorLevelsPerMajorTier[i] || 0;
                    if (typeof minorValue === 'number') {
                        totalEffectValueFlat += minorValue * numMinors;
                    } else if (minorValue) {
                        totalEffectValueFlat += (minorValue.flat || 0) * numMinors;
                    }
                }
              }
              if (progress.currentMajorLevel > 0 && progress.currentMinorLevel > 0) {
                const minorValueCurrentTier = effect.minorValuePerMinorLevel[progress.currentMajorLevel - 1];
                if (typeof minorValueCurrentTier === 'number') {
                    totalEffectValueFlat += minorValueCurrentTier * progress.currentMinorLevel;
                } else if (minorValueCurrentTier) {
                    totalEffectValueFlat += (minorValueCurrentTier.flat || 0) * progress.currentMinorLevel;
                }
              }
              if (totalEffectValueFlat !== 0) {
                breakdown.push({ source: `Shared: ${skillDef.name}`, value: totalEffectValueFlat, isFlat: true });
                initialFlatSum += totalEffectValueFlat;
              }
            }
          });
        }
      }
    });

    // Aetherische Resonanz (Flache Boni)
    const aetherResonanceForStat = gameState.aethericResonanceBonuses[statKey];
    if (aetherResonanceForStat && aetherResonanceForStat.flat !== 0) {
        const flatBonusFromAR = aetherResonanceForStat.flat;
        const arStatConfig = staticData.aethericResonanceStatConfigs.find(conf => conf.id === statKey);
        const arLabel = arStatConfig?.label || statKey.toString();
        breakdown.push({ source: `Aetherische Resonanz (${arLabel}, Flach)`, value: flatBonusFromAR, isFlat: true });
        initialFlatSum += flatBonusFromAR;
    }


    // Sum of all flat bonuses applied
    let sumAffectedByPercentage = initialFlatSum;

    // Percentage bonuses from Town Hall
    Object.entries(gameState.townHallUpgradeLevels).forEach(([upgradeId, level]) => {
        if (level > 0) {
            const thUpgradeDef = staticData.townHallUpgradeDefinitions[upgradeId];
            if (thUpgradeDef) {
                thUpgradeDef.effects.forEach(effectDef => {
                    if (effectDef.stat === statKey && !effectDef.globalEffectTarget && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) {
                        const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
                        if (effectValue !== 0) {
                             percentageBonusSources.push({ source: `Rathaus: ${thUpgradeDef.name}`, value: effectValue, isPercentage: true });
                        }
                    }
                });
            }
        }
    });
    
    // Percentage bonuses from Guild Hall (specific to hero class)
    Object.entries(gameState.guildHallUpgradeLevels).forEach(([upgradeId, level]) => {
        if (level > 0) {
            const ghUpgradeDef = staticData.guildHallUpgradeDefinitions[upgradeId];
            if (ghUpgradeDef) {
                ghUpgradeDef.effects.forEach(effectDef => {
                    if (effectDef.stat === statKey && effectDef.heroClassTarget === heroDef.id && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) {
                        const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
                        if (effectValue !== 0) {
                            percentageBonusSources.push({ source: `Gilde: ${ghUpgradeDef.name}`, value: effectValue, isPercentage: true });
                        }
                    }
                });
            }
        }
    });
    
    // Percentage bonuses from Shared Skills
    Object.entries(gameState.playerSharedSkills).forEach(([skillId, progress]) => {
      if (progress.currentMajorLevel > 0) {
        const skillDef = staticData.sharedSkillDefinitions[skillId];
        if (skillDef && skillDef.effects) {
          skillDef.effects.forEach(effect => {
             if (effect.stat === statKey && effect.isPercentage) {
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
                    percentageBonusSources.push({ 
                        source: `Shared: ${skillDef.name}`, 
                        value: totalEffectValuePercentage, 
                        isPercentage: true 
                    });
                }
            }
          });
        }
      }
    });

    // Aetherische Resonanz (Prozentuale Boni)
    if (aetherResonanceForStat && aetherResonanceForStat.percentage !== 0) {
        const arStatConfig = staticData.aethericResonanceStatConfigs.find(conf => conf.id === statKey);
        const arLabel = arStatConfig?.label || statKey.toString();
        percentageBonusSources.push({ source: `Aetherische Resonanz (${arLabel}, %)`, value: aetherResonanceForStat.percentage, isPercentage: true });
    }

    // Run Buffs (Percentage Additive)
    if (gameState.activeDungeonRun && gameState.activeDungeonRun.activeRunBuffs && runBuffDefinitions) {
        gameState.activeDungeonRun.activeRunBuffs.forEach(activeBuff => {
            const buffDef = runBuffDefinitions[activeBuff.definitionId];
            if (buffDef) {
                const allEffectsForBuff: RunBuffEffect[] = []; 
                buffDef.effects.forEach(eff => allEffectsForBuff.push({...eff, value: eff.value * activeBuff.stacks}));
                const libraryLevel = gameState.runBuffLibraryLevels?.[buffDef.id] || 0;
                if (buffDef.libraryEffectsPerUpgradeLevel && libraryLevel > 0) {
                     const additionalEffects = buffDef.libraryEffectsPerUpgradeLevel(libraryLevel);
                     if (additionalEffects) additionalEffects.forEach(effect => allEffectsForBuff.push({...effect, value: effect.value * activeBuff.stacks}));
                }
                allEffectsForBuff.forEach(effect => { 
                    if (effect.stat === statKey && effect.type === 'PERCENTAGE_ADDITIVE' && effect.value !== 0) {
                        percentageBonusSources.push({ source: `Runenbuff: ${buffDef.name} (x${activeBuff.stacks})`, value: effect.value, isPercentage: true });
                    }
                });
            }
        });
    }
    
    // Temporary Buffs (BattleHero only) (Percentage)
    if ('temporaryBuffs' in heroState && heroState.temporaryBuffs) {
        (heroState as BattleHero).temporaryBuffs.forEach(buff => {
            if (buff.effectType === 'TEMPORARY_STAT_MODIFIER' && buff.stat === statKey && buff.modifierType === 'PERCENTAGE_ADDITIVE' && buff.value !== 0) { 
                percentageBonusSources.push({ source: `Buff: ${staticData.potionDefinitions[buff.potionId]?.name || 'Potion'}`, value: buff.value, isPercentage: true });
            }
        });
    }
    
    // Apply percentage bonuses to the sumAffectedByPercentage
    percentageBonusSources.forEach(pBonus => {
        const numericPBonusValue = Number(pBonus.value);
        const baseForThisBonus = sumAffectedByPercentage; 
        const bonusAmountFromThisSource = baseForThisBonus * numericPBonusValue;
        
        breakdown.push({ 
            source: pBonus.source, 
            value: numericPBonusValue, 
            isPercentage: true,
            valueDisplay: `+${(numericPBonusValue * 100).toFixed(1)}% (von ${formatNumber(baseForThisBonus)}) \u2248 ${formatNumber(bonusAmountFromThisSource)}` 
        });
        
        sumAffectedByPercentage += bonusAmountFromThisSource; 
    });

    // Status Effects (Flat and Percentage Additive for now)
    if ('statusEffects' in heroState && heroState.statusEffects && staticData.statusEffectDefinitions) {
        (heroState as BattleHero).statusEffects.forEach(activeEffect => {
            const effectDefinition = activeEffect.definitionId ? staticData.statusEffectDefinitions[activeEffect.definitionId] : activeEffect;
            if (effectDefinition && effectDefinition.statAffected === statKey && effectDefinition.value !== undefined &&
                (effectDefinition.type === StatusEffectType.BUFF || effectDefinition.type === StatusEffectType.DEBUFF)) {
                if (effectDefinition.modifierType === 'FLAT') {
                    breakdown.push({ source: `Effekt: ${effectDefinition.name}`, value: effectDefinition.value, isFlat: true });
                } else if (effectDefinition.modifierType === 'PERCENTAGE_ADDITIVE') {
                     const baseForThisStatusEffect = sumAffectedByPercentage; 
                     const bonusAmountFromStatusEffect = baseForThisStatusEffect * effectDefinition.value;
                     breakdown.push({
                         source: `Effekt: ${effectDefinition.name}`,
                         value: effectDefinition.value,
                         isPercentage: true,
                         valueDisplay: `${effectDefinition.value > 0 ? '+' : ''}${(effectDefinition.value * 100).toFixed(1)}% (von ${formatNumber(baseForThisStatusEffect)}) \u2248 ${formatNumber(bonusAmountFromStatusEffect)}`
                     });
                }
            }
        });
    }


    // Demonicon Milestone Bonuses (Percentage)
    if (isDemoniconBattle && achievedDemoniconMilestoneRewards && achievedDemoniconMilestoneRewards.length > 0 && DEMONICON_MILESTONE_REWARDS) {
      achievedDemoniconMilestoneRewards.forEach(rewardId => {
        Object.values(DEMONICON_MILESTONE_REWARDS).flat().forEach(milestoneDef => {
          if (milestoneDef.id === rewardId) {
            milestoneDef.rewards.forEach(rewardEffect => {
              if (rewardEffect.type === 'GLOBAL_STAT_MODIFIER' && rewardEffect.stat === statKey && rewardEffect.isPercentage) {
                const baseForThisBonus = sumAffectedByPercentage; 
                const bonusAmount = baseForThisBonus * rewardEffect.value;
                breakdown.push({
                  source: `Demonicon: ${milestoneDef.enemyId} Rank ${milestoneDef.rankToAchieve+1}`,
                  value: rewardEffect.value,
                  isPercentage: true,
                  valueDisplay: `+${(rewardEffect.value * 100).toFixed(1)}% (von ${formatNumber(baseForThisBonus)}) \u2248 ${formatNumber(bonusAmount)}`
                });
              }
            });
          }
        });
      });
    }


    return breakdown;
  }, [heroState, statKey, gameState, staticData, getGlobalBonuses]);
};
