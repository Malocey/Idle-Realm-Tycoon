
import { GameState, GameAction, ActionBattleState, BattleHero, BattleEnemy, HeroStats, GlobalBonuses, ColosseumWaveDefinition, Cost, ResourceType, AttackEvent, StatusEffect, ParticleEvent, Projectile, GameNotification, EnemyDefinition, PlayerHeroState, SpecialAttackDefinition, SpecialAttackTargetType, ActionBattleParticipantAIState, StatusEffectDefinition } from '../types';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS, SKILL_TREES, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, SHARD_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, RUN_BUFF_DEFINITIONS, COLOSSEUM_WAVE_DEFINITIONS, BUILDING_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../gameData/index';
import { calculateHeroStats, calculateWaveEnemyStats, formatNumber, getExpToNextHeroLevel, calculateSpecialAttackData } from '../utils';
import { 
    NOTIFICATION_ICONS, GAME_TICK_MS, ARENA_HEIGHT_UNITS, ARENA_WIDTH_UNITS, PARTICIPANT_SIZE_UNITS, 
    MOVEMENT_SPEED_UNITS_PER_TICK, RANGED_ATTACK_RANGE_UNITS_DEFAULT, ATTACK_RANGE_UNITS, 
    WAVE_CLEAR_COOLDOWN_TICKS, ATTACK_ANIMATION_TICKS, DEATH_ANIMATION_TICKS, 
    PROJECTILE_SPEED_PER_TICK, MAX_PROJECTILE_TRAIL_SEGMENTS 
} from '../constants'; 
import { ICONS } from '../components/Icons';
// Import both legacy and new AI systems, and specific legacy helper functions
import { 
    processParticipantAI_legacy, 
    findClosestTarget_legacy, 
    checkCollision_legacy 
} from './actionBattleAI_legacy';
import { processParticipantAI_behaviorTree } from '../ai/actionBattle/behaviorTreeAI';


const calculateColosseumEnemyStats = (baseEnemyDef: EnemyDefinition, colosseumWaveNumber: number): HeroStats => {
  const scaledStats: HeroStats = { ...baseEnemyDef.stats };
  const difficultyScale = 1 + (colosseumWaveNumber - 1) * 0.05; 
  scaledStats.maxHp = Math.floor(baseEnemyDef.stats.maxHp * difficultyScale);
  scaledStats.damage = Math.floor(baseEnemyDef.stats.damage * difficultyScale);
  scaledStats.defense = Math.floor(baseEnemyDef.stats.defense * difficultyScale);
  scaledStats.attackSpeed = baseEnemyDef.stats.attackSpeed;
  scaledStats.critChance = baseEnemyDef.stats.critChance;
  scaledStats.critDamage = baseEnemyDef.stats.critDamage;

  // Scale shield stats if they exist
  if (baseEnemyDef.stats.maxEnergyShield) {
    scaledStats.maxEnergyShield = Math.floor(baseEnemyDef.stats.maxEnergyShield * difficultyScale); // Example: scale shield with HP factor
    scaledStats.energyShieldRechargeRate = baseEnemyDef.stats.energyShieldRechargeRate;
    scaledStats.energyShieldRechargeDelay = baseEnemyDef.stats.energyShieldRechargeDelay;
  } else {
    scaledStats.maxEnergyShield = 0;
  }
  return scaledStats;
};

