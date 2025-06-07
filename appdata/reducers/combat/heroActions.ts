
import { BattleHero, BattleEnemy, AttackEvent, GameState, GlobalBonuses, StatusEffect, SpecialAttackTargetType, StatusEffectType } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS, HERO_DEFINITIONS } from '../../gameData/index';
import { calculateSpecialAttackData, formatNumber } from '../../utils';
import { GAME_TICK_MS } from '../../constants';


export const processHeroActions = (
  currentHeroes: BattleHero[],
  currentEnemies: BattleEnemy[],
  battleTickDurationMs: number,
  gameState: GameState, // For full game state access if needed (e.g. god mode)
  globalBonuses: GlobalBonuses
): { updatedHeroes: BattleHero[], attackEvents: AttackEvent[], logMessages: string[] } => {
  const attackEvents: AttackEvent[] = [];
  const logMessages: string[] = [];
  let updatedHeroes = [...currentHeroes]; // Work with a mutable copy

  // Determine preferred target if one is selected
  let preferredTarget: BattleEnemy | undefined = undefined;
  if (gameState.battleState?.selectedTargetId) {
      preferredTarget = currentEnemies.find(e => e.uniqueBattleId === gameState.battleState!.selectedTargetId && e.currentHp > 0);
  }

  updatedHeroes = updatedHeroes.map(hero => {
    if (hero.currentHp <= 0) return hero;
    let heroCopy = { ...hero }; // Ensure we're working with a mutable copy within the map

    const isStunned = heroCopy.statusEffects && heroCopy.statusEffects.some(effect => effect.type === StatusEffectType.STUN);
    if (isStunned) {
      if (!logMessages.some(log => log.includes(`${heroCopy.name} is stunned`))) {
        logMessages.push(`${heroCopy.name} is stunned and cannot act!`);
      }
      return heroCopy; // Stunned hero skips action
    }

    let performedActionThisTick = false;

    // 1. Try Special Attacks
    for (const saId in heroCopy.specialAttackLevels) {
      if (heroCopy.specialAttackLevels[saId] > 0 && heroCopy.specialAttackCooldownsRemaining[saId] <= 0) {
        const specialAttackDef = SPECIAL_ATTACK_DEFINITIONS[saId];
        const livingEnemies = currentEnemies.filter(e => e.currentHp > 0);
        
        if (!specialAttackDef || (livingEnemies.length === 0 && specialAttackDef.targetType !== SpecialAttackTargetType.ALL_ALLIES && specialAttackDef.targetType !== SpecialAttackTargetType.SINGLE_ALLY)) {
          continue;
        }

        const specialAttackData = calculateSpecialAttackData(specialAttackDef, heroCopy.specialAttackLevels[saId]);
        if (specialAttackData.currentManaCost && heroCopy.currentMana < specialAttackData.currentManaCost) {
          if (!logMessages.some(log => log.includes(`${heroCopy.name} tries ${specialAttackDef.name} but lacks mana`))) {
            logMessages.push(`${heroCopy.name} tries ${specialAttackDef.name} but lacks mana (${formatNumber(heroCopy.currentMana)}/${specialAttackData.currentManaCost}).`);
          }
          continue;
        }

        logMessages.push(`${heroCopy.name} uses ${specialAttackDef.name}!`);
        if (specialAttackData.currentManaCost) {
          heroCopy.currentMana = Math.max(0, heroCopy.currentMana - specialAttackData.currentManaCost);
        }

        let targetsForAction: (BattleEnemy | BattleHero)[] = [];
        if (specialAttackDef.targetType === SpecialAttackTargetType.ALL_ENEMIES) {
          targetsForAction = [...livingEnemies];
        } else if (specialAttackDef.targetType === SpecialAttackTargetType.RANDOM_ENEMY) {
          if (livingEnemies.length > 0) targetsForAction.push(livingEnemies[Math.floor(Math.random() * livingEnemies.length)]);
        } else if (specialAttackDef.targetType === SpecialAttackTargetType.SINGLE_ENEMY) {
          if (preferredTarget) {
            targetsForAction.push(preferredTarget);
          } else if (livingEnemies.length > 0) {
            targetsForAction.push(livingEnemies[Math.floor(Math.random() * livingEnemies.length)]);
          }
        } else if (specialAttackDef.targetType === SpecialAttackTargetType.ALL_ALLIES) {
          targetsForAction = currentHeroes.filter(h => h.currentHp > 0);
        } else if (specialAttackDef.targetType === SpecialAttackTargetType.SINGLE_ALLY) {
          const livingAllies = currentHeroes.filter(h => h.currentHp > 0);
          if (livingAllies.length > 0) targetsForAction.push(livingAllies[Math.floor(Math.random() * livingAllies.length)]);
        }

        targetsForAction.forEach(targetData => {
          if (!targetData || targetData.currentHp <= 0) return;

          if (specialAttackData.currentHealAmount && specialAttackData.currentHealAmount > 0 && 'definitionId' in targetData) { // Target is a Hero
            const targetAsHero = targetData as BattleHero;
            attackEvents.push({
              attackerId: heroCopy.uniqueBattleId, targetId: targetAsHero.uniqueBattleId, damage: 0, isCrit: false,
              timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: specialAttackDef.name,
              isHeal: true, healAmount: specialAttackData.currentHealAmount
            });
          }

          if (specialAttackData.currentDamageMultiplier > 0 && 'loot' in targetData) { // Target is an Enemy
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

              // Handle Shield Bash Stun
              if (specialAttackDef.id === 'WARRIOR_SHIELD_BASH' && targetAsEnemy.currentHp > 0) {
                  const stunChance = 0.25 + (heroCopy.specialAttackLevels[saId] - 1) * 0.05;
                  const stunDurationMs = 1500;
                  if (Math.random() < stunChance) {
                      const stunEffect: StatusEffect = {
                          instanceId: `stun-${targetAsEnemy.uniqueBattleId}-${Date.now()}`, 
                          type: StatusEffectType.STUN, // Use enum member
                          name: 'Stun', // Name from definition or generic
                          remainingDurationMs: stunDurationMs,
                          sourceId: heroCopy.uniqueBattleId, 
                          appliedAtTick: gameState.battleState!.ticksElapsed,
                      };
                      logMessages.push(`  ↳ ${targetAsEnemy.name} is STUNNED by Shield Bash! (Effect needs application)`);
                  }
              }
            }
          }
        });

        heroCopy.specialAttackCooldownsRemaining = { ...heroCopy.specialAttackCooldownsRemaining, [saId]: specialAttackData.currentCooldownMs };
        heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed); // Reset basic attack cooldown
        performedActionThisTick = true;
        break; 
      }
    }

    // 2. Try Basic Action (Attack or Heal) if no special was used
    if (!performedActionThisTick && heroCopy.attackCooldown <= 0) {
      if (heroCopy.definitionId === 'CLERIC' && (heroCopy.skillLevels['CSK001'] || 0) > 0) { // Cleric Heal Logic
        const livingAlliesNeedingHeal = currentHeroes
          .filter(ally => ally.uniqueBattleId !== heroCopy.uniqueBattleId && ally.currentHp > 0 && ally.currentHp < ally.calculatedStats.maxHp)
          .sort((a, b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp));

        if (livingAlliesNeedingHeal.length > 0) {
          const healTarget = livingAlliesNeedingHeal[0];
          const finalHealAmount = Math.max(1, Math.floor(heroCopy.calculatedStats.healPower || 0));
          attackEvents.push({
            attackerId: heroCopy.uniqueBattleId, targetId: healTarget.uniqueBattleId, damage: 0, isCrit: false,
            timestamp: Date.now() + Math.random(), isHeal: true, healAmount: finalHealAmount
          });
           logMessages.push(`${heroCopy.name} heals ${healTarget.name} for ${finalHealAmount} HP.`);
          heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed);
        } else { // If no allies need heal, Cleric does a weak attack
            const livingEnemiesForAttack = currentEnemies.filter(e => e.currentHp > 0);
            let targetEnemyData: BattleEnemy | undefined;
            if (preferredTarget) {
                targetEnemyData = preferredTarget;
            } else if (livingEnemiesForAttack.length > 0) {
                targetEnemyData = livingEnemiesForAttack[Math.floor(Math.random() * livingEnemiesForAttack.length)];
            }

             if (targetEnemyData) {
                let damageDealt = Math.max(1, Math.floor((heroCopy.calculatedStats.damage * 0.25) - targetEnemyData.calculatedStats.defense)); // Cleric weak attack
                attackEvents.push({ attackerId: heroCopy.uniqueBattleId, targetId: targetEnemyData.uniqueBattleId, damage: damageDealt, isCrit: false, timestamp: Date.now() + Math.random() });
                logMessages.push(`${heroCopy.name} weakly attacks ${targetEnemyData.name} for ${damageDealt} damage.`);
             }
             heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed);
        }
      } else { // Standard Attack Logic for non-Clerics or Clerics without heal skill
        const livingEnemiesForAttack = currentEnemies.filter(e => e.currentHp > 0);
        let targetEnemyData: BattleEnemy | undefined;

        if (preferredTarget) {
            targetEnemyData = preferredTarget;
        } else if (livingEnemiesForAttack.length > 0) {
            targetEnemyData = livingEnemiesForAttack[Math.floor(Math.random() * livingEnemiesForAttack.length)];
        }

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
        }
        heroCopy.attackCooldown = (1000 / heroCopy.calculatedStats.attackSpeed);
      }
    }
    return heroCopy;
  });

  return { updatedHeroes, attackEvents, logMessages };
};
