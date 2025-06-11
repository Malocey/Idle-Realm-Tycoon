
import { BattleHero, BattleEnemy, AttackEvent, GameState, GlobalBonuses, TemporaryBuff, BossPhaseAbilityType, StatusEffect, StatusEffectType, AbilityEffectTriggerType, EnemyChannelingAbilityDefinition, AbilityEffect, HeroStats } from '../../types';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, SKILL_TREES } from '../../gameData/index';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, GAME_TICK_MS } from '../../constants';
import { calculateWaveEnemyStats, calculateSpecialAttackData } from '../../utils';

// Hilfsfunktion, um Stats für Boss-Phasen-Buffs neu zu berechnen
// This function is no longer used directly here as recalculation happens in the main tick.
// const recalculateBossStatsWithPhaseBuff = (boss: BattleEnemy, phaseBuff: TemporaryBuff): BattleEnemy => { ... };


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


export const processAttackEvents = (
  attackEvents: AttackEvent[],
  currentHeroes: BattleHero[],
  currentEnemies: BattleEnemy[],
  gameState: GameState,
  globalBonuses: GlobalBonuses
): { updatedHeroes: BattleHero[], updatedEnemies: BattleEnemy[], logMessages: string[], newSummonsFromPhase?: BattleEnemy[], statsRecalculationNeededForEnemyIds: string[], newPassiveAttackEvents: AttackEvent[] } => {
  let updatedHeroes = [...currentHeroes];
  let updatedEnemies = [...currentEnemies];
  const logMessages: string[] = [];
  const newSummonsFromPhase: BattleEnemy[] = [];
  const statsRecalculationNeededForEnemyIds: string[] = [];
  const newPassiveAttackEvents: AttackEvent[] = [];
  const statusEffectsToApplyFromPassives: Array<{ targetId: string, effect: StatusEffect }> = [];


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
        if (gameState.godModeActive && currentEnemies.some(e => e.uniqueBattleId === event.attackerId)) {
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
          // --- Warrior's Konterangriff & Unnachgiebigkeit ---
          if (heroToUpdate.definitionId === 'WARRIOR') {
            const konterLevel = heroToUpdate.skillLevels['WARRIOR_PASSIVE_COUNTERATTACK_01'] || 0;
            if (konterLevel > 0 && Math.random() < (0.05 + konterLevel * 0.02)) {
              const konterDamage = Math.max(1, Math.floor(heroToUpdate.calculatedStats.damage * (0.20 + konterLevel * 0.05)));
              newPassiveAttackEvents.push({ attackerId: heroToUpdate.uniqueBattleId, targetId: event.attackerId, damage: konterDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Counter Attack' });
              logMessages.push(`  ↳ ${heroToUpdate.name}'s Counter Attack hits back for ${konterDamage} damage!`);
            }
            const unnachLevel = heroToUpdate.skillLevels['WARRIOR_PASSIVE_DEFENSEBUFF_01'] || 0;
            if (unnachLevel > 0 && Math.random() < (0.10 + unnachLevel * 0.03)) {
                const defBuffPercent = 0.15 + unnachLevel * 0.05;
                const buffDef = STATUS_EFFECT_DEFINITIONS.WARRIOR_UNYIELDING_DEFENSE_BUFF;
                statusEffectsToApplyFromPassives.push({
                    targetId: heroToUpdate.uniqueBattleId,
                    effect: {
                        instanceId: `unyielding-${heroToUpdate.uniqueBattleId}-${Date.now()}`,
                        type: StatusEffectType.BUFF, name: buffDef.name, iconName: buffDef.iconName,
                        remainingDurationMs: buffDef.durationMs, sourceId: heroToUpdate.uniqueBattleId, appliedAtTick: gameState.battleState!.ticksElapsed,
                        statAffected: 'defense', modifierType: 'PERCENTAGE_ADDITIVE', value: defBuffPercent,
                    }
                });
                logMessages.push(`  ↳ ${heroToUpdate.name}'s Unyielding triggers, increasing Defense by ${(defBuffPercent*100).toFixed(0)}%!`);
            }
          }
          // --- Paladin's Schild des Rächers ---
          if (heroToUpdate.definitionId === 'PALADIN') {
            const raecherLevel = heroToUpdate.skillLevels['PALADIN_PASSIVE_AVENGERSHIELD_01'] || 0;
            if (raecherLevel > 0 && Math.random() < (0.10 + raecherLevel * 0.02)) {
              const raecherDamage = Math.max(1, Math.floor(heroToUpdate.calculatedStats.defense * (0.15 + raecherLevel * 0.05)));
              newPassiveAttackEvents.push({ attackerId: heroToUpdate.uniqueBattleId, targetId: event.attackerId, damage: raecherDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Avenger\'s Shield' });
              logMessages.push(`  ↳ ${heroToUpdate.name}'s Avenger's Shield deals ${raecherDamage} damage!`);
            }
          }
          // --- Elemental Mage's Arkane Absorption ---
          if (heroToUpdate.definitionId === 'ELEMENTAL_MAGE' && (heroToUpdate.skillLevels['MAGE_PASSIVE_ARCANEABSORPTION_01'] || 0) > 0) {
            const absorbLevel = heroToUpdate.skillLevels['MAGE_PASSIVE_ARCANEABSORPTION_01'];
            const procChance = 0.05 + absorbLevel * 0.01;
            if (Math.random() < procChance) {
                const manaGained = Math.floor(damageToApply * (0.15 + absorbLevel * 0.05));
                if (manaGained > 0) {
                    heroToUpdate.currentMana = Math.min(heroToUpdate.calculatedStats.maxMana || 0, heroToUpdate.currentMana + manaGained);
                    logMessages.push(`  ↳ ${heroToUpdate.name}'s Arcane Absorption recovers ${manaGained} Mana!`);
                }
            }
          }
        }

        if (heroToUpdate.currentHp <= 0 && updatedHeroes[heroTargetIndex].currentHp > 0) {
          logMessages.push(`${heroToUpdate.name} has been defeated!`);
        }
      }
      updatedHeroes[heroTargetIndex] = heroToUpdate;

      // --- Cleric's Heilige Vergeltung ---
      const clericsInParty = updatedHeroes.filter(h => h.definitionId === 'CLERIC' && h.currentHp > 0 && (h.skillLevels['CLERIC_PASSIVE_HOLYRETRIBUTION_01'] || 0) > 0);
      clericsInParty.forEach(cleric => {
        const skillLevel = cleric.skillLevels['CLERIC_PASSIVE_HOLYRETRIBUTION_01'];
        const procChance = 0.08 + skillLevel * 0.02;
        if (Math.random() < procChance) {
          const retributionDamage = Math.max(1, Math.floor((cleric.calculatedStats.healPower || 0) * (0.20 + skillLevel * 0.05)));
          newPassiveAttackEvents.push({ attackerId: cleric.uniqueBattleId, targetId: event.attackerId, damage: retributionDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Holy Retribution' });
          logMessages.push(`  ↳ ${cleric.name}'s Holy Retribution strikes ${ENEMY_DEFINITIONS[event.attackerId.split('_')[0]]?.name || 'Attacker'} for ${retributionDamage} holy damage!`);
        }
      });

      // --- Paladin's Standhafter Verteidiger (Refined: Buff Ally) ---
      const paladinsInParty = updatedHeroes.filter(h => h.definitionId === 'PALADIN' && h.currentHp > 0 && (h.skillLevels['PALADIN_PASSIVE_STEADFASTDEFENDER_01'] || 0) > 0);
      paladinsInParty.forEach(paladin => {
        const skillLevel = paladin.skillLevels['PALADIN_PASSIVE_STEADFASTDEFENDER_01'];
        const procChance = 0.08 + skillLevel * 0.02;
        const distanceSq = Math.pow(paladin.x - heroToUpdate.x, 2) + Math.pow(paladin.y - heroToUpdate.y, 2);
        if (heroToUpdate.uniqueBattleId !== paladin.uniqueBattleId && distanceSq < (150*150) && Math.random() < procChance) { // Range: 150 units
            const defBuffPercent = 0.10 + skillLevel * 0.04;
            const buffDef = STATUS_EFFECT_DEFINITIONS.PALADIN_DEFENDER_BUFF;
            statusEffectsToApplyFromPassives.push({
                targetId: heroToUpdate.uniqueBattleId, // Apply to the ally who was hit
                effect: {
                    instanceId: `steadfastDef-${heroToUpdate.uniqueBattleId}-${Date.now()}`,
                    type: StatusEffectType.BUFF, name: buffDef.name, iconName: buffDef.iconName,
                    remainingDurationMs: buffDef.durationMs, sourceId: paladin.uniqueBattleId, appliedAtTick: gameState.battleState!.ticksElapsed,
                    statAffected: 'defense', modifierType: 'PERCENTAGE_ADDITIVE', value: defBuffPercent,
                }
            });
            logMessages.push(`  ↳ ${paladin.name}'s Steadfast Defender grants ${heroToUpdate.name} +${(defBuffPercent*100).toFixed(0)}% Defense!`);
        }
      });


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

        // Archer's Abprallschuss (Ricochet Shot)
        const attackerHero = updatedHeroes.find(h => h.uniqueBattleId === event.attackerId);
        if (attackerHero && attackerHero.definitionId === 'ARCHER' && (attackerHero.skillLevels['ARCHER_PASSIVE_RICOCHET_01'] || 0) > 0 && !event.isHeal && !event.isDotDamage && event.damage > 0) {
            const ricochetLevel = attackerHero.skillLevels['ARCHER_PASSIVE_RICOCHET_01'];
            const procChance = 0.10 + ricochetLevel * 0.02;
            if (Math.random() < procChance) {
                const livingEnemies = updatedEnemies.filter(e => e.currentHp > 0 && e.uniqueBattleId !== enemyToUpdate.uniqueBattleId);
                if (livingEnemies.length > 0) {
                    const ricochetTarget = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
                    const ricochetDamagePercent = 0.30 + ricochetLevel * 0.05;
                    const ricochetDamage = Math.max(1, Math.floor((attackerHero.calculatedStats.damage * ricochetDamagePercent) - ricochetTarget.calculatedStats.defense));
                    newPassiveAttackEvents.push({ attackerId: attackerHero.uniqueBattleId, targetId: ricochetTarget.uniqueBattleId, damage: ricochetDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Ricochet Shot' });
                    logMessages.push(`  ↳ ${attackerHero.name}'s Ricochet Shot hits ${ricochetTarget.name} for ${ricochetDamage} damage!`);
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
                        if (!statsRecalculationNeededForEnemyIds.includes(enemyToUpdate.uniqueBattleId)) {
                            statsRecalculationNeededForEnemyIds.push(enemyToUpdate.uniqueBattleId);
                        }
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
                              calculatedStats: summonedEnemyStats,
                              uniqueBattleId: `${enemyId}_phaseSummon_${Date.now()}_${j}_${Math.random().toString(16).slice(2)}`,
                              currentHp: summonedEnemyStats.maxHp,
                              currentEnergyShield: summonedEnemyStats.maxEnergyShield || 0,
                              shieldRechargeDelayTicksRemaining: 0,
                              attackCooldown: (1000 / summonedEnemyStats.attackSpeed),
                              attackCooldownRemainingTicks: 0,
                              movementSpeed: 0, x: 0, y: 0,
                              statusEffects: [],
                              temporaryBuffs: [],
                              isElite: isElite,
                              currentSummonCooldownMs: summonedEnemyDef.summonAbility?.initialCooldownMs ?? summonedEnemyDef.summonAbility?.cooldownMs,
                              currentHealCooldownMs: summonedEnemyDef.healAbility?.initialCooldownMs ?? summonedEnemyDef.healAbility?.cooldownMs,
                              currentAoeAttackCooldownMs: summonedEnemyDef.aoeAttackCooldownBaseMs,
                              explosionTimerRemainingMs: summonedEnemyDef.explosionAbility?.timerMs,
                              specialAttackCooldownsRemaining: initialSummonCooldowns,
                              phases: summonedEnemyDef.phases ? JSON.parse(JSON.stringify(summonedEnemyDef.phases)) : undefined,
                              currentPhaseIndex: 0,
                              currentShieldHealCooldownMs: summonedEnemyDef.shieldHealAbility?.initialCooldownMs ?? summonedEnemyDef.shieldHealAbility?.cooldownMs,
                              currentPeriodicEffectCooldownMs: summonedEnemyDef.periodicEffectAbility?.initialCooldownMs ?? summonedEnemyDef.periodicEffectAbility?.cooldownMs,
                            };
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
  
  // Apply status effects from passive procs
  statusEffectsToApplyFromPassives.forEach(appliance => {
    let target: BattleHero | BattleEnemy | undefined;
    const heroTargetIndex = updatedHeroes.findIndex(h => h.uniqueBattleId === appliance.targetId);
    if (heroTargetIndex !== -1) {
        target = updatedHeroes[heroTargetIndex];
        const existingEffectIndex = target.statusEffects.findIndex(se => se.name === appliance.effect.name && se.type === appliance.effect.type);
        if (existingEffectIndex !== -1) {
            target.statusEffects[existingEffectIndex].remainingDurationMs = appliance.effect.remainingDurationMs;
            if (appliance.effect.statAffected && target.statusEffects[existingEffectIndex].statAffected === appliance.effect.statAffected) {
                target.statusEffects[existingEffectIndex].value = appliance.effect.value; // Update value if same stat/type
            }
        } else {
            target.statusEffects.push(appliance.effect);
        }
        if (appliance.effect.statAffected) statsRecalculationNeededForEnemyIds.push(target.uniqueBattleId); // Mark hero for recalc
        updatedHeroes[heroTargetIndex] = {...target}; // Ensure change is captured
    } else {
        const enemyTargetIndex = updatedEnemies.findIndex(e => e.uniqueBattleId === appliance.targetId);
        if (enemyTargetIndex !== -1) {
            target = updatedEnemies[enemyTargetIndex];
            const existingEffectIndex = target.statusEffects.findIndex(se => se.name === appliance.effect.name && se.type === appliance.effect.type);
            if (existingEffectIndex !== -1) {
                target.statusEffects[existingEffectIndex].remainingDurationMs = appliance.effect.remainingDurationMs;
                 if (appliance.effect.statAffected && target.statusEffects[existingEffectIndex].statAffected === appliance.effect.statAffected) {
                    target.statusEffects[existingEffectIndex].value = appliance.effect.value;
                }
            } else {
                target.statusEffects.push(appliance.effect);
            }
            if (appliance.effect.statAffected) statsRecalculationNeededForEnemyIds.push(target.uniqueBattleId); // Mark enemy for recalc
            updatedEnemies[enemyTargetIndex] = {...target}; // Ensure change is captured
        }
    }
  });


  return { updatedHeroes, updatedEnemies, logMessages, newSummonsFromPhase, statsRecalculationNeededForEnemyIds, newPassiveAttackEvents };
};
