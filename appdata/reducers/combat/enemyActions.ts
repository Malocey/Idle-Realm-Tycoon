
import { BattleEnemy, BattleHero, AttackEvent, GameState, GlobalBonuses, TemporaryBuff, BossPhaseAbilityType, StatusEffect, StatusEffectType, EnemyChannelingAbilityDefinition } from '../../types';
import { ENEMY_DEFINITIONS, HERO_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../../gameData/index'; 
import { calculateWaveEnemyStats, formatNumber } from '../../utils';
import { GAME_TICK_MS } from '../../constants';


export const processEnemyActions = (
  currentEnemies: BattleEnemy[],
  currentHeroes: BattleHero[],
  battleTickDurationMs: number,
  gameState: GameState, 
  globalBonuses: GlobalBonuses
): { updatedEnemies: BattleEnemy[], attackEvents: AttackEvent[], newSummons: BattleEnemy[], logMessages: string[], statusEffectsToApplyToHeroes: Array<{ heroId: string, effect: StatusEffect }> } => {
  const attackEvents: AttackEvent[] = [];
  const newSummons: BattleEnemy[] = [];
  const logMessages: string[] = [];
  let statusEffectsToApplyToHeroes: Array<{ heroId: string, effect: StatusEffect }> = [];
  let updatedEnemies = [...currentEnemies]; 

  updatedEnemies = updatedEnemies.map(enemy => {
    if (enemy.currentHp <= 0) return enemy;
    let enemyCopy = { ...enemy, statusEffects: [...(enemy.statusEffects || [])] }; 
    let enemyActedThisTick = false;

    const isStunned = enemyCopy.statusEffects && enemyCopy.statusEffects.some(effect => effect.type === StatusEffectType.STUN);
    if (isStunned) {
      if (!logMessages.some(log => log.includes(`${enemyCopy.name} is stunned`))) {
        logMessages.push(`${enemyCopy.name} is stunned and cannot act!`);
      }
      return enemyCopy;
    }
    
    if (enemyCopy.channelingState) {
        if (enemyCopy.channelingState.areActionsBlocked) {
            enemyActedThisTick = true; 
        }
    }

    // 1. Channeling Abilities
    if (!enemyActedThisTick && enemyCopy.channelingAbilities && enemyCopy.channelingAbilities.length > 0) {
        for (const abilityDef of enemyCopy.channelingAbilities) { 
            const cooldownRemaining = enemyCopy.specialAttackCooldownsRemaining?.[abilityDef.id] || 0;
            if (cooldownRemaining <= 0 && !enemyCopy.channelingState) { // Check not already channeling
                logMessages.push(`${enemyCopy.name} starts channeling ${abilityDef.name}!`);
                enemyCopy.channelingState = {
                    abilityId: abilityDef.id,
                    sourceParticipantId: enemyCopy.uniqueBattleId,
                    totalDurationMs: abilityDef.channelingProperties.channelDurationMs,
                    progressMs: 0,
                    channelTickProgressMs: 0, // Initialize if not present
                    isMovementBlocked: abilityDef.channelingProperties.blocksMovementWhileChanneling ?? true,
                    areActionsBlocked: abilityDef.channelingProperties.blocksActionsWhileChanneling ?? true,
                };
                
                // ** CRITICAL FIX: Set cooldown for the channeling ability itself upon starting it **
                if (!enemyCopy.specialAttackCooldownsRemaining) {
                    enemyCopy.specialAttackCooldownsRemaining = {};
                }
                enemyCopy.specialAttackCooldownsRemaining[abilityDef.id] = abilityDef.cooldownMs;
                
                if (abilityDef.channelingProperties.blocksActionsWhileChanneling) {
                    enemyActedThisTick = true;
                    // If channel blocks actions, it also "uses up" the basic attack for this turn
                    enemyCopy.attackCooldown = (1000 / enemyCopy.calculatedStats.attackSpeed); 
                }
                // If channel does NOT block actions, enemyActedThisTick remains false.
                // Basic attack CD is NOT reset here by the channel start itself.
                // It will be reset if a basic attack occurs later in this function.
                break; 
            }
        }
    }

    // 2. Other Cooldown-Based Abilities (Summon, Heal, AOE, Periodic)
    // These will only trigger if not already channeling something that blocks actions,
    // or if the channel ability itself doesn't block actions and the enemy hasn't acted yet.

    // Explosion Ability Check (if it has one)
    if (!enemyActedThisTick && enemyCopy.explosionAbility && enemyCopy.explosionTimerRemainingMs !== undefined) {
      if (enemyCopy.explosionTimerRemainingMs <= 0) {
        logMessages.push(`${enemyCopy.name} explodes!`);
        const explosionDamage = enemyCopy.explosionAbility.damage;
        currentHeroes.forEach(heroTarget => {
          if (heroTarget.currentHp > 0) {
            let damageDealt = Math.max(1, explosionDamage - heroTarget.calculatedStats.defense);
             if (gameState.godModeActive && currentHeroes.find(h => h.uniqueBattleId === heroTarget.uniqueBattleId)?.uniqueBattleId === gameState.actionBattleState?.controlledHeroId) damageDealt = 0;
            attackEvents.push({ attackerId: enemyCopy.uniqueBattleId, targetId: heroTarget.uniqueBattleId, damage: damageDealt, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Explosion' });
            logMessages.push(`  ↳ Hits ${heroTarget.name} for ${damageDealt} damage.`);
          }
        });
        enemyCopy.currentHp = 0; // Enemy is destroyed by explosion
        enemyActedThisTick = true; // Considered an action
      }
    }

    // Periodic Effect Ability
    if (!enemyActedThisTick && enemyCopy.periodicEffectAbility && enemyCopy.currentPeriodicEffectCooldownMs !== undefined) {
      if (enemyCopy.currentPeriodicEffectCooldownMs <= 0) {
        const effectDef = enemyCopy.periodicEffectAbility.statusEffect;
        logMessages.push(`${enemyCopy.name} emits ${effectDef.name}!`);
        currentHeroes.forEach(heroTarget => {
          if (heroTarget.currentHp > 0) {
            const newEffect: StatusEffect = {
              instanceId: `periodic-${enemyCopy.uniqueBattleId}-${heroTarget.uniqueBattleId}-${Date.now()}`,
              // definitionId will be undefined for inline effects
              type: effectDef.type,
              name: effectDef.name,
              iconName: effectDef.iconName,
              remainingDurationMs: effectDef.durationMs,
              sourceId: enemyCopy.uniqueBattleId,
              appliedAtTick: gameState.battleState!.ticksElapsed, // Assuming battleState is not null here
              statAffected: effectDef.statAffected,
              modifierType: effectDef.modifierType,
              value: effectDef.value,
              damagePerTick: undefined, 
              tickIntervalMs: undefined, 
              timeUntilNextDotTickMs: undefined,
            };
            statusEffectsToApplyToHeroes.push({ heroId: heroTarget.uniqueBattleId, effect: newEffect });
            logMessages.push(`  ↳ ${heroTarget.name} is affected by ${newEffect.name}.`);
          }
        });
        enemyCopy.currentPeriodicEffectCooldownMs = enemyCopy.periodicEffectAbility.cooldownMs;
        enemyActedThisTick = true; // Considered an action
        enemyCopy.attackCooldown = (1000 / enemyCopy.calculatedStats.attackSpeed); // Reset basic attack cooldown
      }
    }

    // Summon Ability
    if (!enemyActedThisTick && enemyCopy.summonAbility && enemyCopy.currentSummonCooldownMs !== undefined) {
      if (enemyCopy.currentSummonCooldownMs <= 0) {
        logMessages.push(`${enemyCopy.name} uses ${enemyCopy.summonAbility.enemyIdToSummon === 'GOBLIN' ? 'Summon Goblins' : 'Summon'}!`);
        for (let i = 0; i < enemyCopy.summonAbility.count; i++) {
          const summonedEnemyDef = ENEMY_DEFINITIONS[enemyCopy.summonAbility.enemyIdToSummon];
          if (summonedEnemyDef) {
            const currentWaveForScaling = gameState.battleState?.waveNumber;
            const summonedEnemyStats = (enemyCopy.summonAbility.scaleWithWave && currentWaveForScaling)
              ? calculateWaveEnemyStats(summonedEnemyDef, currentWaveForScaling)
              : calculateWaveEnemyStats(summonedEnemyDef, 1); 

            const initialSummonCooldowns: Record<string, number> = {};
            if (summonedEnemyDef.channelingAbilities) {
                summonedEnemyDef.channelingAbilities.forEach((caDef: EnemyChannelingAbilityDefinition) => {
                   initialSummonCooldowns[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                });
            }
            const newSummonedEnemy: BattleEnemy = {
              ...summonedEnemyDef,
              attackType: summonedEnemyDef.attackType || 'MELEE',
              rangedAttackRangeUnits: summonedEnemyDef.rangedAttackRangeUnits,
              calculatedStats: summonedEnemyStats,
              uniqueBattleId: `${summonedEnemyDef.id}_summon_${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`,
              currentHp: summonedEnemyStats.maxHp,
              currentEnergyShield: summonedEnemyStats.maxEnergyShield || 0,
              shieldRechargeDelayTicksRemaining: 0,
              attackCooldown: (1000 / summonedEnemyStats.attackSpeed),
              attackCooldownRemainingTicks: 0,
              movementSpeed: 0, x: 0, y: 0,
              statusEffects: [], isElite: false,
              specialAttackCooldownsRemaining: initialSummonCooldowns,
            };
             // Initialize other specific ability cooldowns for the summon
            if (summonedEnemyDef.summonAbility) newSummonedEnemy.currentSummonCooldownMs = summonedEnemyDef.summonAbility.initialCooldownMs ?? summonedEnemyDef.summonAbility.cooldownMs;
            if (summonedEnemyDef.healAbility) newSummonedEnemy.currentHealCooldownMs = summonedEnemyDef.healAbility.initialCooldownMs ?? summonedEnemyDef.healAbility.cooldownMs;
            if (summonedEnemyDef.aoeAttackChance && summonedEnemyDef.aoeAttackCooldownBaseMs) newSummonedEnemy.currentAoeAttackCooldownMs = summonedEnemyDef.aoeAttackCooldownBaseMs;
            if (summonedEnemyDef.explosionAbility) newSummonedEnemy.explosionTimerRemainingMs = summonedEnemyDef.explosionAbility.timerMs;
            if (summonedEnemyDef.periodicEffectAbility) newSummonedEnemy.currentPeriodicEffectCooldownMs = summonedEnemyDef.periodicEffectAbility.initialCooldownMs ?? summonedEnemyDef.periodicEffectAbility.cooldownMs;
            newSummons.push(newSummonedEnemy);
          } else {
            logMessages.push(`Error: Definition for summoned enemy '${enemyCopy.summonAbility.enemyIdToSummon}' not found.`);
          }
        }
        enemyCopy.currentSummonCooldownMs = enemyCopy.summonAbility.cooldownMs;
        enemyActedThisTick = true; // Considered an action
        enemyCopy.attackCooldown = (1000 / enemyCopy.calculatedStats.attackSpeed); // Reset basic attack cooldown
      }
    }
    
    // Heal Ability
    if (!enemyActedThisTick && enemyCopy.healAbility && enemyCopy.currentHealCooldownMs !== undefined) {
      if (enemyCopy.currentHealCooldownMs <= 0) {
        const livingAllies = currentEnemies.filter(e => e.currentHp > 0 && e.uniqueBattleId !== enemyCopy.uniqueBattleId && e.currentHp < e.calculatedStats.maxHp);
        if (livingAllies.length > 0) {
          let healTarget: BattleEnemy | undefined;
          if (enemyCopy.healAbility.targetPriority === 'LOWEST_HP_PERCENTAGE') {
            livingAllies.sort((a, b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp));
          } else { 
            livingAllies.sort((a, b) => a.currentHp - b.currentHp);
          }
          healTarget = livingAllies[0];

          if (healTarget) {
            let healAmount = enemyCopy.healAbility.healAmount;
            if (enemyCopy.healAbility.healFactor) {
              healAmount += Math.floor(healTarget.calculatedStats.maxHp * enemyCopy.healAbility.healFactor);
            }
            attackEvents.push({
              attackerId: enemyCopy.uniqueBattleId, targetId: healTarget.uniqueBattleId, damage: 0, isCrit: false,
              timestamp: Date.now() + Math.random(), isHeal: true, healAmount
            });
            logMessages.push(`${enemyCopy.name} heilt ${healTarget.name} um ${healAmount} HP.`);
            enemyCopy.currentHealCooldownMs = enemyCopy.healAbility.cooldownMs;
            enemyActedThisTick = true; // Considered an action
            enemyCopy.attackCooldown = (1000 / enemyCopy.calculatedStats.attackSpeed); // Reset basic attack cooldown
          }
        }
      }
    }

    // AOE Attack
    if (!enemyActedThisTick && enemyCopy.aoeAttackChance && enemyCopy.aoeDamageFactor && enemyCopy.currentAoeAttackCooldownMs !== undefined) {
        if (enemyCopy.currentAoeAttackCooldownMs <= 0 && Math.random() < enemyCopy.aoeAttackChance) {
            const livingHeroes = currentHeroes.filter(h => h.currentHp > 0);
            if (livingHeroes.length > 0) {
                logMessages.push(`${enemyCopy.name} uses AoE attack!`);
                livingHeroes.forEach(heroTarget => {
                    let damageDealt = Math.max(1, Math.floor((enemyCopy.calculatedStats.damage * enemyCopy.aoeDamageFactor!) - heroTarget.calculatedStats.defense));
                    if (gameState.godModeActive && currentHeroes.find(h => h.uniqueBattleId === heroTarget.uniqueBattleId)?.uniqueBattleId === gameState.actionBattleState?.controlledHeroId) damageDealt = 0;
                    logMessages.push(`  ↳ Hits ${heroTarget.name} for ${damageDealt} damage.`);
                    attackEvents.push({ attackerId: enemyCopy.uniqueBattleId, targetId: heroTarget.uniqueBattleId, damage: damageDealt, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'AoE Attack' });
                });
                enemyCopy.currentAoeAttackCooldownMs = enemyCopy.aoeAttackCooldownBaseMs || 10000; // Default to 10s if base isn't set
                enemyActedThisTick = true; // Considered an action
                enemyCopy.attackCooldown = (1000 / enemyCopy.calculatedStats.attackSpeed); // Reset basic attack cooldown
            }
        }
    }

    // Basic Attack (if no other action taken and cooldown is ready)
    if (!enemyActedThisTick && enemyCopy.attackCooldown <= 0) {
      // Ensure not channeling something that blocks actions (already checked by enemyActedThisTick if channel started this tick and blocks)
      // If currently in a non-blocking channel, this can still proceed.
      if (enemyCopy.channelingState && enemyCopy.channelingState.areActionsBlocked) {
        // Skip basic attack if currently channeling something that blocks actions
      } else {
        const livingHeroes = currentHeroes.filter(h => h.currentHp > 0);
        if (livingHeroes.length > 0) {
          let targetHeroData: BattleHero | undefined;
          // Prioritize taunting heroes if any
          const tauntingHeroes = livingHeroes.filter(h => h.isTaunting);
          if (tauntingHeroes.length > 0) {
              targetHeroData = tauntingHeroes[Math.floor(Math.random() * tauntingHeroes.length)];
          } else {
              targetHeroData = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
          }

          if (targetHeroData) {
            let damageDealt = Math.max(1, Math.floor(enemyCopy.calculatedStats.damage - targetHeroData.calculatedStats.defense));
            if (gameState.godModeActive && targetHeroData.uniqueBattleId === gameState.actionBattleState?.controlledHeroId) damageDealt = 0;
            let isCrit = false;
            if (enemyCopy.calculatedStats.critChance && Math.random() < enemyCopy.calculatedStats.critChance) {
              damageDealt = Math.floor(damageDealt * (enemyCopy.calculatedStats.critDamage || 1.5));
              if (gameState.godModeActive && targetHeroData.uniqueBattleId === gameState.actionBattleState?.controlledHeroId) damageDealt = 0;
              logMessages.push(`${enemyCopy.name} CRITS ${targetHeroData.name} for ${damageDealt} damage!`);
              isCrit = true;
            } else {
              logMessages.push(`${enemyCopy.name} attacks ${targetHeroData.name} for ${damageDealt} damage.`);
            }
            attackEvents.push({ attackerId: enemyCopy.uniqueBattleId, targetId: targetHeroData.uniqueBattleId, damage: damageDealt, isCrit, timestamp: Date.now() + Math.random() });

            // Apply on-attack abilities
            if (enemyCopy.onAttackAbilities) {
              enemyCopy.onAttackAbilities.forEach(ability => {
                if (Math.random() < ability.chance) {
                  let effectToApply: StatusEffect | null = null;
                  const sourceDef = ability.statusEffectId ? STATUS_EFFECT_DEFINITIONS[ability.statusEffectId] : ability.inlineStatusEffect;

                  if (sourceDef) {
                    effectToApply = {
                      instanceId: `onAttack-${enemyCopy.uniqueBattleId}-${targetHeroData!.uniqueBattleId}-${ability.statusEffectId || 'inline'}-${Date.now()}`,
                      definitionId: ability.statusEffectId, // Store ID if it's predefined
                      type: sourceDef.type,
                      name: sourceDef.name,
                      iconName: sourceDef.iconName,
                      remainingDurationMs: sourceDef.durationMs,
                      sourceId: enemyCopy.uniqueBattleId,
                      appliedAtTick: gameState.battleState!.ticksElapsed, // Assuming battleState is not null
                      statAffected: sourceDef.statAffected,
                      modifierType: sourceDef.modifierType,
                      value: sourceDef.value,
                      damagePerTick: sourceDef.damagePerTick, // From definition
                      tickIntervalMs: sourceDef.tickIntervalMs, // From definition
                      timeUntilNextDotTickMs: sourceDef.type === StatusEffectType.DOT && sourceDef.tickIntervalMs ? sourceDef.tickIntervalMs : undefined,
                    };
                  }
                  
                  if (effectToApply) {
                    statusEffectsToApplyToHeroes.push({ heroId: targetHeroData!.uniqueBattleId, effect: effectToApply });
                    logMessages.push(`  ↳ ${enemyCopy.name}'s attack applies ${effectToApply.name} to ${targetHeroData!.name}.`);
                  }
                }
              });
            }
          }
        }
        enemyCopy.attackCooldown = (1000 / enemyCopy.calculatedStats.attackSpeed); // Reset basic attack cooldown
        // enemyActedThisTick = true; // No longer strictly needed to set here if it's the last possible action
      }
    }
    return enemyCopy;
  });

  return { updatedEnemies, attackEvents, newSummons, logMessages, statusEffectsToApplyToHeroes };
};

