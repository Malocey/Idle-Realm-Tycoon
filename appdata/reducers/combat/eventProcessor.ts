
import { BattleHero, BattleEnemy, AttackEvent, GameState, GlobalBonuses, TemporaryBuff, BossPhaseAbilityType, StatusEffect, StatusEffectType, AbilityEffect, AbilityEffectTriggerType, EnemyChannelingAbilityDefinition } from '../../types';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS } 
from '../../gameData/index'; 
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, GAME_TICK_MS } from '../../constants';
import { calculateWaveEnemyStats, calculateSpecialAttackData } from '../../utils'; 

// Hilfsfunktion, um Stats für Boss-Phasen-Buffs neu zu berechnen
const recalculateBossStatsWithPhaseBuff = (boss: BattleEnemy, phaseBuff: TemporaryBuff): BattleEnemy => {
    let updatedBoss = { ...boss };
    if (phaseBuff.stat && phaseBuff.modifierType && updatedBoss.calculatedStats[phaseBuff.stat] !== undefined) {
        if (phaseBuff.modifierType === 'FLAT') {
            (updatedBoss.calculatedStats[phaseBuff.stat] as number) += phaseBuff.value;
        } else if (phaseBuff.modifierType === 'PERCENTAGE') {
            (updatedBoss.calculatedStats[phaseBuff.stat] as number) *= (1 + phaseBuff.value);
        }
        if (phaseBuff.stat === 'maxHp') {
            updatedBoss.currentHp = Math.min(updatedBoss.currentHp, updatedBoss.calculatedStats.maxHp);
        }
    }
    return updatedBoss;
};


