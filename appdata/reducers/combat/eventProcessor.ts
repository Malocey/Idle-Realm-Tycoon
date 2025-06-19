import { BattleHero, BattleEnemy, AttackEvent, GameState, GlobalBonuses, TemporaryBuff, BossPhaseAbilityType, StatusEffect, StatusEffectType, AbilityEffectTriggerType, EnemyChannelingAbilityDefinition, AbilityEffect, HeroStats, DamagePopupInState, FusionAnchor, FeederParticle, BattleState } from '../../types';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, SKILL_TREES } from '../../gameData/index';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, GAME_TICK_MS } from '../../constants';
import { calculateWaveEnemyStats, calculateSpecialAttackData } from '../../utils';

// Helper function applyAbilityEffects is now defined within participantUpdater.ts and used from there.
// This eventProcessor focuses on direct damage/heal application and phase changes.

const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const processAttackEvents = (
  attackEvents: AttackEvent[],
  currentHeroes: BattleHero[],
  currentEnemies: BattleEnemy[],
  gameState: GameState,
  globalBonuses: GlobalBonuses
): {
    updatedHeroes: BattleHero[],
    updatedEnemies: BattleEnemy[],
    logMessages: string[],
    newSummonsFromPhase?: BattleEnemy[],
    statsRecalculationNeededForEnemyIds: string[],
    newPassiveAttackEvents: AttackEvent[],
    newDamagePopupsForCanvas: DamagePopupInState[], // For Heal/Shield popups
    updatedFusionAnchors: FusionAnchor[], // For aggregated HP damage anchors
    newFeederParticles: FeederParticle[], // For individual HP damage instances (NOW HANDLED BY TICK REDUCER)
    updatedBattleStats: BattleState['stats'], // Return updated live stats
} => {
  let updatedHeroes = [...currentHeroes];
  let updatedEnemies = [...currentEnemies];
  const logMessages: string[] = [];
  const newSummonsFromPhase: BattleEnemy[] = [];
  const statsRecalculationNeededForEnemyIds: string[] = [];
  const newPassiveAttackEvents: AttackEvent[] = [];
  const statusEffectsToApplyFromPassives: Array<{ targetId: string, effect: StatusEffect }> = [];
  const newDamagePopupsForCanvas: DamagePopupInState[] = [];
  let updatedFusionAnchors = [...(gameState.battleState?.fusionAnchors || [])];
  let newFeederParticlesForThisFunctionCall: FeederParticle[] = []; 
  let updatedBattleStats: BattleState['stats'] = gameState.battleState?.stats ? JSON.parse(JSON.stringify(gameState.battleState.stats)) : {};


  attackEvents.forEach(event => {
    // Initialize stats for attacker if not present
    if (!updatedBattleStats[event.attackerId]) {
      updatedBattleStats[event.attackerId] = { damageDealt: 0, healingDone: 0 };
    }

    const heroTargetIndex = updatedHeroes.findIndex(h => h.uniqueBattleId === event.targetId);
    if (heroTargetIndex !== -1) {
      const heroToUpdate = { ...updatedHeroes[heroTargetIndex] };
      if (event.isHeal && event.healAmount) {
        const newHp = Math.min(heroToUpdate.calculatedStats.maxHp, heroToUpdate.currentHp + event.healAmount);
        if (newHp > heroToUpdate.currentHp) {
          heroToUpdate.currentHp = newHp;
          newDamagePopupsForCanvas.push({
            id: `popup-${event.timestamp}-${generateUniqueId()}`,
            targetParticipantId: event.targetId,
            amount: event.healAmount,
            type: 'heal',
            timestamp: event.timestamp
          });
          updatedBattleStats[event.attackerId].healingDone += event.healAmount;
        }
      } else if (event.isHeal && event.shieldHealAmount) {
        if (heroToUpdate.currentEnergyShield !== undefined && heroToUpdate.calculatedStats.maxEnergyShield !== undefined) {
            const oldShield = heroToUpdate.currentEnergyShield;
            heroToUpdate.currentEnergyShield = Math.min(
                heroToUpdate.calculatedStats.maxEnergyShield,
                heroToUpdate.currentEnergyShield + event.shieldHealAmount
            );
            if (heroToUpdate.currentEnergyShield > oldShield) {
              newDamagePopupsForCanvas.push({
                id: `popup-${event.timestamp}-shield-${generateUniqueId()}`,
                targetParticipantId: event.targetId,
                amount: event.shieldHealAmount,
                type: 'shield',
                timestamp: event.timestamp
              });
              updatedBattleStats[event.attackerId].healingDone += event.shieldHealAmount; // Count shield healing as healing
            }
        }
      } else { // Is HP Damage
        let damageToApply = event.damage;
        if (gameState.godModeActive && currentEnemies.some(e => e.uniqueBattleId === event.attackerId)) {
            damageToApply = 0;
        }

        let shieldAbsorbed = 0;
        if (heroToUpdate.currentEnergyShield && heroToUpdate.currentEnergyShield > 0) {
          shieldAbsorbed = Math.min(heroToUpdate.currentEnergyShield, damageToApply);
          heroToUpdate.currentEnergyShield -= shieldAbsorbed;
          damageToApply -= shieldAbsorbed;
          if (shieldAbsorbed > 0) {
            newDamagePopupsForCanvas.push({ // Shield damage still uses old popup system
              id: `popup-${event.timestamp}-shield-${generateUniqueId()}`,
              targetParticipantId: event.targetId,
              amount: shieldAbsorbed,
              type: 'shield',
              timestamp: event.timestamp
            });
            updatedBattleStats[event.attackerId].damageDealt += shieldAbsorbed;
          }
        }

        if (shieldAbsorbed > 0 || damageToApply > 0) {
            heroToUpdate.shieldRechargeDelayTicksRemaining = heroToUpdate.calculatedStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
        }

        if (damageToApply > 0) {
          heroToUpdate.currentHp = Math.max(0, heroToUpdate.currentHp - damageToApply);
          updatedBattleStats[event.attackerId].damageDealt += damageToApply;
          
          const anchorIndex = updatedFusionAnchors.findIndex(a => a.targetParticipantId === event.targetId);
          if (anchorIndex !== -1) {
            const existingAnchor = { ...updatedFusionAnchors[anchorIndex] };
            existingAnchor.totalAmount += damageToApply;
            existingAnchor.lastUpdateTime = Date.now();
            if (event.isCrit) existingAnchor.lastCritTimestamp = Date.now(); // Update timestamp
            existingAnchor.feederQueue.push({ amount: damageToApply, isCritical: event.isCrit });
            updatedFusionAnchors[anchorIndex] = existingAnchor;
          } else {
            const newAnchor: FusionAnchor = {
              id: event.targetId,
              targetParticipantId: event.targetId,
              totalAmount: damageToApply,
              lastUpdateTime: Date.now(),
              lastCritTimestamp: event.isCrit ? Date.now() : 0, // Initialize timestamp
              anchorX: 20, 
              anchorY: -40, 
              xOffset: Math.random() * 40 - 20,
              feederQueue: [{ amount: damageToApply, isCritical: event.isCrit }],
              lastFeederSpawnTime: 0,
            };
            updatedFusionAnchors.push(newAnchor);
          }
        }

        if (heroToUpdate.currentHp <= 0 && updatedHeroes[heroTargetIndex].currentHp > 0) {
          logMessages.push(`${heroToUpdate.name} has been defeated!`);
        }
      }
      updatedHeroes[heroTargetIndex] = heroToUpdate;
    } else { // Target is an enemy
      const enemyTargetIndex = updatedEnemies.findIndex(e => e.uniqueBattleId === event.targetId);
      if (enemyTargetIndex !== -1 && updatedEnemies[enemyTargetIndex].currentHp > 0) {
        let enemyToUpdate = { ...updatedEnemies[enemyTargetIndex] };
         if (event.isHeal && event.healAmount) {
            const newHp = Math.min(enemyToUpdate.calculatedStats.maxHp, enemyToUpdate.currentHp + event.healAmount);
            if (newHp > enemyToUpdate.currentHp) {
                enemyToUpdate.currentHp = newHp;
                 newDamagePopupsForCanvas.push({ 
                    id: `popup-${event.timestamp}-${generateUniqueId()}`,
                    targetParticipantId: event.targetId,
                    amount: event.healAmount,
                    type: 'heal',
                    timestamp: event.timestamp
                  });
                updatedBattleStats[event.attackerId].healingDone += event.healAmount;
            }
        } else if (event.isHeal && event.shieldHealAmount) {
            if (enemyToUpdate.currentEnergyShield !== undefined && enemyToUpdate.calculatedStats.maxEnergyShield !== undefined) {
                const oldShield = enemyToUpdate.currentEnergyShield;
                enemyToUpdate.currentEnergyShield = Math.min(
                    enemyToUpdate.calculatedStats.maxEnergyShield,
                    enemyToUpdate.currentEnergyShield + event.shieldHealAmount
                );
                 if (enemyToUpdate.currentEnergyShield > oldShield) {
                  newDamagePopupsForCanvas.push({ 
                    id: `popup-${event.timestamp}-shield-${generateUniqueId()}`,
                    targetParticipantId: event.targetId,
                    amount: event.shieldHealAmount,
                    type: 'shield',
                    timestamp: event.timestamp
                  });
                  updatedBattleStats[event.attackerId].healingDone += event.shieldHealAmount;
                }
            }
        } else { // Is HP Damage
            let damageToApplyToEnemy = event.damage;
            let shieldDamageDealtToEnemy = 0;

            if (enemyToUpdate.currentEnergyShield && enemyToUpdate.currentEnergyShield > 0) {
                shieldDamageDealtToEnemy = Math.min(enemyToUpdate.currentEnergyShield, damageToApplyToEnemy);
                enemyToUpdate.currentEnergyShield -= shieldDamageDealtToEnemy;
                damageToApplyToEnemy -= shieldDamageDealtToEnemy;
                if (shieldDamageDealtToEnemy > 0) {
                   newDamagePopupsForCanvas.push({ 
                    id: `popup-${event.timestamp}-shield-${generateUniqueId()}`,
                    targetParticipantId: event.targetId,
                    amount: shieldDamageDealtToEnemy,
                    type: 'shield',
                    timestamp: event.timestamp
                  });
                  updatedBattleStats[event.attackerId].damageDealt += shieldDamageDealtToEnemy;
                }
            }

            if (shieldDamageDealtToEnemy > 0 || damageToApplyToEnemy > 0) {
                enemyToUpdate.shieldRechargeDelayTicksRemaining = enemyToUpdate.calculatedStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
            }

            if (damageToApplyToEnemy > 0) {
                enemyToUpdate.currentHp = Math.max(0, enemyToUpdate.currentHp - damageToApplyToEnemy);
                updatedBattleStats[event.attackerId].damageDealt += damageToApplyToEnemy;
                const anchorIndex = updatedFusionAnchors.findIndex(a => a.targetParticipantId === event.targetId);
                if (anchorIndex !== -1) {
                  const existingAnchor = { ...updatedFusionAnchors[anchorIndex] };
                  existingAnchor.totalAmount += damageToApplyToEnemy;
                  existingAnchor.lastUpdateTime = Date.now();
                  if (event.isCrit) existingAnchor.lastCritTimestamp = Date.now(); // Update timestamp
                  existingAnchor.feederQueue.push({ amount: damageToApplyToEnemy, isCritical: event.isCrit });
                  updatedFusionAnchors[anchorIndex] = existingAnchor;
                } else {
                  const newAnchor: FusionAnchor = {
                    id: event.targetId,
                    targetParticipantId: event.targetId,
                    totalAmount: damageToApplyToEnemy,
                    lastUpdateTime: Date.now(),
                    lastCritTimestamp: event.isCrit ? Date.now() : 0, // Initialize timestamp
                    anchorX: -20, 
                    anchorY: -40, 
                    xOffset: Math.random() * 40 - 20,
                    feederQueue: [{ amount: damageToApplyToEnemy, isCritical: event.isCrit }],
                    lastFeederSpawnTime: 0,
                  };
                  updatedFusionAnchors.push(newAnchor);
                }
            }
        }

        const enemyDef = ENEMY_DEFINITIONS[enemyToUpdate.id];
        if (enemyDef && enemyDef.phases && enemyDef.phases.length > 0) {
          const currentHpPercentage = enemyToUpdate.calculatedStats.maxHp > 0 ? enemyToUpdate.currentHp / enemyToUpdate.calculatedStats.maxHp : 0;
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
                  if (ability.type === BossPhaseAbilityType.STAT_BUFF && ability.stat && ability.value !== undefined) {
                    const tempBuff: TemporaryBuff = {
                      id: `phaseBuff-${enemyToUpdate.uniqueBattleId}-${ability.stat}-${Date.now()}`,
                      potionId: `phaseEffect-${phase.name || i}`,
                      effectType: 'TEMPORARY_STAT_MODIFIER',
                      stat: ability.stat,
                      modifierType: 'PERCENTAGE_ADDITIVE',
                      value: ability.value,
                      remainingDurationMs: (ability.durationTicks || 0) * GAME_TICK_MS,
                      appliedAtTick: gameState.battleState?.ticksElapsed || 0,
                    };
                    if (!enemyToUpdate.temporaryBuffs) enemyToUpdate.temporaryBuffs = [];
                    enemyToUpdate.temporaryBuffs.push(tempBuff);
                    if (!statsRecalculationNeededForEnemyIds.includes(enemyToUpdate.uniqueBattleId)) {
                       statsRecalculationNeededForEnemyIds.push(enemyToUpdate.uniqueBattleId);
                    }
                    logMessages.push(`  ↳ ${enemyToUpdate.name} gains ${ability.stat} buff from ${phase.name}!`);
                  } else if (ability.type === BossPhaseAbilityType.SUMMON_MINIONS && ability.summonParams) {
                    const summonedEnemyDef = ENEMY_DEFINITIONS[ability.summonParams.enemyId];
                    if (summonedEnemyDef) {
                      for (let k = 0; k < ability.summonParams.count; k++) {
                        const summonedStats = calculateWaveEnemyStats(summonedEnemyDef, 1, ability.summonParams.isElite); 
                        const initialSummonCooldowns: Record<string, number> = {};
                         if (summonedEnemyDef.channelingAbilities) {
                            summonedEnemyDef.channelingAbilities.forEach((caDef: EnemyChannelingAbilityDefinition) => {
                               initialSummonCooldowns[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                            });
                        }
                        const newSummon: BattleEnemy = {
                          ...summonedEnemyDef,
                          attackType: summonedEnemyDef.attackType || 'MELEE',
                          rangedAttackRangeUnits: summonedEnemyDef.rangedAttackRangeUnits,
                          calculatedStats: summonedStats,
                          uniqueBattleId: `${ability.summonParams.enemyId}_phaseSummon_${Date.now()}_${k}_${Math.random().toString(16).slice(2)}`,
                          currentHp: summonedStats.maxHp,
                          currentEnergyShield: summonedStats.maxEnergyShield || 0,
                          shieldRechargeDelayTicksRemaining: 0,
                          attackCooldown: (1000 / summonedStats.attackSpeed),
                          attackCooldownRemainingTicks: 0,
                          movementSpeed: 0, x: enemyToUpdate.x, y: enemyToUpdate.y, 
                          statusEffects: [], temporaryBuffs: [],
                          isElite: ability.summonParams.isElite,
                          specialAttackCooldownsRemaining: initialSummonCooldowns,
                        };
                        newSummonsFromPhase.push(newSummon);
                      }
                      logMessages.push(`  ↳ ${enemyToUpdate.name} summons ${ability.summonParams.count} ${ENEMY_DEFINITIONS[ability.summonParams.enemyId].name}(s)!`);
                    }
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

  statusEffectsToApplyFromPassives.forEach(appliance => {
    let target: BattleHero | BattleEnemy | undefined;
    const heroTargetIndexPass = updatedHeroes.findIndex(h => h.uniqueBattleId === appliance.targetId);
    if (heroTargetIndexPass !== -1) {
        target = updatedHeroes[heroTargetIndexPass];
        const existingEffectIndex = target.statusEffects.findIndex(se => se.name === appliance.effect.name && se.type === appliance.effect.type);
        if (existingEffectIndex !== -1) {
            target.statusEffects[existingEffectIndex].remainingDurationMs = appliance.effect.remainingDurationMs;
            if (appliance.effect.statAffected && target.statusEffects[existingEffectIndex].statAffected === appliance.effect.statAffected) {
                target.statusEffects[existingEffectIndex].value = appliance.effect.value;
            }
        } else {
            target.statusEffects.push(appliance.effect);
        }
        if (appliance.effect.statAffected) statsRecalculationNeededForEnemyIds.push(target.uniqueBattleId);
        updatedHeroes[heroTargetIndexPass] = {...target};
    } else {
        const enemyTargetIndexPass = updatedEnemies.findIndex(e => e.uniqueBattleId === appliance.targetId);
        if (enemyTargetIndexPass !== -1) {
            target = updatedEnemies[enemyTargetIndexPass];
            const existingEffectIndex = target.statusEffects.findIndex(se => se.name === appliance.effect.name && se.type === appliance.effect.type);
            if (existingEffectIndex !== -1) {
                target.statusEffects[existingEffectIndex].remainingDurationMs = appliance.effect.remainingDurationMs;
                 if (appliance.effect.statAffected && target.statusEffects[existingEffectIndex].statAffected === appliance.effect.statAffected) {
                    target.statusEffects[existingEffectIndex].value = appliance.effect.value;
                }
            } else {
                target.statusEffects.push(appliance.effect);
            }
            if (appliance.effect.statAffected) statsRecalculationNeededForEnemyIds.push(target.uniqueBattleId);
            updatedEnemies[enemyTargetIndexPass] = {...target};
        }
    }
  });

  return { 
    updatedHeroes, 
    updatedEnemies, 
    logMessages, 
    newSummonsFromPhase, 
    statsRecalculationNeededForEnemyIds, 
    newPassiveAttackEvents, 
    newDamagePopupsForCanvas, 
    updatedFusionAnchors, 
    newFeederParticles: newFeederParticlesForThisFunctionCall,
    updatedBattleStats,
  };
};