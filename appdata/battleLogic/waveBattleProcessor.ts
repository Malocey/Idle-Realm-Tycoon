
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, ResourceType, RunBuffDefinition, AttackEvent, BattleState, GameContextType, StatusEffectType, BattleHero, FusionAnchor, DamagePopupInState, FeederParticle } from '../types';
import { calculateGlobalBonusesFromAllSources, formatNumber, canAfford, calculateHeroStats as calculateHeroStatsUtil, calculateWaveEnemyStats, mergeCosts } from '../utils'; // Added mergeCosts
import { TOWN_HALL_UPGRADE_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, HERO_DEFINITIONS, ENEMY_DEFINITIONS, BUILDING_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, EQUIPMENT_DEFINITIONS, RUN_BUFF_DEFINITIONS, SKILL_TREES, SHARD_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS, GAME_TICK_MS, DAMAGE_POPUP_ANIMATION_DURATION_MS, MAX_DAMAGE_POPUPS_IN_STATE, DAMAGE_POPUP_LIFESPAN_BUFFER_MS, FUSION_FEEDER_ANIMATION_DURATION_MS } from '../constants';
import { ICONS } from '../components/Icons';

// Import combat helper functions from their original location
import { updateParticipants } from '../reducers/combat/participantUpdater';
import { processHeroActions } from '../reducers/combat/heroActions';
import { processEnemyActions } from '../reducers/combat/enemyActions';
import { processAttackEvents } from '../reducers/combat/eventProcessor';
import { handleLootAndXP } from '../reducers/combat/lootAndXPHandler';
import { checkBattleStatus } from '../reducers/combat/battleStatusManager';
import { calculateRunExpToNextLevel } from '../utils';

interface WaveBattleTickResult {
    updatedGameState: GameState;
    deferredActions: GameAction[];
    newlyAddedToFirstTimeDefeatsForAccXp?: string[];
}

