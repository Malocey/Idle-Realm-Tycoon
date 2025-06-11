
import {
    PlayerHeroState, BattleHero, HeroDefinition, SkillTreeDefinition, HeroStats, SpecialAttackDefinition, CalculatedSpecialAttackData,
    HeroEquipmentDefinition, GameState, GlobalBonuses, ShardDefinition, RunBuffDefinition, RunBuffEffect, TownHallUpgradeEffectType,
    TownHallUpgradeDefinition, GuildHallUpgradeDefinition, SharedSkillDefinition, SharedSkillEffect, StatusEffectDefinition, StatusEffect, StatusEffectType,
    DemoniconMilestoneRewardDefinition
} from '../../types';
import { getShardDisplayValueUtil, getTownHallUpgradeEffectValue } from '../gameLogicUtils';
import { TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, SHARED_SKILL_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, DEMONICON_MILESTONE_REWARDS, AETHERIC_RESONANCE_STAT_CONFIGS } from '../../gameData/index';
import { formatNumber } from '../formatters';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK } from '../../constants';


export const calculateHeroStats = (
  heroState: PlayerHeroState | BattleHero,
  heroDef: HeroDefinition,
  skillTree: SkillTreeDefinition | undefined,
  gameState: GameState,
  townHallUpgradeDefinitions: Record<string, TownHallUpgradeDefinition>,
  guildHallUpgradeDefinitions: Record<string, GuildHallUpgradeDefinition>,
  equipmentDefinitions: Record<string, HeroEquipmentDefinition>,
  globalBonuses: GlobalBonuses,
  shardDefinitions: Record<string, ShardDefinition>,
  runBuffDefinitions?: Record<string, RunBuffDefinition>,
  statusEffectDefinitionsParam?: Record<string, StatusEffectDefinition>,
  isDemoniconBattle?: boolean,
  achievedDemoniconMilestoneRewards?: string[]
): HeroStats => {
  let stats: HeroStats = {
    maxHp: heroDef.baseStats.maxHp || 0,
    damage: heroDef.baseStats.damage || 0,
    defense: heroDef.baseStats.defense || 0,
    attackSpeed: heroDef.baseStats.attackSpeed || 1.0,
    critChance: heroDef.baseStats.critChance || 0,
    critDamage: heroDef.baseStats.critDamage || 1.5,
    healPower: heroDef.baseStats.healPower || 0,
    maxMana: heroDef.baseStats.maxMana || 0,
    manaRegen: heroDef.baseStats.manaRegen || 0,
    hpRegen: heroDef.baseStats.hpRegen || 0,
    maxEnergyShield: 0,
    energyShieldRechargeRate: 0,
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS,
  };

  stats.maxHp = Math.floor(stats.maxHp * (1 + (heroState.level - 1) * 0.1));
  stats.damage = stats.damage * (1 + (heroState.level - 1) * 0.1);
  stats.defense = Math.floor(stats.defense * (1 + (heroState.level - 1) * 0.05));
  if (stats.healPower) stats.healPower = stats.healPower * (1 + (heroState.level - 1) * 0.1);
  if (stats.maxMana) stats.maxMana = Math.floor(stats.maxMana * (1 + (heroState.level - 1) * 0.08));
  if (stats.manaRegen) stats.manaRegen = stats.manaRegen * (1 + (heroState.level - 1) * 0.05);
  if (stats.hpRegen) stats.hpRegen = stats.hpRegen * (1 + (heroState.level - 1) * 0.05);

  const mageTowerBuilt = gameState.buildings.some(b => b.id === 'MAGE_TOWER' && b.level > 0);

  if (mageTowerBuilt) {
    stats.maxEnergyShield = heroDef.baseStats.maxEnergyShield || 0;
    stats.energyShieldRechargeRate = heroDef.baseStats.energyShieldRechargeRate || DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK;
    stats.energyShieldRechargeDelay = heroDef.baseStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
    if (stats.maxEnergyShield) stats.maxEnergyShield = Math.floor(stats.maxEnergyShield * (1 + (heroState.level - 1) * 0.12));
    if (stats.energyShieldRechargeRate) stats.energyShieldRechargeRate = stats.energyShieldRechargeRate * (1 + (heroState.level - 1) * 0.03);
  }

  // Accumulate all flat bonuses
  if (skillTree) {
    Object.entries(heroState.skillLevels).forEach(([skillId, skillLevel]) => {
      const skillDef = skillTree.nodes.find(s => s.id === skillId);
      if (skillDef?.statBonuses && skillLevel > 0) {
        const bonuses = skillDef.statBonuses(skillLevel);
        (Object.keys(bonuses) as Array<keyof HeroStats>).forEach(statKey => {
          if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
            if (mageTowerBuilt) stats[statKey] = (stats[statKey] || 0) + (bonuses[statKey] || 0);
          } else {
            stats[statKey] = (stats[statKey] || 0) + (bonuses[statKey] || 0);
          }
        });
      }
    });
  }

  Object.entries(gameState.townHallUpgradeLevels).forEach(([upgradeId, level]) => {
    if (level > 0) {
      const upgradeDef = townHallUpgradeDefinitions[upgradeId];
      if (upgradeDef) {
        upgradeDef.effects.forEach(effectDef => {
          if (effectDef.stat && !effectDef.globalEffectTarget && effectDef.effectParams.type === TownHallUpgradeEffectType.Additive) {
            const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
            const statKey = effectDef.stat;
            if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
                if (mageTowerBuilt) (stats[statKey] as number) = (stats[statKey] || 0) + effectValue;
            } else {
                (stats[statKey] as number) = (stats[statKey] || 0) + effectValue;
            }
          }
        });
      }
    }
  });

  if (heroState.equipmentLevels) {
    Object.entries(heroState.equipmentLevels).forEach(([equipmentId, equipmentLevel]) => {
      if (equipmentLevel > 0) {
        const equipDef = equipmentDefinitions[equipmentId];
        if (equipDef && equipDef.heroDefinitionId === heroDef.id) {
          for (let i = 1; i <= equipmentLevel; i++) {
            const levelBonuses = equipDef.statBonusesPerLevel(i);
            (Object.keys(levelBonuses) as Array<keyof HeroStats>).forEach(statKey => {
              if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
                if (mageTowerBuilt) stats[statKey] = (stats[statKey] || 0) + (levelBonuses[statKey] || 0);
              } else {
                stats[statKey] = (stats[statKey] || 0) + (levelBonuses[statKey] || 0);
              }
            });
          }
        }
      }
    });
  }

  if (heroState.permanentBuffs) {
    heroState.permanentBuffs.forEach(buff => {
        if (stats[buff.stat] !== undefined) {
            if (buff.stat === 'maxEnergyShield' || buff.stat === 'energyShieldRechargeRate' || buff.stat === 'energyShieldRechargeDelay') {
                if (mageTowerBuilt) (stats[buff.stat] as number) += buff.value;
            } else {
                (stats[buff.stat] as number) += buff.value;
            }
        }
    });
  }

  if (heroState.ownedShards) {
    heroState.ownedShards.forEach(shardInstance => {
      const shardDef = shardDefinitions[shardInstance.definitionId];
      if (shardDef && stats[shardDef.statAffected] !== undefined) {
        const shardValue = getShardDisplayValueUtil(shardDef, shardInstance.level);
        if (shardDef.statAffected === 'maxEnergyShield' || shardDef.statAffected === 'energyShieldRechargeRate' || shardDef.statAffected === 'energyShieldRechargeDelay') {
            if (mageTowerBuilt) (stats[shardDef.statAffected] as number) += shardValue;
        } else {
            (stats[shardDef.statAffected] as number) += shardValue;
        }
      }
    });
  }

  // Apply flat bonuses from Aetheric Resonance
  (Object.keys(gameState.aethericResonanceBonuses) as Array<keyof HeroStats>).forEach(statKey => {
    if (stats[statKey] !== undefined) {
      const resonanceBonus = gameState.aethericResonanceBonuses[statKey];
      if (resonanceBonus) {
        if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
            if (mageTowerBuilt) (stats[statKey] as number) += resonanceBonus.flat || 0;
        } else {
            (stats[statKey] as number) += resonanceBonus.flat || 0;
        }
      }
    }
  });

  // Now apply all percentage bonuses based on the sum of flat bonuses
  // Global bonuses (like TH global damage%, HP%)
  if (stats.damage !== undefined && globalBonuses.heroDamageBonus > 0) stats.damage *= (1 + globalBonuses.heroDamageBonus);
  if (stats.maxHp !== undefined && globalBonuses.heroHpBonus > 0) stats.maxHp *= (1 + globalBonuses.heroHpBonus);
  if (stats.maxMana !== undefined && globalBonuses.heroManaBonus > 0) stats.maxMana *= (1 + globalBonuses.heroManaBonus);
  if (stats.manaRegen !== undefined && globalBonuses.heroManaRegenBonus > 0) stats.manaRegen *= (1 + globalBonuses.heroManaRegenBonus);

  if (mageTowerBuilt) {
    if (stats.maxEnergyShield && globalBonuses.allHeroMaxEnergyShieldBonus > 0) stats.maxEnergyShield *= (1 + globalBonuses.allHeroMaxEnergyShieldBonus);
    if (stats.energyShieldRechargeRate && globalBonuses.allHeroEnergyShieldRechargeRateBonus > 0) stats.energyShieldRechargeRate *= (1 + globalBonuses.allHeroEnergyShieldRechargeRateBonus);
    if (stats.energyShieldRechargeDelay && globalBonuses.allHeroEnergyShieldRechargeDelayReduction > 0) {
         stats.energyShieldRechargeDelay = Math.max(0, stats.energyShieldRechargeDelay * (1 - globalBonuses.allHeroEnergyShieldRechargeDelayReduction));
    }
  }

  // Town Hall Percentage Bonuses (Stat Specific)
  Object.entries(gameState.townHallUpgradeLevels).forEach(([upgradeId, level]) => {
    if (level > 0) {
      const upgradeDef = townHallUpgradeDefinitions[upgradeId];
      if (upgradeDef) {
        upgradeDef.effects.forEach(effectDef => {
          if (effectDef.stat && !effectDef.globalEffectTarget && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) {
            const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
            const statKey = effectDef.stat;
            if (stats[statKey] !== undefined) {
                if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
                    if (mageTowerBuilt) (stats[statKey] as number) *= (1 + effectValue);
                } else {
                    (stats[statKey] as number) *= (1 + effectValue);
                }
            }
          }
        });
      }
    }
  });

  // Guild Hall Percentage Bonuses (Class Specific)
  Object.entries(gameState.guildHallUpgradeLevels).forEach(([upgradeId, level]) => {
    if (level > 0) {
        const ghUpgradeDef = guildHallUpgradeDefinitions[upgradeId];
        if (ghUpgradeDef) {
            ghUpgradeDef.effects.forEach(effectDef => {
                if (effectDef.stat && effectDef.heroClassTarget === heroDef.id && effectDef.effectParams.type === TownHallUpgradeEffectType.PercentageBonus) {
                    const effectValue = getTownHallUpgradeEffectValue(effectDef, level);
                    if (stats[effectDef.stat!] !== undefined) {
                        if (effectDef.stat === 'maxEnergyShield' || effectDef.stat === 'energyShieldRechargeRate' || effectDef.stat === 'energyShieldRechargeDelay') {
                            if (mageTowerBuilt) (stats[effectDef.stat!] as number) *= (1 + effectValue);
                        } else {
                            (stats[effectDef.stat!] as number) *= (1 + effectValue);
                        }
                    }
                }
            });
        }
    }
  });

  // Shared Passive Skills - Percentage Contributions
  Object.entries(gameState.playerSharedSkills).forEach(([skillId, progress]) => {
    if (progress.currentMajorLevel > 0) {
        const skillDef = SHARED_SKILL_DEFINITIONS[skillId];
        if (skillDef && skillDef.effects) {
            skillDef.effects.forEach(effect => {
                 if (stats.hasOwnProperty(effect.stat) && effect.isPercentage) {
                    let percentBonusFromThisSharedSkill = 0;
                    for (let i = 0; i < progress.currentMajorLevel; i++) {
                        const majorValue = effect.baseValuePerMajorLevel[i];
                         if (typeof majorValue === 'number') percentBonusFromThisSharedSkill += majorValue;
                         else if (majorValue) percentBonusFromThisSharedSkill += majorValue.percent || 0;
                       if (i < progress.currentMajorLevel -1) {
                          const minorValue = effect.minorValuePerMinorLevel[i];
                          const numMinors = skillDef.minorLevelsPerMajorTier[i] || 0;
                          if (typeof minorValue === 'number') percentBonusFromThisSharedSkill += minorValue * numMinors;
                          else if (minorValue) percentBonusFromThisSharedSkill += (minorValue.percent || 0) * numMinors;
                      }
                    }
                    if (progress.currentMajorLevel > 0 && progress.currentMinorLevel > 0) {
                        const minorValueCurrentTier = effect.minorValuePerMinorLevel[progress.currentMajorLevel - 1];
                        if (typeof minorValueCurrentTier === 'number') percentBonusFromThisSharedSkill += minorValueCurrentTier * progress.currentMinorLevel;
                        else if (minorValueCurrentTier) percentBonusFromThisSharedSkill += (minorValueCurrentTier.percent || 0) * progress.currentMinorLevel;
                    }
                    if (percentBonusFromThisSharedSkill !== 0) {
                        const statKey = effect.stat as keyof HeroStats;
                        if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
                            if (mageTowerBuilt) (stats[statKey] as number) *= (1 + percentBonusFromThisSharedSkill);
                        } else {
                            (stats[statKey] as number) *= (1 + percentBonusFromThisSharedSkill);
                        }
                    }
                }
            });
        }
    }
  });

  // Apply percentage bonuses from Aetheric Resonance
  (Object.keys(gameState.aethericResonanceBonuses) as Array<keyof HeroStats>).forEach(statKey => {
    if (stats[statKey] !== undefined) {
      const resonanceBonus = gameState.aethericResonanceBonuses[statKey];
      if (resonanceBonus && resonanceBonus.percentage) {
        if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') {
            if (mageTowerBuilt) (stats[statKey] as number) *= (1 + resonanceBonus.percentage);
        } else {
            (stats[statKey] as number) *= (1 + resonanceBonus.percentage);
        }
      }
    }
  });

  // Dungeon Run Buffs
  if (gameState.activeDungeonRun && gameState.activeDungeonRun.activeRunBuffs.length > 0 && runBuffDefinitions) {
    gameState.activeDungeonRun.activeRunBuffs.forEach(activeBuff => {
        const buffDef = runBuffDefinitions[activeBuff.definitionId];
        if (buffDef) {
            const libraryLevel = gameState.runBuffLibraryLevels?.[buffDef.id] || 0;
            let allEffectsForThisBuff: RunBuffEffect[] = [];
            buffDef.effects.forEach(effect => allEffectsForThisBuff.push({ ...effect, value: effect.value * activeBuff.stacks }));
            if (buffDef.libraryEffectsPerUpgradeLevel && libraryLevel > 0) {
                 const additionalEffects = buffDef.libraryEffectsPerUpgradeLevel(libraryLevel);
                 if (additionalEffects) additionalEffects.forEach(effect => allEffectsForThisBuff.push({ ...effect, value: effect.value * activeBuff.stacks }));
            }
            allEffectsForThisBuff.forEach(effect => {
                if (effect.stat && stats[effect.stat] !== undefined) {
                    if (effect.stat === 'maxEnergyShield' || effect.stat === 'energyShieldRechargeRate' || effect.stat === 'energyShieldRechargeDelay') if (!mageTowerBuilt) return;
                    if (effect.type === 'FLAT') (stats[effect.stat] as number) += effect.value;
                    else if (effect.type === 'PERCENTAGE_ADDITIVE') (stats[effect.stat] as number) *= (1 + effect.value);
                    // PERCENTAGE_MULTIPLICATIVE would be applied differently if used
                }
            });
        }
    });
  }

  // Demonicon Milestone Bonuses (Percentage applied after other percentages)
  if (isDemoniconBattle && achievedDemoniconMilestoneRewards && achievedDemoniconMilestoneRewards.length > 0) {
    achievedDemoniconMilestoneRewards.forEach(rewardId => {
      Object.values(DEMONICON_MILESTONE_REWARDS).flat().forEach(milestoneDef => {
        if (milestoneDef.id === rewardId) {
          milestoneDef.rewards.forEach(rewardEffect => {
            if (rewardEffect.type === 'GLOBAL_STAT_MODIFIER' && rewardEffect.isPercentage && stats[rewardEffect.stat] !== undefined) {
              if (rewardEffect.stat === 'maxEnergyShield' || rewardEffect.stat === 'energyShieldRechargeRate' || rewardEffect.stat === 'energyShieldRechargeDelay') {
                if (mageTowerBuilt) (stats[rewardEffect.stat] as number) *= (1 + rewardEffect.value);
              } else {
                (stats[rewardEffect.stat] as number) *= (1 + rewardEffect.value);
              }
            }
            // Note: Flat Demonicon bonuses would need to be applied earlier or managed carefully.
          });
        }
      });
    });
  }

  // Active Status Effects (Buffs/Debuffs)
  if ('statusEffects' in heroState && heroState.statusEffects && statusEffectDefinitionsParam) {
    (heroState as BattleHero).statusEffects.forEach(activeEffect => {
        const effectDefinition = activeEffect.definitionId ? statusEffectDefinitionsParam[activeEffect.definitionId] : activeEffect;
        if (effectDefinition && effectDefinition.statAffected && effectDefinition.value !== undefined &&
            (effectDefinition.type === StatusEffectType.BUFF || effectDefinition.type === StatusEffectType.DEBUFF)) {
            const statKey = effectDefinition.statAffected;
            if (stats[statKey] !== undefined) {
                if (statKey === 'maxEnergyShield' || statKey === 'energyShieldRechargeRate' || statKey === 'energyShieldRechargeDelay') if (!mageTowerBuilt) return;
                if (effectDefinition.modifierType === 'FLAT') (stats[statKey] as number) += effectDefinition.value;
                else if (effectDefinition.modifierType === 'PERCENTAGE_ADDITIVE') (stats[statKey] as number) *= (1 + effectDefinition.value);
            }
        }
    });
  }

  // Temporary Potion Buffs
  if ('temporaryBuffs' in heroState) {
    const battleHero = heroState as BattleHero;
    if (battleHero.temporaryBuffs) {
      battleHero.temporaryBuffs.forEach(buff => {
        if (buff.effectType === 'TEMPORARY_STAT_MODIFIER' && buff.stat) {
          const statKey = buff.stat;
          if (stats[statKey] !== undefined) {
            if (buff.stat === 'maxEnergyShield' || buff.stat === 'energyShieldRechargeRate' || buff.stat === 'energyShieldRechargeDelay') if (!mageTowerBuilt) return;
            if (buff.modifierType === 'FLAT') (stats[statKey] as number) += buff.value;
            else if (buff.modifierType === 'PERCENTAGE') (stats[statKey] as number) *= (1 + buff.value);
          }
        }
      });
    }
  }

  if (!mageTowerBuilt) {
    stats.maxEnergyShield = 0;
    stats.energyShieldRechargeRate = 0;
    stats.energyShieldRechargeDelay = 0;
  }

  // Final formatting and clamping
  stats.maxHp = Math.max(1, Math.floor(stats.maxHp));
  stats.damage = Math.max(0, parseFloat(stats.damage.toFixed(1)));
  stats.defense = Math.max(0, Math.floor(stats.defense));
  stats.attackSpeed = Math.max(0.1, parseFloat(stats.attackSpeed.toFixed(2))); // Ensure min attack speed
  stats.critChance = Math.max(0, Math.min(1, Number(stats.critChance?.toFixed(4)) || 0));
  stats.critDamage = Math.max(1, Number(stats.critDamage?.toFixed(2)) || 1.5);
  stats.healPower = Math.max(0, parseFloat((stats.healPower || 0).toFixed(1)));
  stats.maxMana = Math.max(0, Math.floor(stats.maxMana || 0));
  stats.manaRegen = parseFloat((stats.manaRegen || 0).toFixed(2));
  stats.hpRegen = parseFloat((stats.hpRegen || 0).toFixed(2));
  stats.maxEnergyShield = Math.max(0, Math.floor(stats.maxEnergyShield));
  stats.energyShieldRechargeRate = Math.max(0, parseFloat(stats.energyShieldRechargeRate.toFixed(2)));
  stats.energyShieldRechargeDelay = Math.max(0, Math.floor(stats.energyShieldRechargeDelay));

  return stats;
};