export const actionBattleReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'START_ACTION_BATTLE' | 'ACTION_BATTLE_TICK' | 'END_ACTION_BATTLE' | 'COLOSSEUM_SPAWN_NEXT_WAVE' | 'COLOSSEUM_WAVE_CLEARED' | 'COLOSSEUM_ENEMY_TAKE_DAMAGE' | 'COLOSSEUM_HERO_TAKE_DAMAGE' | 'ACTION_BATTLE_SET_KEY_PRESSED' | 'ACTION_BATTLE_TOGGLE_AUTO_MODE' | 'ACTION_BATTLE_HERO_USE_SPECIAL' }>,
  globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'START_ACTION_BATTLE': {
      const heroInstances: BattleHero[] = state.heroes.map((h, idx) => {
        const heroDef = HERO_DEFINITIONS[h.definitionId];
        const skillTree = SKILL_TREES[heroDef.skillTreeId];
        const calculatedStats = calculateHeroStats(h, heroDef, skillTree, state, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, globalBonuses, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS);
        
        const x = 50 + idx * (PARTICIPANT_SIZE_UNITS + 20);
        const y = ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS - 50;

        return {
          ...heroDef,
          ...h,
          attackType: heroDef.attackType || 'MELEE',
          rangedAttackRangeUnits: heroDef.rangedAttackRangeUnits || RANGED_ATTACK_RANGE_UNITS_DEFAULT,
          uniqueBattleId: `${h.definitionId}_action_${idx}_${Date.now()}`,
          currentHp: calculatedStats.maxHp,
          currentMana: calculatedStats.maxMana || 0,
          calculatedStats,
          attackCooldown: 0, 
          attackCooldownRemainingTicks: 0,
          movementSpeed: MOVEMENT_SPEED_UNITS_PER_TICK,
          specialAttackCooldownsRemaining: {}, 
          statusEffects: [],
          temporaryBuffs: [],
          x,
          y,
          targetId: null,
          isAttackingTicksRemaining: 0,
          potentialTargetId: null,
          debugMovementTarget: undefined,
          aiDecisionCooldownTicks: 0,
          aiState: 'IDLE' as ActionBattleParticipantAIState,
          aiRepositioningTarget: undefined,
          currentEnergyShield: calculatedStats.maxEnergyShield || 0,
          shieldRechargeDelayTicksRemaining: 0,
        };
      });

      const initialActionBattleState: ActionBattleState = {
        heroInstances,
        enemyInstances: [],
        controlledHeroId: heroInstances.length > 0 ? heroInstances[0].uniqueBattleId : null,
        isAutoBattleActive: false,
        status: 'PREPARING',
        currentWaveNumber: 0,
        timeToNextWave: 0, 
        waveTimerMaxTicks: (10 * (1000 / GAME_TICK_MS)), 
        waveTimerRemainingTicks: 0,
        maxConcurrentEnemies: 15, 
        keysPressed: {},
        lastAttackEvents: [],
        lastParticleEffectEvents: [],
        activeCanvasParticles: [],
        activeProjectiles: [],
        currentColosseumLoot: [],
        currentColosseumExpForPool: 0,
      };

      const nextStateWithBattle = { ...state, actionBattleState: initialActionBattleState };
      return actionBattleReducer(nextStateWithBattle, { type: 'COLOSSEUM_SPAWN_NEXT_WAVE' }, globalBonuses);
    }
    
    case 'ACTION_BATTLE_SET_KEY_PRESSED': {
        if (!state.actionBattleState) return state;
        return {
            ...state,
            actionBattleState: {
                ...state.actionBattleState,
                keysPressed: {
                    ...state.actionBattleState.keysPressed,
                    [action.payload.key]: action.payload.pressed,
                }
            }
        };
    }

    case 'ACTION_BATTLE_TOGGLE_AUTO_MODE': {
        if (!state.actionBattleState) return state;
        return {
            ...state,
            actionBattleState: {
                ...state.actionBattleState,
                isAutoBattleActive: !state.actionBattleState.isAutoBattleActive,
            }
        };
    }

    case 'ACTION_BATTLE_HERO_USE_SPECIAL': {
        if (!state.actionBattleState || !state.actionBattleState.controlledHeroId || state.actionBattleState.isAutoBattleActive) return state;
        
        const { heroInstances, enemyInstances, controlledHeroId, lastAttackEvents, lastParticleEffectEvents } = state.actionBattleState;
        const controlledHeroIndex = heroInstances.findIndex(h => h.uniqueBattleId === controlledHeroId);
        if (controlledHeroIndex === -1) return state;

        let controlledHero = { ...heroInstances[controlledHeroIndex] };
        if (controlledHero.currentHp <= 0 || controlledHero.statusEffects.some(se => se.type === 'STUN')) return state;

        let specialActivated = false;
        for (const saId in controlledHero.specialAttackLevels) {
            if (controlledHero.specialAttackLevels[saId] > 0 && controlledHero.specialAttackCooldownsRemaining[saId] <= 0) {
                const specialAttackDef = SPECIAL_ATTACK_DEFINITIONS[saId];
                if (!specialAttackDef) continue;

                const specialAttackData = calculateSpecialAttackData(specialAttackDef, controlledHero.specialAttackLevels[saId]);
                if (specialAttackData.currentManaCost && controlledHero.currentMana < specialAttackData.currentManaCost) continue;
                
                controlledHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS; 
                controlledHero.specialAttackCooldownsRemaining = { ...controlledHero.specialAttackCooldownsRemaining, [saId]: specialAttackData.currentCooldownMs };
                if (specialAttackData.currentManaCost) {
                    controlledHero.currentMana = Math.max(0, controlledHero.currentMana - specialAttackData.currentManaCost);
                }
                
                const newAttackEventsForSpecial: AttackEvent[] = [];
                
                const livingEnemies = enemyInstances.filter(e => e.currentHp > 0 && !e.isDying);
                const livingAllies = heroInstances.filter(h => h.currentHp > 0);
                let targetsForAction: (BattleHero | BattleEnemy)[] = [];

                switch(specialAttackDef.targetType) {
                    case SpecialAttackTargetType.SINGLE_ENEMY:
                        if (controlledHero.potentialTargetId) {
                            const target = livingEnemies.find(e => e.uniqueBattleId === controlledHero.potentialTargetId);
                            if (target) targetsForAction.push(target);
                        } else if (livingEnemies.length > 0) { 
                            targetsForAction.push(livingEnemies[0]);
                        }
                        break;
                    case SpecialAttackTargetType.ALL_ENEMIES:
                        targetsForAction = [...livingEnemies];
                        break;
                    case SpecialAttackTargetType.RANDOM_ENEMY:
                        if (livingEnemies.length > 0) targetsForAction.push(livingEnemies[Math.floor(Math.random() * livingEnemies.length)]);
                        break;
                    case SpecialAttackTargetType.ALL_ALLIES:
                        targetsForAction = [...livingAllies];
                        break;
                    case SpecialAttackTargetType.SINGLE_ALLY:
                        if (specialAttackData.currentHealAmount && specialAttackData.currentHealAmount > 0) {
                             const mostWoundedAlly = livingAllies.sort((a,b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp))[0];
                             if(mostWoundedAlly) targetsForAction.push(mostWoundedAlly);
                        } else if (livingAllies.length > 0) { 
                            targetsForAction.push(controlledHero); 
                        }
                        break;
                }

                targetsForAction.forEach(targetData => {
                    if (!targetData || targetData.currentHp <= 0 || ('isDying' in targetData && (targetData as BattleEnemy).isDying)) return;

                    specialAttackDef.effects.forEach(effectDef => {
                        if (specialAttackData.currentHealAmount && specialAttackData.currentHealAmount > 0 && 'definitionId' in targetData) { 
                            const targetAsHero = targetData as BattleHero;
                            newAttackEventsForSpecial.push({ attackerId: controlledHero.uniqueBattleId, targetId: targetAsHero.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: specialAttackDef.name, isHeal: true, healAmount: specialAttackData.currentHealAmount });
                        }
                        if (specialAttackData.currentDamageMultiplier > 0 && 'loot' in targetData) { 
                            const targetAsEnemy = targetData as BattleEnemy;
                            for (let hit = 0; hit < specialAttackData.currentNumHits; hit++) {
                                if (targetAsEnemy.currentHp <= 0) break;
                                let damageDealt = Math.max(1, (controlledHero.calculatedStats.damage * specialAttackData.currentDamageMultiplier) - targetAsEnemy.calculatedStats.defense);
                                let isCrit = false;
                                if (controlledHero.calculatedStats.critChance && Math.random() < controlledHero.calculatedStats.critChance) {
                                    damageDealt = Math.floor(damageDealt * (controlledHero.calculatedStats.critDamage || 1.5));
                                    isCrit = true;
                                }
                                newAttackEventsForSpecial.push({ attackerId: controlledHero.uniqueBattleId, targetId: targetAsEnemy.uniqueBattleId, damage: damageDealt, isCrit, timestamp: Date.now() + Math.random(), isSpecialAttack: true, specialAttackName: specialAttackDef.name });
                            }
                        }
                    });
                });
                
                const updatedHeroInstances = [...heroInstances];
                updatedHeroInstances[controlledHeroIndex] = controlledHero;
                specialActivated = true;

                return {
                    ...state,
                    actionBattleState: {
                        ...state.actionBattleState,
                        heroInstances: updatedHeroInstances,
                        lastAttackEvents: [...lastAttackEvents, ...newAttackEventsForSpecial].slice(-10),
                    }
                };
            }
        }
        // If no special was activated, check for normal attack
        if (!specialActivated && controlledHero.attackCooldownRemainingTicks <= 0 && controlledHero.potentialTargetId) {
                 const targetEnemy = enemyInstances.find(e => e.uniqueBattleId === controlledHero.potentialTargetId && e.currentHp > 0 && !e.isDying);
                 if (targetEnemy) {
                    const attackRange = controlledHero.attackType === 'RANGED' ? (controlledHero.rangedAttackRangeUnits || RANGED_ATTACK_RANGE_UNITS_DEFAULT) : ATTACK_RANGE_UNITS;
                    const distanceToTargetSq = Math.pow((targetEnemy.x || 0) - (controlledHero.x || 0), 2) + Math.pow((targetEnemy.y || 0) - (controlledHero.y || 0), 2);
                    if (distanceToTargetSq <= attackRange * attackRange) {
                        controlledHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                        controlledHero.attackCooldownRemainingTicks = Math.floor((1000 / controlledHero.calculatedStats.attackSpeed) / GAME_TICK_MS);
                        const newAttackEventsForNormal: AttackEvent[] = [];
                        const newProjectilesForNormal: Projectile[] = [];

                        if (controlledHero.attackType === 'RANGED') {
                            newProjectilesForNormal.push({
                                id: `proj-${Date.now()}-${Math.random()}`, attackerId: controlledHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId,
                                originX: (controlledHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, originY: (controlledHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                                currentX: (controlledHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, currentY: (controlledHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                                targetX: (targetEnemy.x || 0) + PARTICIPANT_SIZE_UNITS / 2, targetY: (targetEnemy.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                                speed: PROJECTILE_SPEED_PER_TICK, damage: Math.max(1, controlledHero.calculatedStats.damage - targetEnemy.calculatedStats.defense),
                                isCrit: (controlledHero.calculatedStats.critChance || 0) > Math.random(), iconName: 'ARROW_ICON', rotation: 0, previousPositions: []
                            });
                        } else {
                            let damage = Math.max(1, controlledHero.calculatedStats.damage - targetEnemy.calculatedStats.defense);
                            let isCrit = false;
                            if (controlledHero.calculatedStats.critChance && Math.random() < controlledHero.calculatedStats.critChance) {
                                damage = Math.floor(damage * (controlledHero.calculatedStats.critDamage || 1.5)); isCrit = true;
                            }
                            newAttackEventsForNormal.push({ attackerId: controlledHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId, damage, isCrit, timestamp: Date.now() + Math.random() });
                        }
                        const updatedHeroInstances = [...heroInstances];
                        updatedHeroInstances[controlledHeroIndex] = controlledHero;
                        return {
                             ...state,
                            actionBattleState: {
                                ...state.actionBattleState,
                                heroInstances: updatedHeroInstances,
                                lastAttackEvents: [...lastAttackEvents, ...newAttackEventsForNormal].slice(-10),
                                activeProjectiles: [...state.actionBattleState.activeProjectiles, ...newProjectilesForNormal],
                            }
                        };
                    }
                 }
            }
        return state;
    }

    case 'ACTION_BATTLE_TICK': {
      if (!state.actionBattleState) return state;
      
      if (state.actionBattleState.status === 'PREPARING') {
        if (state.actionBattleState.timeToNextWave > 0) {
            let newTimeToNextWave = state.actionBattleState.timeToNextWave - 1;
            if (newTimeToNextWave <= 0) {
                const nextStateWithCooldownDone = { ...state, actionBattleState: { ...state.actionBattleState, timeToNextWave: 0 } };
                return actionBattleReducer(nextStateWithCooldownDone, { type: 'COLOSSEUM_SPAWN_NEXT_WAVE' }, globalBonuses);
            }
            return { ...state, actionBattleState: { ...state.actionBattleState, timeToNextWave: newTimeToNextWave } };
        }
        return state; 
      }

      if (state.actionBattleState.status !== 'FIGHTING') return state; 
      
      let currentActionBattleState = { ...state.actionBattleState };
      let newHeroInstances = currentActionBattleState.heroInstances.map(h => ({...h, statusEffects: [...h.statusEffects], temporaryBuffs: [...h.temporaryBuffs]}));
      let newEnemyInstances = currentActionBattleState.enemyInstances.map(e => ({...e, statusEffects: [...e.statusEffects]}));
      let newActiveProjectiles = [...currentActionBattleState.activeProjectiles];
      const newTickAttackEvents: AttackEvent[] = [];
      const keysPressed = currentActionBattleState.keysPressed || {};
      const controlledHeroId = currentActionBattleState.controlledHeroId;
      let newColosseumLoot = [...currentActionBattleState.currentColosseumLoot];
      let newColosseumExpForPool = currentActionBattleState.currentColosseumExpForPool;
      let tempNotifications = [...state.notifications];
      const arenaDimensions = { width: ARENA_WIDTH_UNITS, height: ARENA_HEIGHT_UNITS, participantSize: PARTICIPANT_SIZE_UNITS };

      // Determine which AI function to use based on global state
      const processAI = state.actionBattleAISystem === 'behaviorTree'
        ? processParticipantAI_behaviorTree
        : processParticipantAI_legacy;

      newHeroInstances = newHeroInstances.map(hero => {
        if (hero.currentHp <= 0) return hero;
        let updatedHero = { ...hero }; 

        updatedHero.statusEffects = updatedHero.statusEffects.map(se => ({ ...se, remainingDurationMs: se.remainingDurationMs - GAME_TICK_MS })).filter(se => se.remainingDurationMs > 0);
        if (updatedHero.isAttackingTicksRemaining && updatedHero.isAttackingTicksRemaining > 0) updatedHero.isAttackingTicksRemaining -= 1;
        if (updatedHero.attackCooldownRemainingTicks > 0) updatedHero.attackCooldownRemainingTicks -=1;
        if (updatedHero.aiDecisionCooldownTicks && updatedHero.aiDecisionCooldownTicks > 0) updatedHero.aiDecisionCooldownTicks -=1;

        Object.keys(updatedHero.specialAttackCooldownsRemaining).forEach(saId => {
            updatedHero.specialAttackCooldownsRemaining[saId] = Math.max(0, updatedHero.specialAttackCooldownsRemaining[saId] - GAME_TICK_MS);
        });


        if (updatedHero.statusEffects.some(se => se.type === 'STUN')) return updatedHero;

        let clericActedThisTick = false;
        if (updatedHero.id === 'CLERIC' && (updatedHero.uniqueBattleId !== controlledHeroId || currentActionBattleState.isAutoBattleActive) && updatedHero.attackCooldownRemainingTicks <= 0) {
            const alliesToHeal = newHeroInstances
                .filter(ally => ally.uniqueBattleId !== updatedHero.uniqueBattleId && ally.currentHp > 0 && ally.currentHp < (ally.calculatedStats.maxHp * 0.9))
                .sort((a, b) => (a.currentHp / a.calculatedStats.maxHp) - (b.currentHp / b.calculatedStats.maxHp));
        
            if (alliesToHeal.length > 0) {
                const targetAlly = alliesToHeal[0];
                const healAmount = Math.max(1, Math.floor(updatedHero.calculatedStats.healPower || 0));
                newTickAttackEvents.push({ attackerId: updatedHero.uniqueBattleId, targetId: targetAlly.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), isHeal: true, healAmount });
                updatedHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                updatedHero.attackCooldownRemainingTicks = Math.floor((1000 / updatedHero.calculatedStats.attackSpeed) / GAME_TICK_MS);
                clericActedThisTick = true;
            } else if (updatedHero.currentHp < (updatedHero.calculatedStats.maxHp * 0.9)) { 
                const healAmount = Math.max(1, Math.floor(updatedHero.calculatedStats.healPower || 0));
                newTickAttackEvents.push({ attackerId: updatedHero.uniqueBattleId, targetId: updatedHero.uniqueBattleId, damage: 0, isCrit: false, timestamp: Date.now() + Math.random(), isHeal: true, healAmount });
                updatedHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                updatedHero.attackCooldownRemainingTicks = Math.floor((1000 / updatedHero.calculatedStats.attackSpeed) / GAME_TICK_MS);
                clericActedThisTick = true;
            } else { 
                const livingEnemiesForCleric = newEnemyInstances.filter(e => e.currentHp > 0 && !e.isDying);
                if (livingEnemiesForCleric.length > 0) {
                    const targetEnemy = livingEnemiesForCleric[Math.floor(Math.random() * livingEnemiesForCleric.length)];
                    let damage = Math.max(1, Math.floor((updatedHero.calculatedStats.damage * 0.25) - targetEnemy.calculatedStats.defense)); 
                    newTickAttackEvents.push({ attackerId: updatedHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId, damage, isCrit: false, timestamp: Date.now() + Math.random() });
                    updatedHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                    updatedHero.attackCooldownRemainingTicks = Math.floor((1000 / updatedHero.calculatedStats.attackSpeed) / GAME_TICK_MS);
                    clericActedThisTick = true; 
                }
            }
        }


        if (updatedHero.uniqueBattleId === controlledHeroId && !currentActionBattleState.isAutoBattleActive) {
            let dx = 0; let dy = 0;
            if (keysPressed['w']) dy -= MOVEMENT_SPEED_UNITS_PER_TICK;
            if (keysPressed['s']) dy += MOVEMENT_SPEED_UNITS_PER_TICK;
            if (keysPressed['a']) dx -= MOVEMENT_SPEED_UNITS_PER_TICK;
            if (keysPressed['d']) dx += MOVEMENT_SPEED_UNITS_PER_TICK;

            if (dx !== 0 || dy !== 0) {
                const potentialNewX = (updatedHero.x || 0) + dx;
                const potentialNewY = (updatedHero.y || 0) + dy;
                if (!checkCollision_legacy(potentialNewX, potentialNewY, PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances], updatedHero.uniqueBattleId)) {
                     updatedHero.x = Math.max(0, Math.min(ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS, potentialNewX));
                     updatedHero.y = Math.max(0, Math.min(ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS, potentialNewY));
                } else {
                    if (!checkCollision_legacy((updatedHero.x || 0) + dx, (updatedHero.y || 0), PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances], updatedHero.uniqueBattleId)) {
                        updatedHero.x = Math.max(0, Math.min(ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS, (updatedHero.x || 0) + dx));
                    } else if (!checkCollision_legacy((updatedHero.x || 0), (updatedHero.y || 0) + dy, PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances], updatedHero.uniqueBattleId)) {
                        updatedHero.y = Math.max(0, Math.min(ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS, (updatedHero.y || 0) + dy));
                    }
                }
            }
            const livingEnemiesForTargeting = newEnemyInstances.filter(e => e.currentHp > 0 && !e.isDying);
            const closestEnemyForControlled = findClosestTarget_legacy(updatedHero, livingEnemiesForTargeting);
            updatedHero.potentialTargetId = closestEnemyForControlled?.uniqueBattleId || null;
            
            if (dx === 0 && dy === 0 && updatedHero.potentialTargetId && updatedHero.attackCooldownRemainingTicks <= 0) {
                 const targetEnemy = livingEnemiesForTargeting.find(e => e.uniqueBattleId === updatedHero.potentialTargetId);
                 if (targetEnemy) {
                    const attackRange = updatedHero.attackType === 'RANGED' ? (updatedHero.rangedAttackRangeUnits || RANGED_ATTACK_RANGE_UNITS_DEFAULT) : ATTACK_RANGE_UNITS;
                    const distanceToTargetSq = Math.pow((targetEnemy.x || 0) - (updatedHero.x || 0), 2) + Math.pow((targetEnemy.y || 0) - (updatedHero.y || 0), 2);
                    if (distanceToTargetSq <= attackRange * attackRange) { 
                        updatedHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                        updatedHero.attackCooldownRemainingTicks = Math.floor((1000 / updatedHero.calculatedStats.attackSpeed) / GAME_TICK_MS);
                        if (updatedHero.attackType === 'RANGED') {
                            newActiveProjectiles.push({
                                id: `proj-${Date.now()}-${Math.random()}`, attackerId: updatedHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId,
                                originX: (updatedHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, originY: (updatedHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                                currentX: (updatedHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, currentY: (updatedHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                                targetX: (targetEnemy.x || 0) + PARTICIPANT_SIZE_UNITS / 2, targetY: (targetEnemy.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                                speed: PROJECTILE_SPEED_PER_TICK, damage: Math.max(1, updatedHero.calculatedStats.damage - targetEnemy.calculatedStats.defense),
                                isCrit: (updatedHero.calculatedStats.critChance || 0) > Math.random(), iconName: 'ARROW_ICON', rotation: 0, previousPositions: []
                            });
                        } else {
                            let damage = Math.max(1, updatedHero.calculatedStats.damage - targetEnemy.calculatedStats.defense);
                            let isCrit = false;
                            if (updatedHero.calculatedStats.critChance && Math.random() < updatedHero.calculatedStats.critChance) {
                                damage = Math.floor(damage * (updatedHero.calculatedStats.critDamage || 1.5)); isCrit = true;
                            }
                            newTickAttackEvents.push({ attackerId: updatedHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId, damage, isCrit, timestamp: Date.now() + Math.random() });
                        }
                    }
                 }
            }

        } else if (!clericActedThisTick) { 
            const aiDecision = processAI(updatedHero, newHeroInstances, newEnemyInstances, arenaDimensions);
            
            const potentialNewX = (updatedHero.x || 0) + aiDecision.dx;
            const potentialNewY = (updatedHero.y || 0) + aiDecision.dy;

            if (!checkCollision_legacy(potentialNewX, potentialNewY, PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances].filter(p => p.uniqueBattleId !== updatedHero.uniqueBattleId), updatedHero.uniqueBattleId)) {
                updatedHero.x = Math.max(0, Math.min(ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS, potentialNewX));
                updatedHero.y = Math.max(0, Math.min(ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS, potentialNewY));
            } else {
                 if (!checkCollision_legacy((updatedHero.x || 0) + aiDecision.dx, (updatedHero.y || 0), PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances].filter(p => p.uniqueBattleId !== updatedHero.uniqueBattleId), updatedHero.uniqueBattleId)) {
                    updatedHero.x = Math.max(0, Math.min(ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS, (updatedHero.x || 0) + aiDecision.dx));
                } else if (!checkCollision_legacy((updatedHero.x || 0), (updatedHero.y || 0) + aiDecision.dy, PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances].filter(p => p.uniqueBattleId !== updatedHero.uniqueBattleId), updatedHero.uniqueBattleId)) {
                    updatedHero.y = Math.max(0, Math.min(ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS, (updatedHero.y || 0) + aiDecision.dy));
                }
            }
            
            updatedHero.targetId = aiDecision.actualTargetId; 
            updatedHero.debugMovementTarget = aiDecision.debugMovementTarget;
            updatedHero.aiState = aiDecision.aiState;
            updatedHero.aiRepositioningTarget = aiDecision.aiRepositioningTarget;
            updatedHero.aiDecisionCooldownTicks = aiDecision.aiDecisionCooldownTicks;


            if (aiDecision.attackTargetId && updatedHero.attackCooldownRemainingTicks <= 0) {
                const targetEnemy = newEnemyInstances.find(e => e.uniqueBattleId === aiDecision.attackTargetId);
                if (targetEnemy && targetEnemy.currentHp > 0 && !targetEnemy.isDying) {
                    updatedHero.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                    updatedHero.attackCooldownRemainingTicks = Math.floor((1000 / updatedHero.calculatedStats.attackSpeed) / GAME_TICK_MS);
                    if (updatedHero.attackType === 'RANGED') {
                         newActiveProjectiles.push({
                            id: `proj-${Date.now()}-${Math.random()}`, attackerId: updatedHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId,
                            originX: (updatedHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, originY: (updatedHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                            currentX: (updatedHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, currentY: (updatedHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                            targetX: (targetEnemy.x || 0) + PARTICIPANT_SIZE_UNITS / 2, targetY: (targetEnemy.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                            speed: PROJECTILE_SPEED_PER_TICK, damage: Math.max(1, updatedHero.calculatedStats.damage - targetEnemy.calculatedStats.defense),
                            isCrit: (updatedHero.calculatedStats.critChance || 0) > Math.random(), iconName: 'ARROW_ICON', rotation: 0, previousPositions: []
                        });
                    } else { 
                        let damage = Math.max(1, updatedHero.calculatedStats.damage - targetEnemy.calculatedStats.defense);
                        let isCrit = false;
                        if (updatedHero.calculatedStats.critChance && Math.random() < updatedHero.calculatedStats.critChance) {
                            damage = Math.floor(damage * (updatedHero.calculatedStats.critDamage || 1.5)); isCrit = true;
                        }
                        newTickAttackEvents.push({ attackerId: updatedHero.uniqueBattleId, targetId: targetEnemy.uniqueBattleId, damage, isCrit, timestamp: Date.now() + Math.random() }); 
                    }
                }
            }
        }
        return updatedHero;
      });

      newEnemyInstances = newEnemyInstances.map(enemy => {
        if (enemy.currentHp <= 0 || enemy.isDying) return enemy; 
        let updatedEnemy = {...enemy};

        updatedEnemy.statusEffects = updatedEnemy.statusEffects.map(se => ({ ...se, remainingDurationMs: se.remainingDurationMs - GAME_TICK_MS })).filter(se => se.remainingDurationMs > 0);
        if (updatedEnemy.isAttackingTicksRemaining && updatedEnemy.isAttackingTicksRemaining > 0) updatedEnemy.isAttackingTicksRemaining -= 1;
        if (updatedEnemy.attackCooldownRemainingTicks > 0) updatedEnemy.attackCooldownRemainingTicks -=1;
        if (updatedEnemy.aiDecisionCooldownTicks && updatedEnemy.aiDecisionCooldownTicks > 0) updatedEnemy.aiDecisionCooldownTicks -=1;
        
        if (updatedEnemy.statusEffects.some(se => se.type === 'STUN')) return updatedEnemy;

        const aiDecision = processAI(updatedEnemy, newHeroInstances, newEnemyInstances, arenaDimensions);
        const potentialNewXEnemy = (updatedEnemy.x || 0) + aiDecision.dx;
        const potentialNewYEnemy = (updatedEnemy.y || 0) + aiDecision.dy;

        if (!checkCollision_legacy(potentialNewXEnemy, potentialNewYEnemy, PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances].filter(p => p.uniqueBattleId !== updatedEnemy.uniqueBattleId), updatedEnemy.uniqueBattleId)) {
            updatedEnemy.x = Math.max(0, Math.min(ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS, potentialNewXEnemy));
            updatedEnemy.y = Math.max(0, Math.min(ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS, potentialNewYEnemy));
        } else {
            if (!checkCollision_legacy((updatedEnemy.x || 0) + aiDecision.dx, (updatedEnemy.y || 0), PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances].filter(p => p.uniqueBattleId !== updatedEnemy.uniqueBattleId), updatedEnemy.uniqueBattleId)) {
                updatedEnemy.x = Math.max(0, Math.min(ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS, (updatedEnemy.x || 0) + aiDecision.dx));
            } else if (!checkCollision_legacy((updatedEnemy.x || 0), (updatedEnemy.y || 0) + aiDecision.dy, PARTICIPANT_SIZE_UNITS, [...newHeroInstances, ...newEnemyInstances].filter(p => p.uniqueBattleId !== updatedEnemy.uniqueBattleId), updatedEnemy.uniqueBattleId)) {
                updatedEnemy.y = Math.max(0, Math.min(ARENA_HEIGHT_UNITS - PARTICIPANT_SIZE_UNITS, (updatedEnemy.y || 0) + aiDecision.dy));
            }
        }
        updatedEnemy.targetId = aiDecision.actualTargetId;
        updatedEnemy.debugMovementTarget = aiDecision.debugMovementTarget;
        updatedEnemy.aiState = aiDecision.aiState;
        updatedEnemy.aiRepositioningTarget = aiDecision.aiRepositioningTarget;
        updatedEnemy.aiDecisionCooldownTicks = aiDecision.aiDecisionCooldownTicks;
        
        if (aiDecision.attackTargetId && updatedEnemy.attackCooldownRemainingTicks <= 0) {
            const targetHero = newHeroInstances.find(h => h.uniqueBattleId === aiDecision.attackTargetId);
            if (targetHero && targetHero.currentHp > 0) {
                updatedEnemy.isAttackingTicksRemaining = ATTACK_ANIMATION_TICKS;
                updatedEnemy.attackCooldownRemainingTicks = Math.floor((1000 / updatedEnemy.calculatedStats.attackSpeed) / GAME_TICK_MS);

                if (updatedEnemy.attackType === 'RANGED') {
                     newActiveProjectiles.push({
                        id: `proj-${Date.now()}-${Math.random()}`, attackerId: updatedEnemy.uniqueBattleId, targetId: targetHero.uniqueBattleId,
                        originX: (updatedEnemy.x || 0) + PARTICIPANT_SIZE_UNITS / 2, originY: (updatedEnemy.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                        currentX: (updatedEnemy.x || 0) + PARTICIPANT_SIZE_UNITS / 2, currentY: (updatedEnemy.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                        targetX: (targetHero.x || 0) + PARTICIPANT_SIZE_UNITS / 2, targetY: (targetHero.y || 0) + PARTICIPANT_SIZE_UNITS / 2,
                        speed: PROJECTILE_SPEED_PER_TICK, damage: Math.max(1, updatedEnemy.calculatedStats.damage - targetHero.calculatedStats.defense),
                        isCrit: (updatedEnemy.calculatedStats.critChance || 0) > Math.random(), iconName: 'ARROW_ICON', rotation: 0, previousPositions: []
                    });
                } else { 
                    let damage = Math.max(1, updatedEnemy.calculatedStats.damage - targetHero.calculatedStats.defense);
                    let isCrit = false;
                    if (updatedEnemy.calculatedStats.critChance && Math.random() < updatedEnemy.calculatedStats.critChance) {
                        damage = Math.floor(damage * (updatedEnemy.calculatedStats.critDamage || 1.5)); isCrit = true;
                    }
                    newTickAttackEvents.push({ attackerId: updatedEnemy.uniqueBattleId, targetId: targetHero.uniqueBattleId, damage, isCrit, timestamp: Date.now() + Math.random() });
                }
            }
        }
        return updatedEnemy;
      });

      newActiveProjectiles = newActiveProjectiles.filter(proj => {
        const targetIsHero = newHeroInstances.find(h => h.uniqueBattleId === proj.targetId && h.currentHp > 0);
        const targetIsEnemy = newEnemyInstances.find(e => e.uniqueBattleId === proj.targetId && e.currentHp > 0 && !e.isDying);
        const target = targetIsHero || targetIsEnemy;

        if (!target) return false; 

        const dx = (target.x + PARTICIPANT_SIZE_UNITS / 2) - proj.currentX; 
        const dy = (target.y + PARTICIPANT_SIZE_UNITS / 2) - proj.currentY; 
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        
        proj.rotation = (Math.atan2(dy, dx) * 180 / Math.PI) + 90; 

        let updatedPreviousPositions = [...(proj.previousPositions || [])].map(seg => ({
            ...seg,
            opacity: Math.max(0, seg.opacity - (1.0 / (MAX_PROJECTILE_TRAIL_SEGMENTS + 2))) 
        })).filter(seg => seg.opacity > 0.01); 

        const newTrailSegment = { x: proj.currentX, y: proj.currentY, rotation: proj.rotation, opacity: 1 }; 
        updatedPreviousPositions.unshift(newTrailSegment); 

        if (updatedPreviousPositions.length > MAX_PROJECTILE_TRAIL_SEGMENTS) {
            updatedPreviousPositions = updatedPreviousPositions.slice(0, MAX_PROJECTILE_TRAIL_SEGMENTS);
        }
        proj.previousPositions = updatedPreviousPositions;

        if (distToTarget <= proj.speed || distToTarget <= PARTICIPANT_SIZE_UNITS / 2) { 
            let damage = proj.damage;
            if (proj.isCrit) {
                const attacker = newHeroInstances.find(h => h.uniqueBattleId === proj.attackerId) || newEnemyInstances.find(e => e.uniqueBattleId === proj.attackerId);
                damage = Math.floor(damage * (attacker?.calculatedStats.critDamage || 1.5));
            }
            newTickAttackEvents.push({ attackerId: proj.attackerId, targetId: proj.targetId, damage, isCrit: proj.isCrit, timestamp: Date.now() + Math.random() });
            return false; 
        } else { 
            proj.currentX += (dx / distToTarget) * proj.speed;
            proj.currentY += (dy / distToTarget) * proj.speed;
            if (proj.currentX < -PROJECTILE_SPEED_PER_TICK * 2 || proj.currentX > ARENA_WIDTH_UNITS + PROJECTILE_SPEED_PER_TICK * 2 || proj.currentY < -PROJECTILE_SPEED_PER_TICK * 2 || proj.currentY > ARENA_HEIGHT_UNITS + PROJECTILE_SPEED_PER_TICK * 2) return false;
            return true;
        }
      });
      
      newTickAttackEvents.forEach(event => {
        const heroTargetIndex = newHeroInstances.findIndex(h => h.uniqueBattleId === event.targetId);
        if (heroTargetIndex !== -1) {
            let damageToApply = event.damage;
            if (state.godModeActive && newHeroInstances[heroTargetIndex].uniqueBattleId === currentActionBattleState.controlledHeroId) damageToApply = 0;
            
            if(event.isHeal && event.healAmount) { 
                newHeroInstances[heroTargetIndex].currentHp = Math.min(newHeroInstances[heroTargetIndex].calculatedStats.maxHp, newHeroInstances[heroTargetIndex].currentHp + event.healAmount);
            } else { 
                newHeroInstances[heroTargetIndex].currentHp = Math.max(0, newHeroInstances[heroTargetIndex].currentHp - damageToApply);
            }
        } else {
            const enemyTargetIndex = newEnemyInstances.findIndex(e => e.uniqueBattleId === event.targetId);
            if (enemyTargetIndex !== -1 && !newEnemyInstances[enemyTargetIndex].isDying) { 
                newEnemyInstances[enemyTargetIndex].currentHp = Math.max(0, newEnemyInstances[enemyTargetIndex].currentHp - event.damage);
                if (newEnemyInstances[enemyTargetIndex].currentHp <= 0) {
                    newEnemyInstances[enemyTargetIndex].isDying = true;
                    newEnemyInstances[enemyTargetIndex].dyingTicksRemaining = DEATH_ANIMATION_TICKS;
                }
            }
        }
      });

      let waveClearedThisTick = false;
      const previouslyLivingEnemiesCount = currentActionBattleState.enemyInstances.filter(e => e.currentHp > 0 && !e.isDying).length;
      
      const enemiesAfterDamageAndDeathProcessing = newEnemyInstances.map(enemy => {
        if (enemy.isDying && enemy.dyingTicksRemaining !== undefined) {
            enemy.dyingTicksRemaining -= 1;
            if (enemy.dyingTicksRemaining <= 0) {
                const enemyDef = ENEMY_DEFINITIONS[enemy.id];
                if (enemyDef) {
                    const lootScale = 1 + (currentActionBattleState.currentWaveNumber - 1) * 0.05;
                    enemyDef.loot.forEach(l => {
                        const amount = Math.floor(l.amount * lootScale);
                        const existingLoot = newColosseumLoot.find(cl => cl.resource === l.resource);
                        if (existingLoot) {
                            existingLoot.amount += amount;
                        } else {
                            newColosseumLoot.push({ resource: l.resource, amount });
                        }
                    });

                    const totalScaledExpFromEnemy = (enemyDef.expReward || 0) * lootScale; 
                    const expForPool = Math.floor(totalScaledExpFromEnemy * 0.3);
                    const expForHeroesDirect = totalScaledExpFromEnemy - expForPool;
                    newColosseumExpForPool += expForPool;

                    const livingHeroesForXP = newHeroInstances.filter(h => h.currentHp > 0);
                    if (livingHeroesForXP.length > 0 && expForHeroesDirect > 0) {
                        const expPerHero = Math.floor(expForHeroesDirect / livingHeroesForXP.length);
                        newHeroInstances = newHeroInstances.map(h => { 
                            if (h.currentHp > 0) {
                                let updatedHero = { ...h }; 
                                updatedHero.currentExp += expPerHero;
                                while (updatedHero.currentExp >= updatedHero.expToNextLevel) {
                                    updatedHero.currentExp -= updatedHero.expToNextLevel;
                                    updatedHero.level++;
                                    updatedHero.skillPoints = (updatedHero.skillPoints || 0) + 1;
                                    updatedHero.expToNextLevel = getExpToNextHeroLevel(updatedHero.level);
                                    tempNotifications.push({
                                        id: `${Date.now()}-heroLvlUp-${updatedHero.uniqueBattleId}`,
                                        message: `${updatedHero.name} reached Level ${updatedHero.level} in the Colosseum!`,
                                        type: 'success',
                                        iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined,
                                        timestamp: Date.now(),
                                    });
                                }
                                return updatedHero;
                            }
                            return h;
                        });
                    }
                }
                return { ...enemy, currentHp: 0 }; 
            }
        }
        return enemy;
      }).filter(enemy => !(enemy.isDying && enemy.dyingTicksRemaining !== undefined && enemy.dyingTicksRemaining <= 0 && enemy.currentHp === 0));

      if (enemiesAfterDamageAndDeathProcessing.filter(e => e.currentHp > 0 && !e.isDying).length === 0 && previouslyLivingEnemiesCount > 0) {
        waveClearedThisTick = true;
      }
      
      let nextStatus = currentActionBattleState.status;
      if (newHeroInstances.filter(h => h.currentHp > 0).length === 0) {
        nextStatus = 'DEFEAT';
      }

      let newWaveTimerRemainingTicks = currentActionBattleState.waveTimerRemainingTicks -1;
      if (newWaveTimerRemainingTicks <= 0 && nextStatus === 'FIGHTING' && !waveClearedThisTick) { 
         const nextStateAfterWaveTimer = { ...state, actionBattleState: { ...currentActionBattleState, waveTimerRemainingTicks: 0, heroInstances: newHeroInstances, enemyInstances: enemiesAfterDamageAndDeathProcessing, activeProjectiles: newActiveProjectiles, currentColosseumLoot: newColosseumLoot, currentColosseumExpForPool: newColosseumExpForPool } };
         return actionBattleReducer(nextStateAfterWaveTimer, { type: 'COLOSSEUM_SPAWN_NEXT_WAVE' }, globalBonuses);
      }
      
      currentActionBattleState = {
        ...currentActionBattleState,
        heroInstances: newHeroInstances,
        enemyInstances: enemiesAfterDamageAndDeathProcessing,
        activeProjectiles: newActiveProjectiles,
        status: nextStatus,
        waveTimerRemainingTicks: newWaveTimerRemainingTicks,
        lastAttackEvents: [...currentActionBattleState.lastAttackEvents, ...newTickAttackEvents].slice(-10),
        currentColosseumLoot: newColosseumLoot,
        currentColosseumExpForPool: newColosseumExpForPool,
      };
      
      if (waveClearedThisTick && nextStatus === 'FIGHTING') {
         return actionBattleReducer({ ...state, actionBattleState: currentActionBattleState, notifications: tempNotifications }, { type: 'COLOSSEUM_WAVE_CLEARED' }, globalBonuses);
      }
      
      return { ...state, actionBattleState: currentActionBattleState, notifications: tempNotifications };
    }

    case 'COLOSSEUM_SPAWN_NEXT_WAVE': {
      if (!state.actionBattleState) return state;

      const newCurrentWaveNumber = state.actionBattleState.currentWaveNumber + 1;
      const waveIndex = (newCurrentWaveNumber - 1) % COLOSSEUM_WAVE_DEFINITIONS.length; 
      const waveDef = COLOSSEUM_WAVE_DEFINITIONS[waveIndex];

      if (!waveDef) {
        console.warn(`Colosseum wave definition not found for index ${waveIndex} (currentWaveNum ${newCurrentWaveNumber})`);
        return { ...state, actionBattleState: { ...state.actionBattleState, status: 'VICTORY' }}; 
      }

      const newEnemyInstancesFromSpawn: BattleEnemy[] = [];
      waveDef.enemies.forEach(ew => {
        const enemyDef = ENEMY_DEFINITIONS[ew.enemyId];
        if (enemyDef) {
          for (let i = 0; i < ew.count; i++) {
            if (newEnemyInstancesFromSpawn.length + state.actionBattleState!.enemyInstances.filter(e => e.currentHp > 0).length >= state.actionBattleState!.maxConcurrentEnemies) {
              break; 
            }
            const stats = calculateColosseumEnemyStats(enemyDef, newCurrentWaveNumber);
            newEnemyInstancesFromSpawn.push({
              ...enemyDef, 
              attackType: enemyDef.attackType || 'MELEE',
              rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
              uniqueBattleId: `${ew.enemyId}_action_${newCurrentWaveNumber}_${i}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
              currentHp: stats.maxHp,
              currentEnergyShield: stats.maxEnergyShield || 0,
              shieldRechargeDelayTicksRemaining: 0,
              calculatedStats: stats,
              attackCooldown: 0, 
              attackCooldownRemainingTicks: 0,
              movementSpeed: MOVEMENT_SPEED_UNITS_PER_TICK / 1.5, 
              statusEffects: [],
              isElite: false,
              x: Math.random() * (ARENA_WIDTH_UNITS - PARTICIPANT_SIZE_UNITS),
              y: Math.random() * (ARENA_HEIGHT_UNITS / 2 - PARTICIPANT_SIZE_UNITS), 
              targetId: null,
              isAttackingTicksRemaining: 0,
              isDying: false,
              dyingTicksRemaining: 0,
              debugMovementTarget: undefined,
              aiDecisionCooldownTicks: 0,
              aiState: 'IDLE' as ActionBattleParticipantAIState,
              aiRepositioningTarget: undefined,
            });
          }
        }
      });
      
      const newWaveDurationSeconds = 10 + (newCurrentWaveNumber - 1) * 2; 
      const newWaveTimerMaxTicks = newWaveDurationSeconds * (1000 / GAME_TICK_MS);

      return {
        ...state,
        actionBattleState: {
          ...state.actionBattleState,
          enemyInstances: [...state.actionBattleState.enemyInstances.filter(e => e.currentHp > 0 && !e.isDying), ...newEnemyInstancesFromSpawn],
          currentWaveNumber: newCurrentWaveNumber,
          status: 'FIGHTING',
          timeToNextWave: 0, 
          waveTimerMaxTicks: newWaveTimerMaxTicks,
          waveTimerRemainingTicks: newWaveTimerMaxTicks,
        },
      };
    }
    
    case 'COLOSSEUM_ENEMY_TAKE_DAMAGE': { 
      if (!state.actionBattleState) return state;
      const { enemyUniqueId, damage } = action.payload;
      
      const enemyIndex = state.actionBattleState.enemyInstances.findIndex(e => e.uniqueBattleId === enemyUniqueId);
      if (enemyIndex === -1 || state.actionBattleState.enemyInstances[enemyIndex].isDying) return state;

      const updatedEnemyInstances = [...state.actionBattleState.enemyInstances];
      const enemyToUpdate = { ...updatedEnemyInstances[enemyIndex] };
      enemyToUpdate.currentHp = Math.max(0, enemyToUpdate.currentHp - damage);
      
      if (enemyToUpdate.currentHp <= 0) {
          enemyToUpdate.isDying = true;
          enemyToUpdate.dyingTicksRemaining = DEATH_ANIMATION_TICKS;
      }
      updatedEnemyInstances[enemyIndex] = enemyToUpdate;
      
      return {
        ...state,
        actionBattleState: { ...state.actionBattleState, enemyInstances: updatedEnemyInstances }
      };
    }

    case 'COLOSSEUM_HERO_TAKE_DAMAGE': {
        if (!state.actionBattleState) return state;
        const { heroUniqueId, damage } = action.payload;
        const heroIndex = state.actionBattleState.heroInstances.findIndex(h => h.uniqueBattleId === heroUniqueId);
        if (heroIndex === -1) return state;

        const updatedHeroInstances = [...state.actionBattleState.heroInstances];
        const heroToUpdate = { ...updatedHeroInstances[heroIndex] };
        let actualDamage = damage;
        if (state.godModeActive && heroToUpdate.uniqueBattleId === state.actionBattleState.controlledHeroId) {
            actualDamage = 0;
        }
        heroToUpdate.currentHp = Math.max(0, heroToUpdate.currentHp - actualDamage);
        updatedHeroInstances[heroIndex] = heroToUpdate;
        
        const livingHeroesCount = updatedHeroInstances.filter(h => h.currentHp > 0).length;
        let currentStatus = state.actionBattleState.status;
        if (livingHeroesCount === 0 && currentStatus === 'FIGHTING') {
            currentStatus = 'DEFEAT'; 
        }

        return {
            ...state,
            actionBattleState: {
                ...state.actionBattleState,
                heroInstances: updatedHeroInstances,
                status: currentStatus, 
            }
        };
    }

    case 'COLOSSEUM_WAVE_CLEARED': {
      if (!state.actionBattleState) return state;
      
      const livingEnemies = state.actionBattleState.enemyInstances.filter(e => e.currentHp > 0 && !e.isDying);
      if (livingEnemies.length > 0 && state.actionBattleState.status === 'FIGHTING') { 
          return state; 
      }
      
      if (state.actionBattleState.status === 'PREPARING') { 
          return state;
      }

      return {
        ...state,
        actionBattleState: {
          ...state.actionBattleState,
          status: 'PREPARING',
          timeToNextWave: WAVE_CLEAR_COOLDOWN_TICKS, 
        }
      };
    }

    case 'END_ACTION_BATTLE':
      if (!state.actionBattleState) return state;

      const { currentColosseumLoot, currentColosseumExpForPool, heroInstances: battleHeroInstances } = state.actionBattleState;
      const newResources = { ...state.resources };
      let notifications = [...state.notifications];

      if (currentColosseumLoot && currentColosseumLoot.length > 0) {
        currentColosseumLoot.forEach(l => {
          newResources[l.resource] = (newResources[l.resource] || 0) + l.amount;
        });

        let lootSummary = currentColosseumLoot.map(l => `${formatNumber(l.amount)} ${l.resource.replace(/_/g, ' ')}`).join(', ');
        if (!lootSummary && currentColosseumLoot.length > 0) lootSummary = "some items were processed";
        
        notifications.push({
            id: Date.now().toString() + "-colosseumRewards",
            message: `Colosseum Rewards: ${lootSummary}.`,
            type: 'success',
            iconName: NOTIFICATION_ICONS.success,
            timestamp: Date.now()
        });
      }

      if (currentColosseumExpForPool > 0) {
          newResources[ResourceType.HEROIC_POINTS] = (newResources[ResourceType.HEROIC_POINTS] || 0) + currentColosseumExpForPool;
          notifications.push({
            id: Date.now().toString() + "-colosseumExpPool",
            message: `Gained ${formatNumber(currentColosseumExpForPool)} Hero XP for the Pool from Colosseum.`,
            type: 'info',
            iconName: ICONS.HEROIC_POINTS ? 'HEROIC_POINTS' : undefined,
            timestamp: Date.now()
          });
      }
      
      if (action.payload?.outcome === 'DEFEAT') {
        notifications.push({
            id: Date.now().toString() + "-colosseumDefeat",
            message: "Your party was defeated in the Colosseum!",
            type: 'error',
            iconName: NOTIFICATION_ICONS.error,
            timestamp: Date.now()
        });
      } else if (action.payload?.outcome === 'VICTORY' && (!currentColosseumLoot || currentColosseumLoot.length === 0) && currentColosseumExpForPool <= 0) {
        notifications.push({
            id: Date.now().toString() + "-colosseumVictoryNoRewards",
            message: "Colosseum run victorious!", 
            type: 'info',
            iconName: NOTIFICATION_ICONS.info,
            timestamp: Date.now()
        });
      }

      const updatedMainHeroes = state.heroes.map(mainHero => {
        const battleHeroVersion = battleHeroInstances.find(bh => bh.definitionId === mainHero.definitionId);
        if (battleHeroVersion) {
          return {
            ...mainHero,
            level: battleHeroVersion.level,
            currentExp: battleHeroVersion.currentExp,
            expToNextLevel: battleHeroVersion.expToNextLevel,
            skillPoints: battleHeroVersion.skillPoints,
          };
        }
        return mainHero;
      });
      
      return { 
        ...state, 
        resources: newResources,
        heroes: updatedMainHeroes,
        actionBattleState: null, 
        notifications,
      };

    default:
      return state;
  }
};