export const applyAbilityEffects = (
  effects: AbilityEffect[] | undefined,
  caster: BattleHero | BattleEnemy,
  primaryTarget: BattleHero | BattleEnemy | null, 
  allHeroes: BattleHero[],
  allEnemies: BattleEnemy[],
  logMessages: string[],
  attackEvents: AttackEvent[],
  statusEffectsToApply: Array<{ targetId: string, effect: StatusEffect }>,
  newSummons: BattleEnemy[],
  triggerType: AbilityEffectTriggerType, 
  currentTick: number, 
  specialAttackNameForLog?: string 
): void => {
  if (!effects) return;

  effects.forEach(effect => {
    let actualTargets: (BattleHero | BattleEnemy)[] = [];
    switch (effect.targetScope) {
      case 'SELF':
        actualTargets.push(caster);
        break;
      case 'CURRENT_TARGET':
        if (primaryTarget) actualTargets.push(primaryTarget);
        break;
      case 'ALL_ENEMIES': 
        if ('definitionId' in caster) { 
          actualTargets.push(...allEnemies.filter(e => e.currentHp > 0 && !e.isDying));
        } else { 
          actualTargets.push(...allHeroes.filter(h => h.currentHp > 0));
        }
        break;
      case 'ALL_ALLIES': 
        if ('definitionId' in caster) { 
          actualTargets.push(...allHeroes.filter(h => h.currentHp > 0));
        } else { 
          actualTargets.push(...allEnemies.filter(e => e.currentHp > 0 && !e.isDying && e.uniqueBattleId !== caster.uniqueBattleId));
        }
        break;
    }
    
    const logAbilityName = specialAttackNameForLog || caster.channelingState?.abilityId || 'Ability';

    actualTargets.forEach(currentTarget => {
      switch (effect.type) {
        case 'DAMAGE':
          if ('loot' in currentTarget) { 
            const enemyTarget = currentTarget as BattleEnemy;
            let damageDealt = Math.max(1, Math.floor((caster.calculatedStats.damage * effect.damageMultiplier) - enemyTarget.calculatedStats.defense));
            attackEvents.push({ attackerId: caster.uniqueBattleId, targetId: enemyTarget.uniqueBattleId, damage: damageDealt, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: `${logAbilityName}` });
            logMessages.push(`${caster.name}'s ${logAbilityName} hits ${enemyTarget.name} for ${damageDealt} damage.`);
          } else if ('definitionId' in currentTarget) { 
            const heroTarget = currentTarget as BattleHero;
            let damageDealt = Math.max(1, Math.floor((caster.calculatedStats.damage * effect.damageMultiplier) - heroTarget.calculatedStats.defense));
            attackEvents.push({ attackerId: caster.uniqueBattleId, targetId: heroTarget.uniqueBattleId, damage: damageDealt, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: `${logAbilityName}` });
            logMessages.push(`${caster.name}'s ${logAbilityName} hits ${heroTarget.name} for ${damageDealt} damage.`);
          }
          break;
        case 'HEAL':
            const healTargetIsHero = 'definitionId' in currentTarget;
            const healTargetIsEnemy = 'loot' in currentTarget; 

            if (healTargetIsHero || healTargetIsEnemy) {
                const targetParticipant = currentTarget as BattleHero | BattleEnemy;
                let totalHealAmount = 0;
                let totalShieldRecovery = 0;

                if (effect.healAmount) totalHealAmount += effect.healAmount;
                if (effect.healMultiplier) totalHealAmount += (caster.calculatedStats.healPower || 0) * effect.healMultiplier;
                
                if (effect.shieldHealPercentage && targetParticipant.calculatedStats.maxEnergyShield && targetParticipant.calculatedStats.maxEnergyShield > 0) {
                    totalShieldRecovery = Math.floor(targetParticipant.calculatedStats.maxEnergyShield * effect.shieldHealPercentage);
                }

                if (totalHealAmount > 0) {
                    attackEvents.push({ attackerId: caster.uniqueBattleId, targetId: targetParticipant.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: `${logAbilityName}`, isHeal: true, healAmount: totalHealAmount });
                    logMessages.push(`${caster.name}'s ${logAbilityName} heals ${targetParticipant.name} for ${totalHealAmount} HP.`);
                }
                if (totalShieldRecovery > 0) {
                     attackEvents.push({ 
                        attackerId: caster.uniqueBattleId, targetId: targetParticipant.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), 
                        isSpecialAttack: true, specialAttackName: `${logAbilityName} (Shield)`, 
                        isHeal: true, healAmount: 0, 
                        shieldHealAmount: totalShieldRecovery 
                    });
                    logMessages.push(`${caster.name}'s ${logAbilityName} recovers ${totalShieldRecovery} Shield for ${targetParticipant.name}.`);
                }
            }
            break;
        case 'APPLY_STATUS':
            if (Math.random() < (effect.chance || 1.0)) {
                const effectDefSource = effect.statusEffectId ? STATUS_EFFECT_DEFINITIONS[effect.statusEffectId] : effect.inlineStatusEffect;
                if (effectDefSource) {
                    const newEffectInstance: StatusEffect = {
                        instanceId: `ability-${caster.uniqueBattleId}-${currentTarget.uniqueBattleId}-${effectDefSource.name.replace(/\s/g, '')}-${Date.now()}`,
                        definitionId: effect.statusEffectId,
                        type: effectDefSource.type,
                        name: effectDefSource.name,
                        iconName: effectDefSource.iconName,
                        remainingDurationMs: effectDefSource.durationMs,
                        sourceId: caster.uniqueBattleId,
                        appliedAtTick: currentTick,
                        statAffected: effectDefSource.statAffected,
                        modifierType: effectDefSource.modifierType,
                        value: effectDefSource.value,
                        damagePerTick: effectDefSource.damagePerTick,
                        tickIntervalMs: effectDefSource.tickIntervalMs,
                        timeUntilNextDotTickMs: effectDefSource.type === StatusEffectType.DOT && effectDefSource.tickIntervalMs ? effectDefSource.tickIntervalMs : undefined,
                    };
                    statusEffectsToApply.push({ targetId: currentTarget.uniqueBattleId, effect: newEffectInstance });
                    logMessages.push(`${caster.name}'s ${logAbilityName} applies ${newEffectInstance.name} to ${currentTarget.name}.`);
                }
            }
          break;
        case 'SUMMON':
            const enemyDefToSummon = ENEMY_DEFINITIONS[effect.enemyIdToSummon];
            if (enemyDefToSummon) {
                for (let i = 0; i < effect.count; i++) {
                    const summonedStats = calculateWaveEnemyStats(enemyDefToSummon, 1, effect.isElite); 
                    const newSummon: BattleEnemy = {
                        ...enemyDefToSummon,
                        attackType: enemyDefToSummon.attackType || 'MELEE',
                        rangedAttackRangeUnits: enemyDefToSummon.rangedAttackRangeUnits,
                        calculatedStats: summonedStats,
                        uniqueBattleId: `${effect.enemyIdToSummon}_summoned_${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`,
                        currentHp: summonedStats.maxHp,
                        currentEnergyShield: summonedStats.maxEnergyShield || 0,
                        shieldRechargeDelayTicksRemaining: 0,
                        attackCooldown: (1000 / summonedStats.attackSpeed),
                        attackCooldownRemainingTicks: 0,
                        movementSpeed: 0, x: 0, y: 0, 
                        statusEffects: [],
                        isElite: effect.isElite,
                        specialAttackCooldownsRemaining: {},
                    };
                     if (enemyDefToSummon.channelingAbilities && enemyDefToSummon.channelingAbilities.length > 0) {
                        enemyDefToSummon.channelingAbilities.forEach((caDef: EnemyChannelingAbilityDefinition) => {
                            if(newSummon.specialAttackCooldownsRemaining) {
                               newSummon.specialAttackCooldownsRemaining[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                            }
                        });
                    }
                    newSummons.push(newSummon);
                }
                logMessages.push(`${caster.name} summons ${effect.count} ${enemyDefToSummon.name}(s)!`);
            }
            break;
        case 'TRIGGER_CHANNELING_ABILITY':
            if ('definitionId' in caster) { // Hero caster
                const specialAttackDef = SPECIAL_ATTACK_DEFINITIONS[effect.abilityIdToTrigger];
                if (specialAttackDef && specialAttackDef.channelingProperties) {
                    (caster as BattleHero).channelingState = {
                        abilityId: effect.abilityIdToTrigger,
                        sourceParticipantId: caster.uniqueBattleId,
                        totalDurationMs: specialAttackDef.channelingProperties.channelDurationMs,
                        progressMs: 0,
                        channelTickProgressMs: 0,
                        isMovementBlocked: specialAttackDef.channelingProperties.blocksMovementWhileChanneling ?? true,
                        areActionsBlocked: specialAttackDef.channelingProperties.blocksActionsWhileChanneling ?? true,
                    };
                    logMessages.push(`${caster.name} begins channeling ${specialAttackDef.name}!`);
                }
            } else { // Enemy caster
                const enemyCaster = caster as BattleEnemy;
                const enemyDef = ENEMY_DEFINITIONS[enemyCaster.id];
                const enemyChannelingAbilityDef = enemyDef?.channelingAbilities?.find(ca => ca.id === effect.abilityIdToTrigger);
                if (enemyChannelingAbilityDef) {
                    enemyCaster.channelingState = {
                        abilityId: effect.abilityIdToTrigger,
                        sourceParticipantId: enemyCaster.uniqueBattleId,
                        totalDurationMs: enemyChannelingAbilityDef.channelingProperties.channelDurationMs,
                        progressMs: 0,
                        channelTickProgressMs: 0,
                        isMovementBlocked: enemyChannelingAbilityDef.channelingProperties.blocksMovementWhileChanneling ?? true,
                        areActionsBlocked: enemyChannelingAbilityDef.channelingProperties.blocksActionsWhileChanneling ?? true,
                    };
                    // Ensure the triggered ability can start immediately
                    if (!enemyCaster.specialAttackCooldownsRemaining) {
                        enemyCaster.specialAttackCooldownsRemaining = {};
                    }
                    enemyCaster.specialAttackCooldownsRemaining[effect.abilityIdToTrigger] = 0;
                    logMessages.push(`${enemyCaster.name} begins channeling ${enemyChannelingAbilityDef.name}!`);
                }
            }
            break;
      }
    });
  });
};


