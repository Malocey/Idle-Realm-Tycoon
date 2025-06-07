
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, ResourceType, RunBuffDefinition, AttackEvent, BattleState, GameContextType, StatusEffectType, BattleHero } from '../types';
import { calculateGlobalBonusesFromAllSources, formatNumber, canAfford, calculateHeroStats as calculateHeroStatsUtil, mergeCosts, calculateDemoniconEnemyStats as calculateDemoniconEnemyStatsUtil } from '../utils';
import { TOWN_HALL_UPGRADE_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, HERO_DEFINITIONS, ENEMY_DEFINITIONS, BUILDING_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, EQUIPMENT_DEFINITIONS, RUN_BUFF_DEFINITIONS, SKILL_TREES, SHARD_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../constants';
import { ICONS } from '../components/Icons';

// Import combat helper functions from their original location
import { updateParticipants } from '../reducers/combat/participantUpdater';
import { processHeroActions } from '../reducers/combat/heroActions';
import { processEnemyActions } from '../reducers/combat/enemyActions';
import { processAttackEvents } from '../reducers/combat/eventProcessor';
import { handleLootAndXP } from '../reducers/combat/lootAndXPHandler';
import { checkBattleStatus } from '../reducers/combat/battleStatusManager';
import { calculateRunExpToNextLevel } from '../utils';

export const processDemoniconBattleTick = (
    state: GameState,
    globalBonuses: GlobalBonuses,
    staticData: GameContextType['staticData']
): GameState => {
  if (!state.battleState || state.battleState.status !== 'FIGHTING' || !state.battleState.isDemoniconBattle) {
    return state;
  }

  const battleTickDurationMs = GAME_TICK_MS / state.gameSpeed;
  let currentBattleState = { ...state.battleState }; // Work with a mutable copy

  let currentBattleLog = [...currentBattleState.battleLog];
  // battleLootCollected & battleExpCollected are for the CURRENT RANK's rewards
  let currentRankLootCollected: Cost[] = [...currentBattleState.battleLootCollected];
  let currentRankExpCollected = currentBattleState.battleExpCollected;

  // sessionTotalLoot & sessionTotalExp are for the ENTIRE DEMONICON RUN (for display)
  // These are initialized from activeDemoniconChallenge at rank start, then accumulated here.
  let currentSessionTotalLootForDisplay: Cost[] = currentBattleState.sessionTotalLoot ? [...currentBattleState.sessionTotalLoot] : [];
  let currentSessionTotalExpForDisplay: number = currentBattleState.sessionTotalExp || 0;


  let currentDefeatedEnemiesWithLoot = {...currentBattleState.defeatedEnemiesWithLoot};
  let currentUpdatedBattleHeroes = currentBattleState.heroes.map(h => ({...h, statusEffects: [...(h.statusEffects || [])], temporaryBuffs: [...(h.temporaryBuffs || [])] }));
  let currentUpdatedBattleEnemies = currentBattleState.enemies.map(e => ({...e, statusEffects: [...(e.statusEffects || [])]}));

  let currentNotifications = [...state.notifications];
  // Building-related state is not typically modified by Demonicon battles
  let currentBuildings = [...state.buildings];
  let currentBuildingLevelUpEventsGameState = {...state.buildingLevelUpEvents};
  let currentBuildingLevelUpEventsInBattle = [...(currentBattleState.buildingLevelUpEventsInBattle || [])];
  let actionsToDispatch: GameAction[] = [];
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

  // 5. Handle Loot & XP from defeated enemies this tick
  const newlyDefeatedThisTick = currentUpdatedBattleEnemies.filter(e => e.currentHp <= 0 && !currentDefeatedEnemiesWithLoot[e.uniqueBattleId]);
  const demoniconLootAndXPResult = handleLootAndXP(
    newlyDefeatedThisTick,
    currentUpdatedBattleHeroes,
    currentRankLootCollected, // Pass this rank's loot accumulator
    currentRankExpCollected,   // Pass this rank's XP accumulator
    currentBuildings, currentBuildingLevelUpEventsGameState, currentBuildingLevelUpEventsInBattle,
    currentNotifications, state, globalBonuses
  );
  // Update per-rank accumulators
  currentRankLootCollected = demoniconLootAndXPResult.updatedLootCollected;
  currentRankExpCollected = demoniconLootAndXPResult.updatedBattleExpCollected;

  // Update session total accumulators for display
  newlyDefeatedThisTick.forEach(defeatedEnemy => {
      const lootData = demoniconLootAndXPResult.newlyDefeatedWithLoot[defeatedEnemy.uniqueBattleId];
      if (lootData) {
          currentSessionTotalLootForDisplay = mergeCosts(currentSessionTotalLootForDisplay, lootData.loot);
          const enemyDef = staticData.enemyDefinitions[defeatedEnemy.id];
          if (enemyDef) {
            currentSessionTotalExpForDisplay += enemyDef.expReward; // Use base XP from def for session total display
          }
      }
  });

  currentUpdatedBattleHeroes = demoniconLootAndXPResult.updatedHeroes;
  currentDefeatedEnemiesWithLoot = { ...currentDefeatedEnemiesWithLoot, ...demoniconLootAndXPResult.newlyDefeatedWithLoot };
  currentBattleLog.push(...demoniconLootAndXPResult.logMessages);
  currentNotifications = demoniconLootAndXPResult.updatedNotifications;
  playerSharedSkillPointsFromBattle += demoniconLootAndXPResult.sharedSkillPointsGained; // Update shared skill points


  currentUpdatedBattleEnemies = currentUpdatedBattleEnemies.filter(e => e.currentHp > 0 || e.isDying);

  // 6. Check Battle Status
  const nextBattleStatus = checkBattleStatus(currentUpdatedBattleHeroes, currentUpdatedBattleEnemies);

  const finalBattleLog = currentBattleLog.slice(-50);

  // Update the battleState
  currentBattleState.heroes = currentUpdatedBattleHeroes;
  currentBattleState.enemies = currentUpdatedBattleEnemies;
  currentBattleState.battleLog = finalBattleLog;
  currentBattleState.status = nextBattleStatus;
  currentBattleState.ticksElapsed += 1;
  currentBattleState.lastAttackEvents = allAttackEventsThisTick.slice(-10);
  currentBattleState.battleLootCollected = currentRankLootCollected;
  currentBattleState.defeatedEnemiesWithLoot = currentDefeatedEnemiesWithLoot;
  currentBattleState.battleExpCollected = currentRankExpCollected;
  currentBattleState.sessionTotalLoot = currentSessionTotalLootForDisplay;
  currentBattleState.sessionTotalExp = currentSessionTotalExpForDisplay;


  return { ...state, battleState: currentBattleState, notifications: currentNotifications, playerSharedSkillPoints: playerSharedSkillPointsFromBattle };
};
