
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, ResourceType, RunBuffDefinition, AttackEvent, BattleState, GameContextType, StatusEffectType, BattleHero, FusionAnchor, DamagePopupInState, FeederParticle } from '../types';
import { calculateGlobalBonusesFromAllSources, formatNumber, canAfford, calculateHeroStats as calculateHeroStatsUtil, mergeCosts, calculateDemoniconEnemyStats as calculateDemoniconEnemyStatsUtil, calculateWaveEnemyStats } from '../utils';
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

interface DemoniconBattleTickResult {
    updatedGameState: GameState;
    deferredActions: GameAction[];
    newlyAddedToFirstTimeDefeatsForAccXp?: string[];
}

export const processDemoniconBattleTick = (
    state: GameState,
    globalBonuses: GlobalBonuses,
    staticData: GameContextType['staticData']
): DemoniconBattleTickResult => {
  if (!state.battleState || state.battleState.status !== 'FIGHTING' || !state.battleState.isDemoniconBattle) {
    return { updatedGameState: state, deferredActions: [] };
  }

  const battleTickDurationMs = GAME_TICK_MS / state.gameSpeed;
  let currentBattleState = { ...state.battleState }; // Work with a mutable copy
  let allDeferredActionsThisTick: GameAction[] = [];

  let currentBattleLog = [...currentBattleState.battleLog];
  let currentRankLootCollected: Cost[] = [...currentBattleState.battleLootCollected];
  let currentRankExpCollected = currentBattleState.battleExpCollected;
  let currentSessionTotalLootForDisplay: Cost[] = currentBattleState.sessionTotalLoot ? [...currentBattleState.sessionTotalLoot] : [];
  let currentSessionTotalExpForDisplay: number = currentBattleState.sessionTotalExp || 0;
  let currentDamagePopups = [...(currentBattleState.damagePopups || [])];
  let currentFusionAnchors = [...(currentBattleState.fusionAnchors || [])];
  let currentFeederParticles = [...(currentBattleState.feederParticles || [])];


  let currentDefeatedEnemiesWithLoot = {...currentBattleState.defeatedEnemiesWithLoot};
  let currentUpdatedBattleHeroes = currentBattleState.heroes.map(h => ({...h, statusEffects: [...(h.statusEffects || [])], temporaryBuffs: [...(h.temporaryBuffs || [])] }));
  let currentUpdatedBattleEnemies = currentBattleState.enemies.map(e => ({...e, statusEffects: [...(e.statusEffects || [])], temporaryBuffs: [...(e.temporaryBuffs || [])] }));


  let currentNotifications = [...state.notifications];
  let currentBuildings = [...state.buildings];
  let currentBuildingLevelUpEventsGameState = {...state.buildingLevelUpEvents};
  let currentBuildingLevelUpEventsInBattle = [...(currentBattleState.buildingLevelUpEventsInBattle || [])];
  
  let playerSharedSkillPointsFromBattle = state.playerSharedSkillPoints;


  // 1. Update Participants
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
  const allNewSummonsThisTick = [ ...newSummonsFromParticipantUpdate, ...newSummonsFromHeroActions, ...newSummonsFromEnemyActions ];
  if (allNewSummonsThisTick.length > 0) {
    currentUpdatedBattleEnemies.push(...allNewSummonsThisTick);
    currentBattleLog.push(`${allNewSummonsThisTick.length} new unit(s) appeared in Demonicon!`);
  }

  const allAttackEventsThisTick: AttackEvent[] = [...heroAttackEvents, ...enemyAttackEvents, ...participantUpdateResult.attackEventsFromDots];

  // 4. Process Attack Events
  const eventProcessingResult = processAttackEvents(allAttackEventsThisTick, currentUpdatedBattleHeroes, currentUpdatedBattleEnemies, state, globalBonuses);
  currentUpdatedBattleHeroes = eventProcessingResult.updatedHeroes;
  currentUpdatedBattleEnemies = eventProcessingResult.updatedEnemies;
  currentBattleLog.push(...eventProcessingResult.logMessages);
  const enemyIdsToRecalculateStats = eventProcessingResult.statsRecalculationNeededForEnemyIds;
  const newDamagePopupsFromEvents = eventProcessingResult.newDamagePopupsForCanvas;
  currentFusionAnchors = eventProcessingResult.updatedFusionAnchors;
  currentFeederParticles = [...currentFeederParticles, ...eventProcessingResult.newFeederParticles]; // Append new feeder particles

  if (eventProcessingResult.newSummonsFromPhase && eventProcessingResult.newSummonsFromPhase.length > 0) {
    currentUpdatedBattleEnemies.push(...eventProcessingResult.newSummonsFromPhase);
  }

  if (statsRecalculationNeededForHeroIds.length > 0) {
    currentUpdatedBattleHeroes = currentUpdatedBattleHeroes.map(hero => {
      if (statsRecalculationNeededForHeroIds.includes(hero.uniqueBattleId)) {
        const heroDef = staticData.heroDefinitions[hero.definitionId];
        const skillTree = staticData.skillTrees[heroDef.skillTreeId];
        const newStats = calculateHeroStatsUtil(hero, heroDef, skillTree, state, staticData.townHallUpgradeDefinitions, staticData.guildHallUpgradeDefinitions, staticData.equipmentDefinitions, globalBonuses, staticData.shardDefinitions, staticData.runBuffDefinitions, staticData.statusEffectDefinitions, true, state.achievedDemoniconMilestoneRewards);
        const currentHpPercentage = hero.calculatedStats.maxHp > 0 ? hero.currentHp / hero.calculatedStats.maxHp : 1;
        const currentManaPercentage = hero.calculatedStats.maxMana && hero.calculatedStats.maxMana > 0 ? hero.currentMana / hero.calculatedStats.maxMana : 0;
        const updatedHeroRecalc = { ...hero, calculatedStats: newStats };
        updatedHeroRecalc.currentHp = Math.max(1, Math.floor(newStats.maxHp * currentHpPercentage));
        if (newStats.maxMana && newStats.maxMana > 0) updatedHeroRecalc.currentMana = Math.floor(newStats.maxMana * currentManaPercentage);
        else updatedHeroRecalc.currentMana = 0;
        return updatedHeroRecalc;
      }
      return hero;
    });
  }

  if (enemyIdsToRecalculateStats && enemyIdsToRecalculateStats.length > 0) {
    currentUpdatedBattleEnemies = currentUpdatedBattleEnemies.map(enemy => {
        if (enemyIdsToRecalculateStats.includes(enemy.uniqueBattleId)) {
            const enemyDef = staticData.enemyDefinitions[enemy.id];
            let newStats = calculateDemoniconEnemyStatsUtil( 
                enemyDef,
                state.battleState!.demoniconRank || 0,
                staticData,
                globalBonuses
            )[0].calculatedStats; 

            if (enemy.temporaryBuffs) {
                enemy.temporaryBuffs.forEach(buff => {
                    if (buff.stat && newStats[buff.stat] !== undefined && buff.value !== undefined) {
                        if (buff.modifierType === 'FLAT') {
                            (newStats[buff.stat] as number) += buff.value;
                        } else if (buff.modifierType === 'PERCENTAGE_ADDITIVE') { // Corrected comparison
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
  // Feeder particle cleanup is handled in tickReducer now.

  // 5. Handle Loot & XP from defeated enemies this tick
  const newlyDefeatedThisTick = currentUpdatedBattleEnemies.filter(e => e.currentHp <= 0 && !currentDefeatedEnemiesWithLoot[e.uniqueBattleId]);
  const demoniconLootAndXPResult = handleLootAndXP(
    newlyDefeatedThisTick,
    currentUpdatedBattleHeroes,
    currentRankLootCollected, 
    currentRankExpCollected,   
    currentBuildings, currentBuildingLevelUpEventsGameState, currentBuildingLevelUpEventsInBattle,
    currentNotifications, state, globalBonuses
  );
  currentRankLootCollected = demoniconLootAndXPResult.updatedLootCollected;
  currentRankExpCollected = demoniconLootAndXPResult.updatedBattleExpCollected;
  allDeferredActionsThisTick.push(...demoniconLootAndXPResult.deferredActions); 

  newlyDefeatedThisTick.forEach(defeatedEnemy => {
      const lootData = demoniconLootAndXPResult.newlyDefeatedWithLoot[defeatedEnemy.uniqueBattleId];
      if (lootData) {
          currentSessionTotalLootForDisplay = mergeCosts(currentSessionTotalLootForDisplay, lootData.loot);
          const enemyDef = staticData.enemyDefinitions[defeatedEnemy.id];
          if (enemyDef) {
            currentSessionTotalExpForDisplay += enemyDef.expReward; 
          }
      }
  });

  currentUpdatedBattleHeroes = demoniconLootAndXPResult.updatedHeroes;
  currentDefeatedEnemiesWithLoot = { ...currentDefeatedEnemiesWithLoot, ...demoniconLootAndXPResult.newlyDefeatedWithLoot };
  currentBattleLog.push(...demoniconLootAndXPResult.logMessages);
  currentNotifications = demoniconLootAndXPResult.updatedNotifications;
  playerSharedSkillPointsFromBattle += demoniconLootAndXPResult.sharedSkillPointsGained; 


  currentUpdatedBattleEnemies = currentUpdatedBattleEnemies.filter(e => e.currentHp > 0 || e.isDying);

  // 6. Check Battle Status
  const nextBattleStatus = checkBattleStatus(currentUpdatedBattleHeroes, currentUpdatedBattleEnemies);

  const finalBattleLog = currentBattleLog.slice(-50);

  currentBattleState.heroes = currentUpdatedBattleHeroes;
  currentBattleState.enemies = currentUpdatedBattleEnemies;
  currentBattleState.battleLog = finalBattleLog;
  currentBattleState.status = nextBattleStatus;
  currentBattleState.ticksElapsed += 1;
  currentBattleState.lastAttackEvents = allAttackEventsThisTick.slice(-10);
  currentBattleState.damagePopups = currentDamagePopups;
  currentBattleState.fusionAnchors = currentFusionAnchors; 
  currentBattleState.feederParticles = currentFeederParticles; // Assign updated feeder particles
  currentBattleState.battleLootCollected = currentRankLootCollected;
  currentBattleState.defeatedEnemiesWithLoot = currentDefeatedEnemiesWithLoot;
  currentBattleState.battleExpCollected = currentRankExpCollected;
  currentBattleState.sessionTotalLoot = currentSessionTotalLootForDisplay;
  currentBattleState.sessionTotalExp = currentSessionTotalExpForDisplay;


  return { 
      updatedGameState: { ...state, battleState: currentBattleState, notifications: currentNotifications, playerSharedSkillPoints: playerSharedSkillPointsFromBattle },
      deferredActions: allDeferredActionsThisTick,
      newlyAddedToFirstTimeDefeatsForAccXp: demoniconLootAndXPResult.newlyAddedToFirstTimeDefeatsForAccXp,
    };
};
