
import { BattleHero, BattleEnemy, HeroStats, GameState, GlobalBonuses, StatusEffect, StatusEffectType, AttackEvent, AbilityEffectTriggerType, AbilityEffect, ParticipantChannelingState, SpecialAttackDefinition, SpecialAttackTargetType, EnemyChannelingAbilityDefinition } from '../../types';
import { HERO_DEFINITIONS, SKILL_TREES, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, ENEMY_DEFINITIONS } from '../../gameData/index';
import { calculateHeroStats, calculateSpecialAttackData, calculateWaveEnemyStats } from '../../utils'; // Added calculateWaveEnemyStats
import { GAME_TICK_MS, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS } from '../../constants';

// Helper function to apply ability effects (re-defined here as it's closely tied to participantUpdater's scope)
const applyAbilityEffectsLocal = ( // Renamed to avoid conflict if it's also in eventProcessor globally
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
                    const initialSummonCooldowns: Record<string, number> = {};
                    if (enemyDefToSummon.channelingAbilities) {
                        enemyDefToSummon.channelingAbilities.forEach((caDef: EnemyChannelingAbilityDefinition) => {
                            initialSummonCooldowns[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                        });
                    }
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
                        temporaryBuffs: [],
                        isElite: effect.isElite,
                        specialAttackCooldownsRemaining: initialSummonCooldowns,
                    };
                    newSummons.push(newSummon);
                }
                logMessages.push(`${caster.name} summons ${effect.count} ${enemyDefToSummon.name}(s)!`);
            }
            break;
        case 'TRANSFORM_INTO_ENEMY':
            if ('loot' in caster) { // Only enemies can transform for now
                const enemyCaster = caster as BattleEnemy;
                const enemyDefToTransformInto = ENEMY_DEFINITIONS[effect.enemyIdToTransformInto];
                if (enemyDefToTransformInto) {
                    const currentWave = 1; // Default wave for scaling if not in wave battle context
                    const inheritElite = effect.inheritEliteStatus !== undefined ? effect.inheritEliteStatus : true;
                    const isTransformedElite = inheritElite ? enemyCaster.isElite : false;

                    const transformedStats = calculateWaveEnemyStats(enemyDefToTransformInto, currentWave, isTransformedElite);
                    const initialTransformedCooldowns: Record<string, number> = {};
                    if (enemyDefToTransformInto.channelingAbilities) {
                        enemyDefToTransformInto.channelingAbilities.forEach(caDef => {
                            initialTransformedCooldowns[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                        });
                    }
                    const transformedEnemy: BattleEnemy = {
                        ...enemyDefToTransformInto,
                        attackType: enemyDefToTransformInto.attackType || 'MELEE',
                        rangedAttackRangeUnits: enemyDefToTransformInto.rangedAttackRangeUnits,
                        calculatedStats: transformedStats,
                        uniqueBattleId: `${effect.enemyIdToTransformInto}_transformed_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                        currentHp: transformedStats.maxHp, // Spawn at full HP
                        currentEnergyShield: transformedStats.maxEnergyShield || 0,
                        shieldRechargeDelayTicksRemaining: 0,
                        attackCooldown: (1000 / transformedStats.attackSpeed),
                        attackCooldownRemainingTicks: 0,
                        movementSpeed: 0,
                        x: enemyCaster.x, // Spawn at original caster's position
                        y: enemyCaster.y,
                        statusEffects: [], // Start with no status effects
                        temporaryBuffs: [],
                        isElite: isTransformedElite,
                        specialAttackCooldownsRemaining: initialTransformedCooldowns,
                    };
                    newSummons.push(transformedEnemy);
                    caster.currentHp = 0; 
                    logMessages.push(`${caster.name} transforms into ${enemyDefToTransformInto.name}!`);
                } else {
                    logMessages.push(`Error: Definition for transformed enemy '${effect.enemyIdToTransformInto}' not found.`);
                }
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


export const updateParticipants = (
  heroes: BattleHero[],
  enemies: BattleEnemy[],
  battleTickDurationMs: number,
  gameState: GameState, 
  globalBonuses: GlobalBonuses
): { updatedHeroes: BattleHero[], updatedEnemies: BattleEnemy[], logMessages: string[], attackEventsFromDots: AttackEvent[], statsRecalculationNeededForHeroIds: string[], newSummons: BattleEnemy[] } => {
  const logMessages: string[] = [];
  const attackEventsFromDots: AttackEvent[] = [];
  const statsRecalculationNeededForHeroIds: string[] = [];
  const newSummons: BattleEnemy[] = []; 
  const statusEffectsToApplyNextTick: Array<{targetId: string, effect: StatusEffect}> = [];


  const updateSingleParticipant = <T extends BattleHero | BattleEnemy>(participant: T, isHero: boolean): T => {
    if (participant.currentHp <= 0 && !('isDying' in participant && (participant as BattleEnemy).isDying)) return participant;

    let updatedParticipant = { ...participant };
    updatedParticipant.statusEffects = [...(participant.statusEffects || [])];
    if (isHero) {
      (updatedParticipant as BattleHero).temporaryBuffs = [...((updatedParticipant as BattleHero).temporaryBuffs || [])];
    } else {
      (updatedParticipant as BattleEnemy).temporaryBuffs = [...((updatedParticipant as BattleEnemy).temporaryBuffs || [])];
    }

    const wasStunned = updatedParticipant.statusEffects.some(effect => effect.type === StatusEffectType.STUN);

    // Update Status Effects
    const stillActiveEffects: StatusEffect[] = [];
    updatedParticipant.statusEffects.forEach(effect => {
      let currentEffect = { ...effect };
      currentEffect.remainingDurationMs = Math.max(0, currentEffect.remainingDurationMs - battleTickDurationMs);

      if (currentEffect.remainingDurationMs > 0) {
        if (currentEffect.type === StatusEffectType.DOT && currentEffect.damagePerTick && currentEffect.tickIntervalMs) {
          let timeUntilTick = currentEffect.timeUntilNextDotTickMs ?? currentEffect.tickIntervalMs;
          timeUntilTick -= battleTickDurationMs;
          if (timeUntilTick <= 0) {
            const damage = currentEffect.damagePerTick;
            attackEventsFromDots.push({ attackerId: currentEffect.sourceId, targetId: updatedParticipant.uniqueBattleId, damage: damage, isCrit: false, timestamp: Date.now() + Math.random(), isDotDamage: true, appliedStatusEffectName: currentEffect.name });
            logMessages.push(`${updatedParticipant.name} takes ${damage} damage from ${currentEffect.name}.`);
            currentEffect.timeUntilNextDotTickMs = (currentEffect.tickIntervalMs + timeUntilTick);
          } else {
            currentEffect.timeUntilNextDotTickMs = timeUntilTick;
          }
        }
        stillActiveEffects.push(currentEffect);
      } else {
        logMessages.push(`${updatedParticipant.name}'s ${effect.name} has worn off.`);
        if ((effect.type === StatusEffectType.BUFF || effect.type === StatusEffectType.DEBUFF)) {
          if (!statsRecalculationNeededForHeroIds.includes(updatedParticipant.uniqueBattleId)) {
            statsRecalculationNeededForHeroIds.push(updatedParticipant.uniqueBattleId);
          }
        }
      }
    });
    
    const addStatusEffectToParticipant = (target: BattleHero | BattleEnemy, effectToAdd: StatusEffect, isHeroSourceForEffect: boolean) => {
        const existingEffectIndex = target.statusEffects.findIndex(se => se.name === effectToAdd.name && se.type === effectToAdd.type);
        if (existingEffectIndex !== -1) {
            target.statusEffects[existingEffectIndex].remainingDurationMs = effectToAdd.remainingDurationMs;
        } else {
            target.statusEffects.push(effectToAdd);
        }

        if (target.id === 'TREANT_SAPLING' && effectToAdd.name.startsWith('Ausgewachsen')) {
            if (effectToAdd.statAffected && effectToAdd.modifierType === 'PERCENTAGE_ADDITIVE' && effectToAdd.value !== undefined) {
                const statKey = effectToAdd.statAffected as keyof HeroStats;
                if (typeof target.calculatedStats[statKey] === 'number') {
                    const baseValueForCalc = HERO_DEFINITIONS[target.id]?.baseStats[statKey] || (target.calculatedStats[statKey] as number) / (1 + (effectToAdd.value || 0)); 
                    (target.calculatedStats[statKey] as number) = Math.floor((target.calculatedStats[statKey] as number) * (1 + (effectToAdd.value || 0)));
                    
                    if (statKey === 'maxHp') { 
                        console.log(`${target.name} HP buff applied. Old MaxHP: (not directly available here), New MaxHP: ${target.calculatedStats.maxHp}. CurrentHP before adjustment: ${target.currentHp}`);
                    }
                     logMessages.push(`DEBUG: Treant ${target.name} ${statKey} updated by ${effectToAdd.name} to ${target.calculatedStats[statKey]}`);
                }
            }
        }

        if (effectToAdd.statAffected && (effectToAdd.type === StatusEffectType.BUFF || effectToAdd.type === StatusEffectType.DEBUFF)) {
            if (!statsRecalculationNeededForHeroIds.includes(target.uniqueBattleId) && 'definitionId' in target) {
                statsRecalculationNeededForHeroIds.push(target.uniqueBattleId);
            }
        }
    };

    statusEffectsToApplyNextTick.forEach(appliance => {
        if (appliance.targetId === updatedParticipant.uniqueBattleId) {
            const isHeroSourceForThisEffect = !!heroes.find(h => h.uniqueBattleId === appliance.effect.sourceId);
            addStatusEffectToParticipant(updatedParticipant, appliance.effect, isHeroSourceForThisEffect);
        }
    });
    // Clearing statusEffectsToApplyNextTick is done after processing all participants


    updatedParticipant.statusEffects = stillActiveEffects;
    const isCurrentlyStunned = updatedParticipant.statusEffects.some(effect => effect.type === StatusEffectType.STUN);

    // Channeling Logic
    if (updatedParticipant.channelingState) {
        let cs = { ...updatedParticipant.channelingState };
        const abilityDefOrSaDef = SPECIAL_ATTACK_DEFINITIONS[cs.abilityId] || (ENEMY_DEFINITIONS[updatedParticipant.id]?.channelingAbilities?.find(ca => ca.id === cs.abilityId));
        const channelingProperties = (abilityDefOrSaDef as any)?.channelingProperties;

        if (isCurrentlyStunned && !wasStunned) {
            logMessages.push(`${updatedParticipant.name}'s channeling of ${cs.abilityId} was interrupted by stun!`);
            if (channelingProperties?.effects.ON_CHANNEL_INTERRUPT) {
                applyAbilityEffectsLocal(channelingProperties.effects.ON_CHANNEL_INTERRUPT, updatedParticipant, null, heroes, enemies, logMessages, attackEventsFromDots, statusEffectsToApplyNextTick, newSummons, AbilityEffectTriggerType.ON_CHANNEL_INTERRUPT, gameState.battleState!.ticksElapsed, cs.abilityId);
            }
            updatedParticipant.channelingState = null; // Clear state
            if (isHero && abilityDefOrSaDef && 'cooldownBaseMs' in abilityDefOrSaDef) { 
                (updatedParticipant as BattleHero).specialAttackCooldownsRemaining[cs.abilityId] = (abilityDefOrSaDef as SpecialAttackDefinition).cooldownBaseMs;
            } else if (!isHero && abilityDefOrSaDef && 'cooldownMs' in abilityDefOrSaDef) {
                 (updatedParticipant as BattleEnemy).specialAttackCooldownsRemaining = {
                    ...((updatedParticipant as BattleEnemy).specialAttackCooldownsRemaining || {}),
                    [cs.abilityId]: (abilityDefOrSaDef as any).cooldownMs || 5000
                 };
            }
        } else if (!isCurrentlyStunned) {
            cs.progressMs += battleTickDurationMs;
            if (channelingProperties?.channelTickIntervalMs && channelingProperties.effects.ON_CHANNEL_TICK) {
                cs.channelTickProgressMs = (cs.channelTickProgressMs || 0) + battleTickDurationMs;
                if (cs.channelTickProgressMs >= channelingProperties.channelTickIntervalMs) {
                    applyAbilityEffectsLocal(channelingProperties.effects.ON_CHANNEL_TICK, updatedParticipant, null, heroes, enemies, logMessages, attackEventsFromDots, statusEffectsToApplyNextTick, newSummons, AbilityEffectTriggerType.ON_CHANNEL_TICK, gameState.battleState!.ticksElapsed, cs.abilityId);
                    cs.channelTickProgressMs = 0;
                }
            }

            if (cs.progressMs >= cs.totalDurationMs) { 
                logMessages.push(`${updatedParticipant.name} completes channeling ${cs.abilityId}!`);
                let effectsToApplyOnComplete: AbilityEffect[] | undefined;
                 if (channelingProperties?.effects.ON_CHANNEL_COMPLETE) {
                    effectsToApplyOnComplete = channelingProperties.effects.ON_CHANNEL_COMPLETE;
                }
                const primaryTargetForEffects = updatedParticipant.targetId 
                                                ? (enemies.find(e => e.uniqueBattleId === updatedParticipant.targetId) || heroes.find(h => h.uniqueBattleId === updatedParticipant.targetId)) 
                                                : null;
                applyAbilityEffectsLocal(effectsToApplyOnComplete, updatedParticipant, primaryTargetForEffects, heroes, enemies, logMessages, attackEventsFromDots, statusEffectsToApplyNextTick, newSummons, AbilityEffectTriggerType.ON_CHANNEL_COMPLETE, gameState.battleState!.ticksElapsed, cs.abilityId);
                
                updatedParticipant.channelingState = null;
                if (isHero && abilityDefOrSaDef && 'cooldownBaseMs' in abilityDefOrSaDef) {
                    (updatedParticipant as BattleHero).specialAttackCooldownsRemaining[cs.abilityId] = (abilityDefOrSaDef as SpecialAttackDefinition).cooldownBaseMs;
                } else if (!isHero && abilityDefOrSaDef && 'cooldownMs' in abilityDefOrSaDef) {
                     (updatedParticipant as BattleEnemy).specialAttackCooldownsRemaining = {
                        ...((updatedParticipant as BattleEnemy).specialAttackCooldownsRemaining || {}),
                        [cs.abilityId]: (abilityDefOrSaDef as any).cooldownMs || 5000
                     };
                }
            } else {
              updatedParticipant.channelingState = cs;
            }
        }
    }
    
    if (isHero) {
      const heroParticipant = updatedParticipant as BattleHero;
      const previousBuffCount = heroParticipant.temporaryBuffs.length;
      heroParticipant.temporaryBuffs = heroParticipant.temporaryBuffs
        .map(buff => ({ ...buff, remainingDurationMs: Math.max(0, buff.remainingDurationMs - battleTickDurationMs) }))
        .filter(buff => buff.remainingDurationMs > 0);
      if (heroParticipant.temporaryBuffs.length !== previousBuffCount) {
        if (!statsRecalculationNeededForHeroIds.includes(updatedParticipant.uniqueBattleId)) {
           statsRecalculationNeededForHeroIds.push(updatedParticipant.uniqueBattleId);
        }
        logMessages.push(`${heroParticipant.name} had ${previousBuffCount - heroParticipant.temporaryBuffs.length} temporary buff(s) wear off.`);
      }
    } else {
        const enemyParticipant = updatedParticipant as BattleEnemy;
        const previousBuffCount = enemyParticipant.temporaryBuffs.length;
        enemyParticipant.temporaryBuffs = enemyParticipant.temporaryBuffs
            .map(buff => ({ ...buff, remainingDurationMs: Math.max(0, buff.remainingDurationMs - battleTickDurationMs) }))
            .filter(buff => buff.remainingDurationMs > 0);
        if (enemyParticipant.temporaryBuffs.length !== previousBuffCount) {
            // Enemy stat recalculation handled centrally if needed
            logMessages.push(`${enemyParticipant.name} had ${previousBuffCount - enemyParticipant.temporaryBuffs.length} temporary buff(s) wear off.`);
        }
    }


    if (updatedParticipant.calculatedStats.hpRegen && updatedParticipant.calculatedStats.hpRegen > 0 && updatedParticipant.currentHp < updatedParticipant.calculatedStats.maxHp) {
      const hpToRegenPerTick = (updatedParticipant.calculatedStats.hpRegen / (1000 / battleTickDurationMs));
      updatedParticipant.currentHp = Math.min(updatedParticipant.calculatedStats.maxHp, updatedParticipant.currentHp + hpToRegenPerTick);
    }
    if (isHero && (updatedParticipant as BattleHero).calculatedStats.manaRegen && (updatedParticipant as BattleHero).calculatedStats.maxMana && (updatedParticipant as BattleHero).calculatedStats.maxMana! > 0) {
      const heroParticipant = updatedParticipant as BattleHero;
      const manaToRegenPerTick = (heroParticipant.calculatedStats.manaRegen! / (1000 / battleTickDurationMs));
      heroParticipant.currentMana = Math.min(heroParticipant.calculatedStats.maxMana!, heroParticipant.currentMana + manaToRegenPerTick);
    }

    if (updatedParticipant.shieldRechargeDelayTicksRemaining !== undefined && updatedParticipant.shieldRechargeDelayTicksRemaining > 0) {
      updatedParticipant.shieldRechargeDelayTicksRemaining = Math.max(0, updatedParticipant.shieldRechargeDelayTicksRemaining - 1);
    } else if (updatedParticipant.calculatedStats.maxEnergyShield && updatedParticipant.calculatedStats.maxEnergyShield > 0 &&
               updatedParticipant.currentEnergyShield !== undefined && updatedParticipant.currentEnergyShield < updatedParticipant.calculatedStats.maxEnergyShield &&
               updatedParticipant.calculatedStats.energyShieldRechargeRate) {
      updatedParticipant.currentEnergyShield = Math.min(
        updatedParticipant.calculatedStats.maxEnergyShield,
        updatedParticipant.currentEnergyShield + updatedParticipant.calculatedStats.energyShieldRechargeRate
      );
    }
    
    updatedParticipant.attackCooldown = Math.max(0, updatedParticipant.attackCooldown - battleTickDurationMs);
    
    if (isHero) {
      const hero = updatedParticipant as BattleHero;
      const newSpecialAttackCooldownsRemaining: Record<string, number> = {};
      Object.keys(hero.specialAttackCooldownsRemaining).forEach(saId => {
        newSpecialAttackCooldownsRemaining[saId] = Math.max(0, hero.specialAttackCooldownsRemaining[saId] - battleTickDurationMs);
      });
      hero.specialAttackCooldownsRemaining = newSpecialAttackCooldownsRemaining;
    }
    else {
        const enemy = updatedParticipant as BattleEnemy;
        if (enemy.summonAbility && enemy.currentSummonCooldownMs !== undefined) {
            enemy.currentSummonCooldownMs = Math.max(0, enemy.currentSummonCooldownMs - battleTickDurationMs);
        }
        if (enemy.healAbility && enemy.currentHealCooldownMs !== undefined) {
            enemy.currentHealCooldownMs = Math.max(0, enemy.currentHealCooldownMs - battleTickDurationMs);
        }
        if (enemy.aoeAttackChance && enemy.currentAoeAttackCooldownMs !== undefined) {
            enemy.currentAoeAttackCooldownMs = Math.max(0, enemy.currentAoeAttackCooldownMs - battleTickDurationMs);
        }
        if (enemy.explosionAbility && enemy.explosionTimerRemainingMs !== undefined) {
            enemy.explosionTimerRemainingMs = Math.max(0, enemy.explosionTimerRemainingMs - battleTickDurationMs);
        }
        if (enemy.periodicEffectAbility && enemy.currentPeriodicEffectCooldownMs !== undefined) { 
            enemy.currentPeriodicEffectCooldownMs = Math.max(0, enemy.currentPeriodicEffectCooldownMs - battleTickDurationMs);
        }
        if (enemy.channelingAbilities && enemy.channelingAbilities.length > 0 && enemy.specialAttackCooldownsRemaining) {
            enemy.channelingAbilities.forEach(ca => {
                 if (enemy.specialAttackCooldownsRemaining![ca.id] !== undefined) {
                    enemy.specialAttackCooldownsRemaining![ca.id] = Math.max(0, enemy.specialAttackCooldownsRemaining![ca.id] - battleTickDurationMs);
                }
            });
        }
    }
    return updatedParticipant;
  };
  

  const finalHeroesInitial = heroes.map(h => updateSingleParticipant(h, true));
  const finalEnemies = enemies.map(e => updateSingleParticipant(e, false));

  // Apply Paladin Aura after individual updates
  let finalHeroesWithAura = [...finalHeroesInitial];
  const paladinsInPartyProvidingAura = finalHeroesWithAura.filter(h => 
    h.definitionId === 'PALADIN' && 
    h.currentHp > 0 && 
    (h.skillLevels['PALADIN_PASSIVE_PERSEVERANCEAURA_01'] || 0) > 0
  );

  paladinsInPartyProvidingAura.forEach(paladinAuraProvider => {
    const skillLevel = paladinAuraProvider.skillLevels['PALADIN_PASSIVE_PERSEVERANCEAURA_01'];
    const procChancePerTick = (0.01 + skillLevel * 0.005);
    if (Math.random() < procChancePerTick) {
        const manaRestored = 1 + Math.floor(skillLevel / 2);
        finalHeroesWithAura = finalHeroesWithAura.map(heroToReceiveAura => {
            if (heroToReceiveAura.currentHp > 0 && heroToReceiveAura.calculatedStats.maxMana && heroToReceiveAura.calculatedStats.maxMana > 0) {
                const newMana = Math.min(heroToReceiveAura.calculatedStats.maxMana!, (heroToReceiveAura.currentMana || 0) + manaRestored);
                if (newMana > (heroToReceiveAura.currentMana || 0)) {
                     logMessages.push(`  ↳ ${paladinAuraProvider.name}'s Aura of Perseverance restores ${manaRestored} Mana to ${heroToReceiveAura.name}.`);
                     return { ...heroToReceiveAura, currentMana: newMana };
                }
            }
            return heroToReceiveAura;
        });
    }
  });
  statusEffectsToApplyNextTick.length = 0; // Clear after processing all participants for the tick

  return { updatedHeroes: finalHeroesWithAura, updatedEnemies: finalEnemies, logMessages, attackEventsFromDots, statsRecalculationNeededForHeroIds, newSummons };
};