export const processAttackEvents = (
  attackEvents: AttackEvent[],
  currentHeroes: BattleHero[],
  currentEnemies: BattleEnemy[],
  gameState: GameState, 
  globalBonuses: GlobalBonuses
): { updatedHeroes: BattleHero[], updatedEnemies: BattleEnemy[], logMessages: string[], newSummonsFromPhase?: BattleEnemy[] } => {
  let updatedHeroes = [...currentHeroes];
  let updatedEnemies = [...currentEnemies];
  const logMessages: string[] = [];
  const newSummonsFromPhase: BattleEnemy[] = [];

  attackEvents.forEach(event => {
    const heroTargetIndex = updatedHeroes.findIndex(h => h.uniqueBattleId === event.targetId);
    if (heroTargetIndex !== -1) {
      const heroToUpdate = { ...updatedHeroes[heroTargetIndex] };
      if (event.isHeal && event.healAmount) {
        const newHp = Math.min(heroToUpdate.calculatedStats.maxHp, heroToUpdate.currentHp + event.healAmount);
        if (newHp > heroToUpdate.currentHp) {
          heroToUpdate.currentHp = newHp;
        }
      } else if (event.isHeal && event.shieldHealAmount) { 
        if (heroToUpdate.currentEnergyShield !== undefined && heroToUpdate.calculatedStats.maxEnergyShield !== undefined) {
            heroToUpdate.currentEnergyShield = Math.min(
                heroToUpdate.calculatedStats.maxEnergyShield,
                heroToUpdate.currentEnergyShield + event.shieldHealAmount
            );
        }
      } else {
        let damageToApply = event.damage;
        if (gameState.godModeActive && 
            gameState.actionBattleState && 
            gameState.actionBattleState.controlledHeroId === heroToUpdate.uniqueBattleId &&
            currentEnemies.some(e => e.uniqueBattleId === event.attackerId)) {
            damageToApply = 0;
        }

        let shieldAbsorbed = 0;
        if (heroToUpdate.currentEnergyShield && heroToUpdate.currentEnergyShield > 0) {
          shieldAbsorbed = Math.min(heroToUpdate.currentEnergyShield, damageToApply);
          heroToUpdate.currentEnergyShield -= shieldAbsorbed;
          damageToApply -= shieldAbsorbed;
          event.shieldDamage = shieldAbsorbed; 
        }
        
        if (shieldAbsorbed > 0 || damageToApply > 0) { 
            heroToUpdate.shieldRechargeDelayTicksRemaining = heroToUpdate.calculatedStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
        }

        if (damageToApply > 0) {
          heroToUpdate.currentHp = Math.max(0, heroToUpdate.currentHp - damageToApply);
        }
        
        if (heroToUpdate.currentHp <= 0 && updatedHeroes[heroTargetIndex].currentHp > 0) {
          logMessages.push(`${heroToUpdate.name} has been defeated!`);
        }
      }
      updatedHeroes[heroTargetIndex] = heroToUpdate;
    } else {
      const enemyTargetIndex = updatedEnemies.findIndex(e => e.uniqueBattleId === event.targetId);
      if (enemyTargetIndex !== -1 && updatedEnemies[enemyTargetIndex].currentHp > 0) {
        let enemyToUpdate = { ...updatedEnemies[enemyTargetIndex] }; 
         if (event.isHeal && event.healAmount) {
            const newHp = Math.min(enemyToUpdate.calculatedStats.maxHp, enemyToUpdate.currentHp + event.healAmount);
            if (newHp > enemyToUpdate.currentHp) {
                enemyToUpdate.currentHp = newHp;
            }
        } else if (event.isHeal && event.shieldHealAmount) { 
            if (enemyToUpdate.currentEnergyShield !== undefined && enemyToUpdate.calculatedStats.maxEnergyShield !== undefined) {
                enemyToUpdate.currentEnergyShield = Math.min(
                    enemyToUpdate.calculatedStats.maxEnergyShield,
                    enemyToUpdate.currentEnergyShield + event.shieldHealAmount
                );
            }
        } else {
            let damageToApplyToEnemy = event.damage;
            let shieldDamageDealtToEnemy = 0;

            if (enemyToUpdate.currentEnergyShield && enemyToUpdate.currentEnergyShield > 0) {
                shieldDamageDealtToEnemy = Math.min(enemyToUpdate.currentEnergyShield, damageToApplyToEnemy);
                enemyToUpdate.currentEnergyShield -= shieldDamageDealtToEnemy;
                damageToApplyToEnemy -= shieldDamageDealtToEnemy;
                event.shieldDamage = shieldDamageDealtToEnemy;
            }

            if (shieldDamageDealtToEnemy > 0 || damageToApplyToEnemy > 0) {
                enemyToUpdate.shieldRechargeDelayTicksRemaining = enemyToUpdate.calculatedStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
            }
            
            if (damageToApplyToEnemy > 0) {
                enemyToUpdate.currentHp = Math.max(0, enemyToUpdate.currentHp - damageToApplyToEnemy);
            }
        }
        
        const enemyDef = ENEMY_DEFINITIONS[enemyToUpdate.id];
        if (enemyDef && enemyDef.phases && enemyDef.phases.length > 0) {
          const currentHpPercentage = enemyToUpdate.currentHp / enemyToUpdate.calculatedStats.maxHp;
          const currentBattlePhaseIndex = enemyToUpdate.currentPhaseIndex || 0;

          for (let i = 0; i < enemyDef.phases.length; i++) {
            const phase = enemyDef.phases[i];
            const battlePhaseState = enemyToUpdate.phases ? enemyToUpdate.phases[i] : undefined;
            
            if (currentHpPercentage <= phase.hpThreshold && (!battlePhaseState || !battlePhaseState.oneTimeEffectsApplied)) {
              if (i >= currentBattlePhaseIndex) { 
                logMessages.push(`${enemyToUpdate.name} enters phase: ${phase.name || `Phase ${i + 1}`}! (HP: ${currentHpPercentage.toFixed(2)} <= Threshold: ${phase.hpThreshold})`);
                enemyToUpdate.currentPhaseIndex = i + 1; 

                if (!enemyToUpdate.phases) enemyToUpdate.phases = JSON.parse(JSON.stringify(enemyDef.phases)); 
                enemyToUpdate.phases![i].oneTimeEffectsApplied = true;

                phase.abilities.forEach(ability => {
                  switch (ability.type) {
                    case BossPhaseAbilityType.SELF_HEAL:
                      if (ability.value) {
                        const healAmount = ability.value;
                        enemyToUpdate.currentHp = Math.min(enemyToUpdate.calculatedStats.maxHp, enemyToUpdate.currentHp + healAmount);
                        logMessages.push(`  ↳ ${enemyToUpdate.name} heals for ${healAmount} HP!`);
                      }
                      break;
                    case BossPhaseAbilityType.SHIELD_BOOST:
                       if (ability.value && enemyToUpdate.calculatedStats.maxEnergyShield !== undefined) { 
                           const shieldBoostAmount = ability.value;
                           enemyToUpdate.currentEnergyShield = (enemyToUpdate.currentEnergyShield || 0) + shieldBoostAmount;
                           if(enemyToUpdate.currentEnergyShield > enemyToUpdate.calculatedStats.maxEnergyShield) {
                               enemyToUpdate.currentEnergyShield = enemyToUpdate.calculatedStats.maxEnergyShield;
                           }
                           logMessages.push(`  ↳ ${enemyToUpdate.name}'s shield strengthens by ${shieldBoostAmount}!`);
                       }
                      break;
                    case BossPhaseAbilityType.STAT_BUFF:
                      if (ability.stat && ability.value !== undefined && ability.durationTicks) {
                        const tempBuff: TemporaryBuff = {
                          id: `phasebuff-${enemyToUpdate.uniqueBattleId}-${ability.stat}-${Date.now()}`,
                          potionId: `PHASE_BUFF_${i}`, 
                          effectType: 'TEMPORARY_STAT_MODIFIER', 
                          stat: ability.stat,
                          modifierType: 'PERCENTAGE', 
                          value: ability.value,
                          remainingDurationMs: ability.durationTicks * GAME_TICK_MS,
                          appliedAtTick: gameState.battleState?.ticksElapsed || 0,
                        };
                        if (!enemyToUpdate.temporaryBuffs) enemyToUpdate.temporaryBuffs = [];
                        enemyToUpdate.temporaryBuffs.push(tempBuff);
                        const statName = ability.stat.replace(/([A-Z])/g, ' $1').toLowerCase();
                        logMessages.push(`  ↳ ${enemyToUpdate.name} gains a buff to ${statName} (+${(ability.value * 100).toFixed(0)}%) for ${ability.durationTicks} ticks!`);
                      }
                      break;
                    case BossPhaseAbilityType.SUMMON_MINIONS:
                      if (ability.summonParams) {
                        const { enemyId, count, isElite } = ability.summonParams;
                        const summonedEnemyDef = ENEMY_DEFINITIONS[enemyId];
                        if (summonedEnemyDef) {
                          logMessages.push(`  ↳ ${enemyToUpdate.name} summons ${count} ${isElite ? 'Elite ' : ''}${summonedEnemyDef.name}(s)!`);
                          for (let j = 0; j < count; j++) {
                            const currentWaveForScaling = gameState.battleState?.waveNumber || 1; 
                            const summonedEnemyStats = calculateWaveEnemyStats(summonedEnemyDef, currentWaveForScaling, isElite);

                            const newSummon: BattleEnemy = {
                              ...summonedEnemyDef,
                              attackType: summonedEnemyDef.attackType || 'MELEE',
                              rangedAttackRangeUnits: summonedEnemyDef.rangedAttackRangeUnits,
                              calculatedStats: summonedEnemyStats,
                              uniqueBattleId: `${enemyId}_phaseSummon_${Date.now()}_${j}_${Math.random().toString(16).slice(2)}`,
                              currentHp: summonedEnemyStats.maxHp,
                              currentEnergyShield: summonedEnemyStats.maxEnergyShield || 0,
                              shieldRechargeDelayTicksRemaining: 0,
                              attackCooldown: (1000 / summonedEnemyStats.attackSpeed),
                              attackCooldownRemainingTicks: 0,
                              movementSpeed: 0, x: 0, y: 0, 
                              statusEffects: [],
                              isElite: isElite,
                              currentSummonCooldownMs: summonedEnemyDef.summonAbility?.initialCooldownMs ?? summonedEnemyDef.summonAbility?.cooldownMs,
                              currentHealCooldownMs: summonedEnemyDef.healAbility?.initialCooldownMs ?? summonedEnemyDef.healAbility?.cooldownMs,
                              currentAoeAttackCooldownMs: summonedEnemyDef.aoeAttackCooldownBaseMs,
                              explosionTimerRemainingMs: summonedEnemyDef.explosionAbility?.timerMs,
                              specialAttackCooldownsRemaining: {}, 
                            };
                            if (summonedEnemyDef.channelingAbilities) {
                                summonedEnemyDef.channelingAbilities.forEach(caDef => {
                                    if(newSummon.specialAttackCooldownsRemaining) {
                                        newSummon.specialAttackCooldownsRemaining[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                                    }
                                });
                            }
                            newSummonsFromPhase.push(newSummon);
                          }
                        } else {
                          logMessages.push(`  ↳ Error: Summon definition for '${enemyId}' not found.`);
                        }
                      }
                      break;
                  }
                });
                break; 
              }
            }
          }
        }
        updatedEnemies[enemyTargetIndex] = enemyToUpdate;
      }
    }
  });

  return { updatedHeroes, updatedEnemies, logMessages, newSummonsFromPhase };
};
    