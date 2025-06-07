
import { useMemo } from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, HeroStats, StatBreakdownItem, TownHallUpgradeEffectType, GlobalEffectTarget, BattleHero, RunBuffEffect } from '../types'; // Added BattleHero and RunBuffEffect
import { formatNumber, getShardDisplayValueUtil, getTownHallUpgradeEffectValue, getTotalEquipmentStatBonus } from '../utils';
// Corrected import path for SHARED_SKILL_DEFINITIONS (now accessed via staticData)

export const useStatBreakdown = (
  heroState: PlayerHeroState | null,
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

    // 1. Base Stat + Level Scaling
    if (statKey === 'maxHp') levelScaledBase = Math.floor(baseStatValue * (1 + (heroState.level - 1) * 0.1));
    else if (statKey === 'damage') levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.1);
    else if (statKey === 'defense') levelScaledBase = Math.floor(baseStatValue * (1 + (heroState.level - 1) * 0.05));
    else if (statKey === 'healPower' && baseStatValue > 0) levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.1);
    else if (statKey === 'maxMana' && baseStatValue > 0) levelScaledBase = Math.floor(baseStatValue * (1 + (heroState.level - 1) * 0.08));
    else if (statKey === 'manaRegen' && baseStatValue > 0) levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.05);
    else if (statKey === 'hpRegen' && baseStatValue > 0) levelScaledBase = baseStatValue * (1 + (heroState.level - 1) * 0.05);
    
    breakdown.push({ source: `Basiswert (Lvl ${heroState.level})`, value: levelScaledBase, isFlat: true });

    let initialFlatSum = levelScaledBase;

    // 2. Skill Tree Bonuses (Flat)
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

    // 3. Town Hall Global Additive Bonuses
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
    
    // 4. Equipment Bonuses (Flat)
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

    // 5. Permanent Buffs (Flat)
    if (heroState.permanentBuffs) {
      heroState.permanentBuffs.forEach(buff => {
        if (buff.stat === statKey && buff.value !== 0) {
          breakdown.push({ source: `Permanenter Buff`, value: buff.value, isFlat: true, valueDisplay: buff.description.includes('%') ? buff.description : `+${formatNumber(buff.value)}` });
          initialFlatSum += buff.value;
        }
      });
    }

    // 6. Shards (Flat)
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
    
    // 7. Shared Passive Skills - Flat Bonuses
    Object.entries(gameState.playerSharedSkills).forEach(([skillId, progress]) => {
      if (progress.currentMajorLevel > 0) {
        const skillDef = staticData.sharedSkillDefinitions[skillId];
        if (skillDef && skillDef.effects) {
          skillDef.effects.forEach(effect => {
            if (!effect.isPercentage && effect.stat === statKey) {
              let totalEffectValueFlat = 0;
              for (let i = 0; i < progress.currentMajorLevel; i++) {
                totalEffectValueFlat += effect.baseValuePerMajorLevel[i] || 0;
                if (i < progress.currentMajorLevel -1 ) {
                    totalEffectValueFlat += (effect.minorValuePerMinorLevel[i] || 0) * (skillDef.minorLevelsPerMajorTier[i] || 0);
                }
              }
              if (progress.currentMajorLevel > 0) {
                  totalEffectValueFlat += (effect.minorValuePerMinorLevel[progress.currentMajorLevel - 1] || 0) * progress.currentMinorLevel;
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

    // --- Percentage Bonuses Section ---
    const percentageBonusSources: StatBreakdownItem[] = [];
    // const townAndGuildGlobalBonuses = getGlobalBonuses(); // Not used directly here for iteration, individual sources are preferred for breakdown

    // Town Hall Percentage Effects (applied to specific stats, not via GlobalEffectTarget enum for these hero stats)
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
    
    // Guild Hall Percentage Bonuses (Hero Specific)
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
    
    // Shared Passive Skills - Percentage Bonuses
    Object.entries(gameState.playerSharedSkills).forEach(([skillId, progress]) => {
      if (progress.currentMajorLevel > 0) {
        const skillDef = staticData.sharedSkillDefinitions[skillId];
        if (skillDef && skillDef.effects) {
          skillDef.effects.forEach(effect => {
            if (effect.isPercentage && effect.stat === statKey) {
              let totalEffectValuePercentage = 0;
             for (let i = 0; i < progress.currentMajorLevel; i++) {
              totalEffectValuePercentage += effect.baseValuePerMajorLevel[i] || 0;
               if (i < progress.currentMajorLevel -1) { 
                  totalEffectValuePercentage += (effect.minorValuePerMinorLevel[i] || 0) * (skillDef.minorLevelsPerMajorTier[i] || 0);
              }
            }
            if (progress.currentMajorLevel > 0) { 
                totalEffectValuePercentage += (effect.minorValuePerMinorLevel[progress.currentMajorLevel - 1] || 0) * progress.currentMinorLevel;
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

    // Run Buffs - Percentage Additive
    if (gameState.activeDungeonRun && gameState.activeDungeonRun.activeRunBuffs) {
        gameState.activeDungeonRun.activeRunBuffs.forEach(activeBuff => {
            const buffDef = staticData.runBuffDefinitions[activeBuff.definitionId];
            if (buffDef) {
                const allEffectsForBuff: RunBuffEffect[] = [];
                buffDef.effects.forEach(eff => allEffectsForBuff.push({...eff, value: eff.value * activeBuff.stacks}));
                const libraryLevel = gameState.runBuffLibraryLevels?.[buffDef.id] || 0;
                if (buffDef.libraryEffectsPerUpgradeLevel && libraryLevel > 0) {
                     const libEffects = buffDef.libraryEffectsPerUpgradeLevel(libraryLevel);
                     if (libEffects) libEffects.forEach(eff => allEffectsForBuff.push({...eff, value: eff.value * activeBuff.stacks}));
                }
                allEffectsForBuff.forEach(effect => {
                    if (effect.stat === statKey && effect.type === 'PERCENTAGE_ADDITIVE' && effect.value !== 0) {
                        percentageBonusSources.push({ source: `Runenbuff: ${buffDef.name} (x${activeBuff.stacks})`, value: effect.value, isPercentage: true });
                    }
                });
            }
        });
    }
    
    // Temporary Buffs - Percentage (from BattleHero state if applicable)
    if ('temporaryBuffs' in heroState && heroState.temporaryBuffs) {
        (heroState as BattleHero).temporaryBuffs.forEach(buff => {
            if (buff.effectType === 'TEMPORARY_STAT_MODIFIER' && buff.stat === statKey && buff.modifierType === 'PERCENTAGE' && buff.value !== 0) {
                percentageBonusSources.push({ source: `Buff: ${staticData.potionDefinitions[buff.potionId]?.name || 'Potion'}`, value: buff.value, isPercentage: true });
            }
        });
    }
    
    // Process and display percentage bonuses
    let sumAffectedByPercentage = initialFlatSum;
    percentageBonusSources.forEach(pBonus => {
        const numericPBonusValue = Number(pBonus.value);
        const baseForThisBonus = sumAffectedByPercentage; // Percentage bonuses usually apply to the sum of flat bonuses
        const bonusAmountFromThisSource = baseForThisBonus * numericPBonusValue;
        
        breakdown.push({ 
            source: pBonus.source, 
            value: numericPBonusValue, 
            isPercentage: true,
            valueDisplay: `+${(numericPBonusValue * 100).toFixed(1)}% (von ${formatNumber(baseForThisBonus)}) \u2248 ${formatNumber(bonusAmountFromThisSource)}` 
        });
        
        sumAffectedByPercentage += bonusAmountFromThisSource; // Add to the sum for subsequent percentage bonuses to apply to
    });

    return breakdown;
  }, [heroState, statKey, gameState, staticData, getGlobalBonuses]);
};
