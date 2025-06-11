
import { BattleHero, BattleEnemy, AttackEvent, GameState, GlobalBonuses, StatusEffect, SpecialAttackTargetType, StatusEffectType, HeroStats, PlayerHeroState } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, STATUS_EFFECT_DEFINITIONS } from '../../gameData/index';
import { calculateSpecialAttackData, formatNumber } from '../../utils';
import { GAME_TICK_MS } from '../../constants';

const findNearbyEnemy = (attacker: BattleHero, currentTarget: BattleEnemy, enemies: BattleEnemy[], maxDistanceSq: number = 100*100): BattleEnemy | null => {
  let closestOtherEnemy: BattleEnemy | null = null;
  let minDistanceToOtherSq = maxDistanceSq; // Max range for cleave

  for (const enemy of enemies) {
    if (enemy.uniqueBattleId === currentTarget.uniqueBattleId || enemy.currentHp <= 0) continue;
    const dx = enemy.x - attacker.x;
    const dy = enemy.y - attacker.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < minDistanceToOtherSq) {
      minDistanceToOtherSq = distSq;
      closestOtherEnemy = enemy;
    }
  }
  return closestOtherEnemy;
};

export const processHeroActions = (
  currentHeroes: BattleHero[],
  currentEnemies: BattleEnemy[],
  battleTickDurationMs: number,
  gameState: GameState, 
  globalBonuses: GlobalBonuses
): { updatedHeroes: BattleHero[], attackEvents: AttackEvent[], logMessages: string[], statusEffectsToApplyToEnemies?: Array<{ enemyId: string, effect: StatusEffect }>, newSummons?: BattleEnemy[] } => {
  const attackEvents: AttackEvent[] = [];
  const logMessages: string[] = [];
  let updatedHeroes = [...currentHeroes]; 
  const statusEffectsToApplyToEnemies: Array<{ enemyId: string, effect: StatusEffect }> = [];
  const newSummons: BattleEnemy[] = []; // For potential future use if heroes can summon

  let preferredTarget: BattleEnemy | undefined = undefined;
  if (gameState.battleState?.selectedTargetId) {
      preferredTarget = currentEnemies.find(e => e.uniqueBattleId === gameState.battleState!.selectedTargetId && e.currentHp > 0);
  }

  updatedHeroes = updatedHeroes.map(hero => {
    if (hero.currentHp <= 0) return hero;
    let heroCopy = { ...hero, statusEffects: [...(hero.statusEffects || [])], temporaryBuffs: [...(hero.temporaryBuffs || [])] };
    let performedActionThisTick = false;

    const isStunned = heroCopy.statusEffects && heroCopy.statusEffects.some(effect => effect.type === StatusEffectType.STUN);
    if (isStunned) {
      if (!logMessages.some(log => log.includes(`${heroCopy.name} is stunned`))) {
        logMessages.push(`${heroCopy.name} is stunned and cannot act!`);
      }
      return heroCopy;
    }

    // 1. Try Special Attacks
    for (const saId in heroCopy.specialAttackLevels) {
      if (heroCopy.specialAttackLevels[saId] > 0 && heroCopy.specialAttackCooldownsRemaining[saId] <= 0) {
        const specialAttackDef = SPECIAL_ATTACK_DEFINITIONS[saId];
        const livingEnemies = currentEnemies.filter(e => e.currentHp > 0 && !e.isDying);
        
        if (!specialAttackDef || (livingEnemies.length === 0 && specialAttackDef.targetType !== SpecialAttackTargetType.ALL_ALLIES && specialAttackDef.targetType !== SpecialAttackTargetType.SINGLE_ALLY)) {
          continue;
        }

        let specialAttackData = calculateSpecialAttackData(specialAttackDef, heroCopy.specialAttackLevels[saId]);
        let finalManaCost = specialAttackData.currentManaCost || 0;

        // Mage's Unstable Magic
        if (heroCopy.definitionId === 'ELEMENTAL_MAGE' && (heroCopy.skillLevels['MAGE_PASSIVE_UNSTABLEMAGIC_01'] || 0) > 0) {
            const unstableMagicLevel = heroCopy.skillLevels['MAGE_PASSIVE_UNSTABLEMAGIC_01'];
            const procChance = (0.03 + unstableMagicLevel * 0.01); 
            if (Math.random() < procChance) {
                finalManaCost = 0;
                const cooldownIncreaseFactor = 1 + (0.30 - unstableMagicLevel * 0.02); 
                specialAttackData.currentCooldownMs = Math.floor(specialAttackData.currentCooldownMs * cooldownIncreaseFactor);
                logMessages.push(`${heroCopy.name}'s Unstable Magic triggered! ${specialAttackDef.name} costs 0 Mana but has increased cooldown.`);
            }
        }


        if (finalManaCost > 0 && heroCopy.currentMana < finalManaCost) {
          if (!logMessages.some(log => log.includes(`${heroCopy.name} tries ${specialAttackDef.name} but lacks mana`))) {
            logMessages.push(`${heroCopy.name} tries ${specialAttackDef.name} but lacks mana (${formatNumber(heroCopy.currentMana)}/${finalManaCost}).`);
          }
          continue;
        }

        logMessages.push(`${heroCopy.name} uses ${specialAttackDef.name}!`);
        if (finalManaCost > 0) {
          heroCopy.currentMana = Math.max(0, heroCopy.currentMana - finalManaCost);
        }

        let targetsForAction: (BattleEnemy | BattleHero)[] = [];
        switch(specialAttackDef.targetType) {
            case SpecialAttackTargetType.SINGLE_ENEMY:
                if (preferredTarget) targetsForAction.push(preferredTarget);
                else if (livingEnemies.length > 0) targetsForAction.push(livingEnemies[Math.floor(Math.random() * livingEnemies.length)]);
                break;
            case SpecialAttackTargetType.ALL_ENEMIES: targetsForAction = [...livingEnemies]; break;
            case SpecialAttackTargetType.RANDOM_ENEMY: if (livingEnemies.length > 0) targetsForAction.push(livingEnemies[Math.floor(Math.random() * livingEnemies.length)]); break;
            case SpecialAttackTargetType.ALL_ALLIES: targetsForAction = currentHeroes.filter(h => h.currentHp > 0); break;
            case SpecialAttackTargetType.SINGLE_ALLY:
                const livingAllies = currentHeroes.filter(h => h.currentHp > 0);
                if (livingAllies.length > 0) targetsForAction.push(livingAllies.sort((a,b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp))[0] || heroCopy);
                break;
        }


        targetsForAction.forEach(targetData => {
          if (!targetData || targetData.currentHp <= 0 || ('isDying' in targetData && (targetData as BattleEnemy).isDying)) return;

          if (specialAttackData.currentHealAmount && specialAttackData.currentHealAmount > 0 && 'definitionId' in targetData) { 
            const targetAsHero = targetData as BattleHero;
            attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetAsHero.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: specialAttackDef.name, isHeal: true, healAmount: specialAttackData.currentHealAmount });
          }

          if (specialAttackData.currentDamageMultiplier > 0 && 'loot' in targetData) { 
            const targetAsEnemy = targetData as BattleEnemy;
            for (let hit = 0; hit < specialAttackData.currentNumHits; hit++) {
              if (targetAsEnemy.currentHp <= 0) break;
              let damageDealt = Math.max(1, (heroCopy.calculatedStats.damage * specialAttackData.currentDamageMultiplier) - targetAsEnemy.calculatedStats.defense);
              let isCrit = false;
              if (heroCopy.calculatedStats.critChance && Math.random() < heroCopy.calculatedStats.critChance) {
                damageDealt = Math.floor(damageDealt * (heroCopy.calculatedStats.critDamage || 1.5));
                isCrit = true;
              }
              logMessages.push(`  ↳ ${isCrit ? 'CRIT! ' : ''}${specialAttackDef.name} hits ${targetAsEnemy.name} for ${damageDealt} damage.`);
              attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetAsEnemy.uniqueBattleId, damage: damageDealt, isCrit, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: specialAttackDef.name });
              
              if (heroCopy.definitionId === 'ELEMENTAL_MAGE' && (heroCopy.skillLevels['MAGE_PASSIVE_ELEMENTALDISCHARGE_01'] || 0) > 0) {
                const dischargeLevel = heroCopy.skillLevels['MAGE_PASSIVE_ELEMENTALDISCHARGE_01'];
                const procChance = (0.08 + dischargeLevel * 0.02);
                if (Math.random() < procChance) {
                  const dischargeDamageMultiplier = 0.20 + dischargeLevel * 0.05;
                  const dischargeDamage = Math.max(1, Math.floor(heroCopy.calculatedStats.damage * dischargeDamageMultiplier));
                  logMessages.push(`  ↳ Elemental Discharge triggered, dealing ${dischargeDamage} AOE damage!`);
                  livingEnemies.forEach(aoeTarget => {
                    if (aoeTarget.currentHp > 0 && !aoeTarget.isDying) { 
                      const distSq = Math.pow(aoeTarget.x - targetAsEnemy.x, 2) + Math.pow(aoeTarget.y - targetAsEnemy.y, 2);
                      if (distSq < (50*50)) { 
                         let finalAoeDmg = Math.max(1, dischargeDamage - aoeTarget.calculatedStats.defense);
                         attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: aoeTarget.uniqueBattleId, damage: finalAoeDmg, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Elemental Discharge' });
                      }
                    }
                  });
                }
              }
            }
          }
        });

        heroCopy.specialAttackCooldownsRemaining = { ...heroCopy.specialAttackCooldownsRemaining, [saId]: specialAttackData.currentCooldownMs };
        heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed); 
        performedActionThisTick = true;
        break; 
      }
    }

    if (!performedActionThisTick && heroCopy.attackCooldown <= 0) {
      if (heroCopy.definitionId === 'CLERIC' && (heroCopy.skillLevels['CSK001'] || 0) > 0) {
        const livingAlliesNeedingHeal = currentHeroes
          .filter(ally => ally.uniqueBattleId !== heroCopy.uniqueBattleId && ally.currentHp > 0 && ally.currentHp < ally.calculatedStats.maxHp)
          .sort((a, b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp));
        let healTarget = livingAlliesNeedingHeal.length > 0 ? livingAlliesNeedingHeal[0] : (heroCopy.currentHp < heroCopy.calculatedStats.maxHp ? heroCopy : null);

        if (healTarget) {
          const finalHealAmount = Math.max(1, Math.floor(heroCopy.calculatedStats.healPower || 0));
          attackEvents.push({
            attackerId: heroCopy.uniqueBattleId, targetId: healTarget.uniqueBattleId, damage: 0, isCrit: false,
            timestamp: Date.now() + Math.random(), isHeal: true, healAmount: finalHealAmount
          });
           logMessages.push(`${heroCopy.name} heals ${healTarget.name} for ${finalHealAmount} HP.`);
          
          const divineFavorLevel = heroCopy.skillLevels['CLERIC_PASSIVE_DIVINEFAVOR_01'] || 0;
          if (divineFavorLevel > 0) {
            const procChance = 0.10 + divineFavorLevel * 0.02;
            if (Math.random() < procChance) {
              if (Math.random() < 0.5 && healTarget.statusEffects.some(se => se.type === StatusEffectType.DEBUFF)) { 
                const debuffs = healTarget.statusEffects.filter(se => se.type === StatusEffectType.DEBUFF);
                if (debuffs.length > 0) {
                  const debuffToRemove = debuffs[Math.floor(Math.random() * debuffs.length)];
                  logMessages.push(`  ↳ Divine Favor cleansed ${debuffToRemove.name} from ${healTarget.name}!`);
                }
              } else { 
                const shieldAmount = Math.floor(finalHealAmount * (0.15 + divineFavorLevel * 0.05));
                const tempShieldBuff: StatusEffect = {
                    instanceId: `divineShield-${healTarget.uniqueBattleId}-${Date.now()}`,
                    type: StatusEffectType.BUFF,
                    name: STATUS_EFFECT_DEFINITIONS.CLERIC_DIVINE_FAVOR_SHIELD.name,
                    iconName: STATUS_EFFECT_DEFINITIONS.CLERIC_DIVINE_FAVOR_SHIELD.iconName,
                    remainingDurationMs: STATUS_EFFECT_DEFINITIONS.CLERIC_DIVINE_FAVOR_SHIELD.durationMs,
                    sourceId: heroCopy.uniqueBattleId,
                    appliedAtTick: gameState.battleState!.ticksElapsed,
                    statAffected: 'maxHp',
                    modifierType: 'FLAT',
                    value: shieldAmount
                };
                statusEffectsToApplyToEnemies.push({ enemyId: healTarget.uniqueBattleId, effect: tempShieldBuff }); 
                logMessages.push(`  ↳ Divine Favor grants ${healTarget.name} a ${shieldAmount} HP shield!`);
              }
            }
          }

          const waveOfLightLevel = heroCopy.skillLevels['CLERIC_PASSIVE_LIGHTSURGE_01'] || 0;
          if (waveOfLightLevel > 0) {
            const procChance = 0.10 + waveOfLightLevel * 0.03;
            if (Math.random() < procChance) {
              const secondaryTargets = currentHeroes.filter(h => h.uniqueBattleId !== heroCopy.uniqueBattleId && h.uniqueBattleId !== healTarget!.uniqueBattleId && h.currentHp > 0 && h.currentHp < h.calculatedStats.maxHp)
                                                  .sort((a,b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp));
              if (secondaryTargets.length > 0) {
                const secondaryHealTarget = secondaryTargets[0];
                const secondaryHealAmount = Math.floor(finalHealAmount * (0.30 + waveOfLightLevel * 0.04));
                if (secondaryHealAmount > 0) {
                  attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: secondaryHealTarget.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), isHeal: true, healAmount: secondaryHealAmount });
                  logMessages.push(`  ↳ Wave of Light bounces to ${secondaryHealTarget.name}, healing for ${secondaryHealAmount} HP.`);
                }
              }
            }
          }
          heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed);
        } else { 
            const livingEnemiesForAttack = currentEnemies.filter(e => e.currentHp > 0 && !e.isDying);
            let targetEnemyData: BattleEnemy | undefined;
            if (preferredTarget) targetEnemyData = preferredTarget;
            else if (livingEnemiesForAttack.length > 0) targetEnemyData = livingEnemiesForAttack[Math.floor(Math.random() * livingEnemiesForAttack.length)];
            if (targetEnemyData) {
                let damageDealt = Math.max(1, Math.floor((heroCopy.calculatedStats.damage * 0.25) - targetEnemyData.calculatedStats.defense));
                attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetEnemyData.uniqueBattleId, damage: damageDealt, isCrit: false, timestamp: Date.now() + Math.random() });
                logMessages.push(`${heroCopy.name} weakly attacks ${targetEnemyData.name} for ${damageDealt} damage.`);
            }
            heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed);
        }
      } else { 
        const livingEnemiesForAttack = currentEnemies.filter(e => e.currentHp > 0 && !e.isDying);
        let targetEnemyData: BattleEnemy | undefined;
        if (preferredTarget) targetEnemyData = preferredTarget;
        else if (livingEnemiesForAttack.length > 0) targetEnemyData = livingEnemiesForAttack[Math.floor(Math.random() * livingEnemiesForAttack.length)];

        if (targetEnemyData) {
            let damageDealt = Math.max(1, heroCopy.calculatedStats.damage - targetEnemyData.calculatedStats.defense);
            let isCrit = false;
            if (heroCopy.calculatedStats.critChance && Math.random() < heroCopy.calculatedStats.critChance) {
              damageDealt = Math.floor(damageDealt * (heroCopy.calculatedStats.critDamage || 1.5));
              logMessages.push(`${heroCopy.name} CRITS ${targetEnemyData.name} for ${damageDealt} damage!`);
              isCrit = true;
            } else {
              logMessages.push(`${heroCopy.name} attacks ${targetEnemyData.name} for ${damageDealt} damage.`);
            }
            attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetEnemyData.uniqueBattleId, damage: damageDealt, isCrit, timestamp: Date.now() + Math.random() });

            if (heroCopy.definitionId === 'WARRIOR' && (heroCopy.skillLevels['WARRIOR_PASSIVE_STUNBLOW_01'] || 0) > 0) {
                const skillLevel = heroCopy.skillLevels['WARRIOR_PASSIVE_STUNBLOW_01'];
                const procChance = 0.08 + skillLevel * 0.02;
                if (Math.random() < procChance) {
                    const bonusDamagePercent = 0.30 + skillLevel * 0.10;
                    const bonusDamage = Math.floor(heroCopy.calculatedStats.damage * bonusDamagePercent);
                    attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetEnemyData.uniqueBattleId, damage: bonusDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Overwhelming Strike' });
                    logMessages.push(`  ↳ Overwhelming Strike deals an extra ${bonusDamage} damage!`);
                    const stunEffect: StatusEffect = {
                        instanceId: `overwhelmStun-${targetEnemyData.uniqueBattleId}-${Date.now()}`,
                        type: StatusEffectType.STUN,
                        name: 'Overwhelmed',
                        remainingDurationMs: 500, 
                        sourceId: heroCopy.uniqueBattleId,
                        appliedAtTick: gameState.battleState!.ticksElapsed,
                        iconName: 'STUNNED'
                    };
                    statusEffectsToApplyToEnemies.push({ enemyId: targetEnemyData.uniqueBattleId, effect: stunEffect });
                    logMessages.push(`  ↳ ${targetEnemyData.name} is stunned by Overwhelming Strike!`);
                }
            }

            if (heroCopy.definitionId === 'WARRIOR' && (heroCopy.skillLevels['WARRIOR_PASSIVE_CLEAVE_01'] || 0) > 0) {
                const skillLevel = heroCopy.skillLevels['WARRIOR_PASSIVE_CLEAVE_01'];
                const procChance = 0.07 + skillLevel * 0.02;
                if (Math.random() < procChance) {
                    const cleaveTarget = findNearbyEnemy(heroCopy, targetEnemyData, livingEnemiesForAttack);
                    if (cleaveTarget) {
                        const cleaveDamagePercent = 0.25 + skillLevel * 0.05;
                        const cleaveDamage = Math.max(1, Math.floor((heroCopy.calculatedStats.damage * cleaveDamagePercent) - cleaveTarget.calculatedStats.defense));
                        attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: cleaveTarget.uniqueBattleId, damage: cleaveDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Cleave' });
                        logMessages.push(`  ↳ Cleave hits ${cleaveTarget.name} for ${cleaveDamage} damage!`);
                    }
                }
            }
            
            if (heroCopy.definitionId === 'ARCHER' && (heroCopy.skillLevels['ARCHER_PASSIVE_RAPIDFIRE_01'] || 0) > 0) {
                const skillLevel = heroCopy.skillLevels['ARCHER_PASSIVE_RAPIDFIRE_01'];
                const procChance = 0.05 + skillLevel * 0.01;
                if (Math.random() < procChance) {
                    logMessages.push(`  ↳ Rapid Fire triggers for ${heroCopy.name}!`);
                    let rapidFireDamage = Math.max(1, heroCopy.calculatedStats.damage - targetEnemyData.calculatedStats.defense); 
                    attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetEnemyData.uniqueBattleId, damage: rapidFireDamage, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: 'Rapid Fire' });
                }
            }

            if (heroCopy.definitionId === 'ARCHER' && (heroCopy.skillLevels['ARCHER_PASSIVE_CRIPPLESHOT_01'] || 0) > 0) {
                const skillLevel = heroCopy.skillLevels['ARCHER_PASSIVE_CRIPPLESHOT_01'];
                const procChance = 0.08 + skillLevel * 0.02;
                if (Math.random() < procChance) {
                    const slowPercent = -(0.15 + skillLevel * 0.03); 
                    const slowEffectDef = STATUS_EFFECT_DEFINITIONS.ARCHER_CRIPPLING_SHOT_SLOW;
                    const crippleEffect: StatusEffect = {
                        instanceId: `cripple-${targetEnemyData.uniqueBattleId}-${Date.now()}`,
                        definitionId: 'ARCHER_CRIPPLING_SHOT_SLOW',
                        type: StatusEffectType.DEBUFF,
                        name: slowEffectDef.name,
                        iconName: slowEffectDef.iconName,
                        remainingDurationMs: slowEffectDef.durationMs,
                        sourceId: heroCopy.uniqueBattleId,
                        appliedAtTick: gameState.battleState!.ticksElapsed,
                        statAffected: 'attackSpeed',
                        modifierType: 'PERCENTAGE_ADDITIVE',
                        value: slowPercent
                    };
                    statusEffectsToApplyToEnemies.push({ enemyId: targetEnemyData.uniqueBattleId, effect: crippleEffect });
                    logMessages.push(`  ↳ Crippling Shot slows ${targetEnemyData.name}'s attack speed!`);
                }
            }
        }
        heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed);
      }
    }
    return heroCopy;
  });

  return { updatedHeroes, attackEvents, logMessages, statusEffectsToApplyToEnemies, newSummons };
};