export const processWaveBattleTick = (
    state: GameState,
    globalBonuses: GlobalBonuses,
    staticData: GameContextType['staticData']
): WaveBattleTickResult => {
  if (!state.battleState || state.battleState.status !== 'FIGHTING' || state.battleState.isDemoniconBattle) {
    return { updatedGameState: state, deferredActions: [] };
  }

  const battleTickDurationMs = GAME_TICK_MS / state.gameSpeed;
  let allDeferredActionsThisTick: GameAction[] = [];

  // Use a mutable copy of battleState for this tick's processing
  let currentTickBattleState = { ...state.battleState }; 

  let currentBattleLog = [...currentTickBattleState.battleLog];
  // Note: currentBattleLootCollected and currentBattleExpCollected now represent PER-TICK values within this function
  let currentTickLootCollected: Cost[] = []; // Initialize as empty for this tick
  let currentTickExpCollected = 0;       // Initialize as zero for this tick

  let currentDefeatedEnemiesWithLoot = {...currentTickBattleState.defeatedEnemiesWithLoot};
  let currentUpdatedBattleHeroes = currentTickBattleState.heroes.map(h => ({...h, statusEffects: [...(h.statusEffects || [])], temporaryBuffs: [...(h.temporaryBuffs || [])] }));
  let currentUpdatedBattleEnemies = currentTickBattleState.enemies.map(e => ({...e, statusEffects: [...(e.statusEffects || [])], temporaryBuffs: [...(e.temporaryBuffs || [])] }));
  
  let currentDamagePopups = [...(currentTickBattleState.damagePopups || [])];
  let currentFusionAnchors = [...(currentTickBattleState.fusionAnchors || [])];
  let currentFeederParticles = [...(currentTickBattleState.feederParticles || [])];


  let currentNotifications = [...state.notifications];
  let currentBuildings = [...state.buildings];
  let currentBuildingLevelUpEventsGameState = {...state.buildingLevelUpEvents};
  let currentBuildingLevelUpEventsInBattle = [...(currentTickBattleState.buildingLevelUpEventsInBattle || [])];
  
  let playerSharedSkillPointsFromBattle = state.playerSharedSkillPoints;

  // 1. Update Participants (Cooldowns, Status Effects, Buffs, Regen, Channeling)
  const participantUpdateResult = updateParticipants(currentUpdatedBattleHeroes, currentUpdatedBattleEnemies, battleTickDurationMs, state, globalBonuses);
  currentUpdatedBattleHeroes = participantUpdateResult.updatedHeroes;
  currentUpdatedBattleEnemies = participantUpdateResult.updatedEnemies;
  currentBattleLog.push(...participantUpdateResult.logMessages);
  const statsRecalculationNeededForHeroIds = participantUpdateResult.statsRecalculationNeededForHeroIds;
  const newSummonsFromParticipantUpdate = participantUpdateResult.newSummons || [];

  // 2. Process Hero Actions
  const heroActionResult = processHeroActions(currentUpdatedBattleHeroes, currentUpdatedBattleEnemies, battleTickDurationMs, state, globalBonuses);
  currentUpdatedBattleHeroes = heroActionResult.updatedHeroes;
  const heroAttackEvents = heroActionResult.attackEvents;
  currentBattleLog.push(...heroActionResult.logMessages);
  const newSummonsFromHeroActions = (heroActionResult as any).newSummons || [];

  // 3. Process Enemy Actions
  const enemyActionResult = processEnemyActions(currentUpdatedBattleEnemies, currentUpdatedBattleHeroes, battleTickDurationMs, state, globalBonuses);
  currentUpdatedBattleEnemies = enemyActionResult.updatedEnemies;
  const enemyAttackEvents = enemyActionResult.attackEvents;
  currentBattleLog.push(...enemyActionResult.logMessages);
  const newSummonsFromEnemyActions = enemyActionResult.newSummons || [];

  if (enemyActionResult.statusEffectsToApplyToHeroes.length > 0) {
    enemyActionResult.statusEffectsToApplyToHeroes.forEach(appliance => {
      const heroIndex = currentUpdatedBattleHeroes.findIndex(h => h.uniqueBattleId === appliance.heroId);
      if (heroIndex !== -1) {
        currentUpdatedBattleHeroes[heroIndex].statusEffects.push(appliance.effect);
        if (appliance.effect.type === StatusEffectType.BUFF || appliance.effect.type === StatusEffectType.DEBUFF) {
          if (!statsRecalculationNeededForHeroIds.includes(appliance.heroId)) {
            statsRecalculationNeededForHeroIds.push(appliance.heroId);
          }
        }
      }
    });
  }

  const allNewSummonsThisTick = [
    ...newSummonsFromParticipantUpdate,
    ...newSummonsFromHeroActions,
    ...newSummonsFromEnemyActions
  ];

  if (allNewSummonsThisTick.length > 0) {
    currentUpdatedBattleEnemies.push(...allNewSummonsThisTick);
     currentBattleLog.push(`${allNewSummonsThisTick.length} new unit(s) appeared!`);
  }

  const allAttackEventsThisTick: AttackEvent[] = [...heroAttackEvents, ...enemyAttackEvents, ...participantUpdateResult.attackEventsFromDots];

  // 4. Process Attack Events (Damage/Heal Application)
  const eventProcessingResult = processAttackEvents(allAttackEventsThisTick, currentUpdatedBattleHeroes, currentUpdatedBattleEnemies, state, globalBonuses);
  currentUpdatedBattleHeroes = eventProcessingResult.updatedHeroes;
  currentUpdatedBattleEnemies = eventProcessingResult.updatedEnemies;
  currentBattleLog.push(...eventProcessingResult.logMessages);
  const enemyIdsToRecalculateStats = eventProcessingResult.statsRecalculationNeededForEnemyIds;
  const newDamagePopupsFromEvents = eventProcessingResult.newDamagePopupsForCanvas;
  currentFusionAnchors = eventProcessingResult.updatedFusionAnchors;
  currentFeederParticles = [...currentFeederParticles, ...eventProcessingResult.newFeederParticles]; 


  if (eventProcessingResult.newSummonsFromPhase && eventProcessingResult.newSummonsFromPhase.length > 0) {
    currentUpdatedBattleEnemies.push(...eventProcessingResult.newSummonsFromPhase);
  }

  if (statsRecalculationNeededForHeroIds.length > 0) {
    currentUpdatedBattleHeroes = currentUpdatedBattleHeroes.map(hero => {
      if (statsRecalculationNeededForHeroIds.includes(hero.uniqueBattleId)) {
        const heroDef = staticData.heroDefinitions[hero.definitionId];
        const skillTree = staticData.skillTrees[heroDef.skillTreeId];
        const newStats = calculateHeroStatsUtil( 
            hero,
            heroDef,
            skillTree,
            state,
            staticData.townHallUpgradeDefinitions,
            staticData.guildHallUpgradeDefinitions,
            staticData.equipmentDefinitions,
            globalBonuses,
            staticData.shardDefinitions,
            staticData.runBuffDefinitions,
            staticData.statusEffectDefinitions,
            state.battleState?.isDemoniconBattle,
            state.achievedDemoniconMilestoneRewards
        );
        const currentHpPercentage = hero.calculatedStats.maxHp > 0 ? hero.currentHp / hero.calculatedStats.maxHp : 1;
        const currentManaPercentage = hero.calculatedStats.maxMana && hero.calculatedStats.maxMana > 0 ? hero.currentMana / hero.calculatedStats.maxMana : 0;

        const updatedHeroRecalc = { ...hero, calculatedStats: newStats };
        updatedHeroRecalc.currentHp = Math.max(1, Math.floor(newStats.maxHp * currentHpPercentage));
        if (newStats.maxMana && newStats.maxMana > 0) {
          updatedHeroRecalc.currentMana = Math.floor(newStats.maxMana * currentManaPercentage);
        } else {
          updatedHeroRecalc.currentMana = 0;
        }
        return updatedHeroRecalc;
      }
      return hero;
    });
  }
  
  if (enemyIdsToRecalculateStats && enemyIdsToRecalculateStats.length > 0) {
    currentUpdatedBattleEnemies = currentUpdatedBattleEnemies.map(enemy => {
        if (enemyIdsToRecalculateStats.includes(enemy.uniqueBattleId)) {
            const enemyDef = staticData.enemyDefinitions[enemy.id];
            let newStats = calculateWaveEnemyStats( 
                enemyDef,
                state.battleState!.waveNumber || 1,
                enemy.isElite,
                enemy.summonStrengthModifier
            );

            if (enemy.temporaryBuffs) {
                enemy.temporaryBuffs.forEach(buff => {
                    if (buff.stat && newStats[buff.stat] !== undefined && buff.value !== undefined) {
                        if (buff.modifierType === 'FLAT') {
                            (newStats[buff.stat] as number) += buff.value;
                        } else if (buff.modifierType === 'PERCENTAGE_ADDITIVE') { 
                            (newStats[buff.stat] as number) *= (1 + buff.value);
                        }
                    }
                });
            }
            const currentHpPercentage = enemy.calculatedStats.maxHp > 0 ? enemy.currentHp / enemy.calculatedStats.maxHp : 1;
            const updatedEnemyWithNewStats = { ...enemy, calculatedStats: newStats };
            updatedEnemyWithNewStats.currentHp = Math.max(1, Math.floor(newStats.maxHp * currentHpPercentage));
            return updatedEnemyWithNewStats;
        }
        return enemy;
    });
  }

  // Manage Damage Popups for Canvas
  const now = Date.now();
  currentDamagePopups = currentDamagePopups.filter(
    popup => now - popup.timestamp < (DAMAGE_POPUP_ANIMATION_DURATION_MS + DAMAGE_POPUP_LIFESPAN_BUFFER_MS)
  );
  currentDamagePopups.push(...newDamagePopupsFromEvents);
  if (currentDamagePopups.length > MAX_DAMAGE_POPUPS_IN_STATE) {
    currentDamagePopups = currentDamagePopups.slice(currentDamagePopups.length - MAX_DAMAGE_POPUPS_IN_STATE);
  }
  
  // 5. Handle Loot, XP, and Building Level Ups from defeated enemies
  const lootAndXPResult = handleLootAndXP(
    currentUpdatedBattleEnemies.filter(e => e.currentHp <= 0 && !currentDefeatedEnemiesWithLoot[e.uniqueBattleId]),
    currentUpdatedBattleHeroes,
    currentTickLootCollected, // Pass the per-tick loot accumulator
    currentTickExpCollected,   // Pass the per-tick XP accumulator
    currentBuildings,
    currentBuildingLevelUpEventsGameState,
    currentBuildingLevelUpEventsInBattle,
    currentNotifications,
    state,
    globalBonuses
  );
  currentTickLootCollected = lootAndXPResult.updatedLootCollected; // This is loot from this tick
  currentTickExpCollected = lootAndXPResult.updatedBattleExpCollected; // This is XP from this tick
  currentUpdatedBattleHeroes = lootAndXPResult.updatedHeroes;
  currentDefeatedEnemiesWithLoot = { ...currentDefeatedEnemiesWithLoot, ...lootAndXPResult.newlyDefeatedWithLoot };
  currentBuildings = lootAndXPResult.updatedBuildings;
  currentBuildingLevelUpEventsGameState = lootAndXPResult.updatedBuildingLevelUpEventsGameState;
  currentBuildingLevelUpEventsInBattle = lootAndXPResult.updatedBuildingLevelUpEventsInBattle;
  currentBattleLog.push(...lootAndXPResult.logMessages);
  currentNotifications = lootAndXPResult.updatedNotifications;
  allDeferredActionsThisTick.push(...lootAndXPResult.deferredActions); 

  if (lootAndXPResult.sharedSkillPointsGained > 0) {
    playerSharedSkillPointsFromBattle += lootAndXPResult.sharedSkillPointsGained;
    currentNotifications.push({
      id: Date.now().toString() + "-sharedSPGainedCombatWave",
      message: `Gained ${lootAndXPResult.sharedSkillPointsGained} Shared Skill Point(s)!`,
      type: 'success',
      iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined,
      timestamp: Date.now()
    });
  }

  currentUpdatedBattleEnemies = currentUpdatedBattleEnemies.filter(e => e.currentHp > 0 || e.isDying);

  // 6. Check Battle Status
  const nextBattleStatus = checkBattleStatus(currentUpdatedBattleHeroes, currentUpdatedBattleEnemies);

  const finalBattleLog = currentBattleLog.slice(-50);

  // Update session totals
  const updatedSessionTotalLoot = mergeCosts(currentTickBattleState.sessionTotalLoot || [], currentTickLootCollected);
  const updatedSessionTotalExp = (currentTickBattleState.sessionTotalExp || 0) + currentTickExpCollected;
  const updatedSessionBuildingLevelUps = [...(currentTickBattleState.sessionTotalBuildingLevelUps || []), ...currentBuildingLevelUpEventsInBattle.filter(e => !(currentTickBattleState.sessionTotalBuildingLevelUps || []).find(existing => existing.id === e.id))];


  const finalBattleState: BattleState = {
    ...currentTickBattleState, // Use the state from the start of this tick as base
    heroes: currentUpdatedBattleHeroes,
    enemies: currentUpdatedBattleEnemies,
    battleLog: finalBattleLog,
    status: nextBattleStatus,
    ticksElapsed: currentTickBattleState.ticksElapsed + 1,
    lastAttackEvents: allAttackEventsThisTick.slice(-10),
    damagePopups: currentDamagePopups,
    fusionAnchors: currentFusionAnchors, 
    feederParticles: currentFeederParticles, 
    battleLootCollected: currentTickLootCollected, // Store this tick's loot
    defeatedEnemiesWithLoot: currentDefeatedEnemiesWithLoot,
    battleExpCollected: currentTickExpCollected, // Store this tick's XP
    buildingLevelUpEventsInBattle: currentBuildingLevelUpEventsInBattle, // Store this tick's building level ups
    sessionTotalLoot: updatedSessionTotalLoot,
    sessionTotalExp: updatedSessionTotalExp,
    sessionTotalBuildingLevelUps: updatedSessionBuildingLevelUps,
  };

  let finalGameState = { ...state, battleState: finalBattleState, buildings: currentBuildings, buildingLevelUpEvents: currentBuildingLevelUpEventsGameState, notifications: currentNotifications, playerSharedSkillPoints: playerSharedSkillPointsFromBattle };
  
  lootAndXPResult.deferredActions.forEach(deferredAction => {
    if (deferredAction.type === 'GAIN_RUN_XP') {
        if (finalGameState.activeDungeonRun) {
            const currentRun = finalGameState.activeDungeonRun;
            let updatedRunXP = currentRun.runXP + deferredAction.payload.amount;
            let updatedRunLevel = currentRun.runLevel;
            let updatedExpToNextRunLevel = currentRun.expToNextRunLevel;
            let updatedOfferedBuffChoices = currentRun.offeredBuffChoices;
            let runLevelUpNotifications: GameNotification[] = [];

            while (updatedRunXP >= updatedExpToNextRunLevel) {
                updatedRunLevel++;
                updatedRunXP -= updatedExpToNextRunLevel;
                updatedExpToNextRunLevel = calculateRunExpToNextLevel(updatedRunLevel);
                runLevelUpNotifications.push({
                    id: `${Date.now()}-runLevelUpCombat-${updatedRunLevel}`,
                    message: `Run Level Up! Reached Level ${updatedRunLevel}. Choose a buff!`,
                    type: 'success',
                    iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined,
                    timestamp: Date.now()
                });

                const numChoices = (staticData.dungeonDefinitions[currentRun.dungeonDefinitionId]?.finalReward.permanentBuffChoices || 3) + globalBonuses.dungeonBuffChoicesBonus;
                const availableBuffs = Object.values(staticData.runBuffDefinitions).filter(buff => finalGameState.unlockedRunBuffs.includes(buff.id));
                const chosenBuffIds: string[] = [];
                if(availableBuffs.length > 0){
                    for (let i = 0; i < numChoices && availableBuffs.length > 0; i++) {
                        const buffDefinition = availableBuffs.splice(Math.floor(Math.random() * availableBuffs.length), 1)[0] as RunBuffDefinition;
                        chosenBuffIds.push(buffDefinition.id);
                    }
                }
                updatedOfferedBuffChoices = chosenBuffIds.length > 0 ? chosenBuffIds : null;
            }
            finalGameState.activeDungeonRun = {
                ...currentRun,
                runXP: updatedRunXP,
                runLevel: updatedRunLevel,
                expToNextRunLevel: updatedExpToNextRunLevel,
                offeredBuffChoices: updatedOfferedBuffChoices,
            };
            finalGameState.notifications = [...finalGameState.notifications, ...runLevelUpNotifications];
            allDeferredActionsThisTick = allDeferredActionsThisTick.filter(da => da.type !== 'GAIN_RUN_XP');
        }
    }
  });

  return { 
    updatedGameState: finalGameState, 
    deferredActions: allDeferredActionsThisTick,
    newlyAddedToFirstTimeDefeatsForAccXp: lootAndXPResult.newlyAddedToFirstTimeDefeatsForAccXp,
  };
};