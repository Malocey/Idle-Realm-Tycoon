
import { GameState, GameAction, GlobalBonuses, BattleHero, BattleEnemy, Cost, ResourceType, GameNotification, BattleState, BuildingLevelUpEventInBattle, WaveDefinition } from '../../types';
import { HERO_DEFINITIONS, SKILL_TREES, WAVE_DEFINITIONS, ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, worldMapDefinitions } from '../../gameData/index';
import { calculateHeroStats, calculateWaveEnemyStats, getExpToNextHeroLevel, formatNumber } from '../../utils';
import { MAX_WAVE_NUMBER, NOTIFICATION_ICONS } from '../../constants';
import { ICONS } from '../../components/Icons';

type StartWaveBattlePreparationPayload = Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>['payload'];

export const startBattleReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>,
  globalBonuses: GlobalBonuses
): GameState => {
  if (action.type !== 'START_WAVE_BATTLE_PREPARATION') {
    return state;
  }

  const {
      waveNumber, 
      isAutoProgression,
      persistedHeroHp,
      persistedHeroMana,
      persistedHeroSpecialCooldowns,
      rewardsForPreviousWave,
      expFromPreviousWave,
      previousWaveNumberCleared, 
      buildingLevelUpEventsFromPreviousWave,
      previousBattleOutcomeForQuestProcessing,
      sourceMapNodeId,
      customWaveSequence,
      currentCustomWaveIndex // 0-indexed for the wave TO START
  } = action.payload;

  let waveDefToUse: WaveDefinition | undefined;
  let actualBattleTitleWaveNumber = waveNumber;
  let actualCustomWaveSequenceForState: string[] | undefined = customWaveSequence;
  let actualCurrentCustomWaveIndexForState: number | undefined = currentCustomWaveIndex;
  let mapNodeNameForLog: string | undefined;

  if (sourceMapNodeId) {
    const mapDef = worldMapDefinitions[state.currentMapId];
    const mapNode = mapDef?.nodes.find(n => n.id === sourceMapNodeId);
    mapNodeNameForLog = mapNode?.name;

    if (customWaveSequence && currentCustomWaveIndex !== undefined && currentCustomWaveIndex < customWaveSequence.length) {
      waveDefToUse = WAVE_DEFINITIONS.find(w => w.id === customWaveSequence[currentCustomWaveIndex!]);
      actualBattleTitleWaveNumber = currentCustomWaveIndex + 1; // 1-indexed for display
    } else if (mapNode?.customWaveDefinitionIds && mapNode.customWaveDefinitionIds.length > 0 && (!customWaveSequence || currentCustomWaveIndex === undefined)) {
      // This means it's the START of a custom sequence from a map node click (not auto-progression into it)
      actualCustomWaveSequenceForState = mapNode.customWaveDefinitionIds;
      actualCurrentCustomWaveIndexForState = 0;
      waveDefToUse = WAVE_DEFINITIONS.find(w => w.id === actualCustomWaveSequenceForState![0]);
      actualBattleTitleWaveNumber = 1;
    } else if (mapNode?.battleWaveStart !== undefined && !customWaveSequence) {
      waveDefToUse = WAVE_DEFINITIONS.find(w => w.waveNumber === mapNode.battleWaveStart);
      actualBattleTitleWaveNumber = mapNode.battleWaveStart;
      actualCustomWaveSequenceForState = undefined; // Ensure it's cleared for non-sequence map battles
      actualCurrentCustomWaveIndexForState = undefined;
    }
  } else { // Normal wave progression
    waveDefToUse = WAVE_DEFINITIONS.find(w => w.waveNumber === waveNumber);
    actualBattleTitleWaveNumber = waveNumber;
  }

  if (!waveDefToUse) {
    let errorMsg = `Wave definition not found for ${sourceMapNodeId ? `map node ${mapNodeNameForLog || sourceMapNodeId}` : `wave ${waveNumber}`}.`;
    if(actualCustomWaveSequenceForState && actualCurrentCustomWaveIndexForState !== undefined && actualCustomWaveSequenceForState[actualCurrentCustomWaveIndexForState]){
      errorMsg += ` Attempted custom wave ID: ${actualCustomWaveSequenceForState[actualCurrentCustomWaveIndexForState]}.`;
    } else if (actualCustomWaveSequenceForState && actualCurrentCustomWaveIndexForState !== undefined) {
      errorMsg += ` Invalid index ${actualCurrentCustomWaveIndexForState} for custom sequence of length ${actualCustomWaveSequenceForState.length}.`;
    }
    console.error(errorMsg, action.payload);
    const errorNotification: GameNotification = { id: Date.now().toString(), message: errorMsg, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
    return { ...state, notifications: [...state.notifications, errorNotification] };
  }
  if (state.heroes.length === 0) {
    const noHeroesNotification: GameNotification = { id: Date.now().toString(), message: "Cannot start battle: No heroes available.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
    return { ...state, notifications: [...state.notifications, noHeroesNotification] };
  }


  let tempNewResources = { ...state.resources };
  let tempUpdatedHeroes = state.heroes.map(h => ({...h}));
  let tempCurrentWaveProgress = state.currentWaveProgress;
  let tempNotifications = [...state.notifications];
  let sharedSkillPointsGainedFromWaveXP = 0;
  let newSessionTotalLoot: Cost[] = (isAutoProgression && state.battleState?.sessionTotalLoot) ? [...state.battleState.sessionTotalLoot] : [];
  let newSessionTotalExp: number = (isAutoProgression && state.battleState?.sessionTotalExp) ? state.battleState.sessionTotalExp : 0;
  let newSessionTotalBuildingLevelUps = (isAutoProgression && state.battleState?.sessionTotalBuildingLevelUps) ? [...state.battleState.sessionTotalBuildingLevelUps] : [];


  if (isAutoProgression && previousWaveNumberCleared !== undefined) {
      const effectivePrevWaveForProgress = actualCustomWaveSequenceForState ? (previousWaveNumberCleared +1) : previousWaveNumberCleared;
      tempCurrentWaveProgress = Math.max(state.currentWaveProgress, effectivePrevWaveForProgress || 0);
      
      if (rewardsForPreviousWave) {
          const mergedLoot: Cost[] = [...newSessionTotalLoot];
          rewardsForPreviousWave.forEach(reward => {
              const existingLoot = mergedLoot.find(l => l.resource === reward.resource);
              if (existingLoot) existingLoot.amount += Math.floor(reward.amount);
              else mergedLoot.push({ ...reward, amount: Math.floor(reward.amount) });
          });
          newSessionTotalLoot = mergedLoot;
          rewardsForPreviousWave.forEach(r => tempNewResources[r.resource] = (tempNewResources[r.resource] || 0) + Math.floor(r.amount));
      }
      newSessionTotalExp += (expFromPreviousWave || 0);
      if (buildingLevelUpEventsFromPreviousWave) { 
        newSessionTotalBuildingLevelUps = [...newSessionTotalBuildingLevelUps, ...buildingLevelUpEventsFromPreviousWave];
      }

      const previousBattleSurvivorsForXp = state.battleState?.heroes
        .filter(h => persistedHeroHp && persistedHeroHp[h.definitionId] && persistedHeroHp[h.definitionId] > 0)
        .map(h => h.definitionId) || [];

      if (expFromPreviousWave && expFromPreviousWave > 0 && previousBattleSurvivorsForXp.length > 0) {
          let modifiedExpFromWave = expFromPreviousWave * (1 + globalBonuses.heroXpGainBonus);
          const expPerSurvivor = Math.floor(modifiedExpFromWave / previousBattleSurvivorsForXp.length);
          tempUpdatedHeroes = tempUpdatedHeroes.map(hero => {
              if (previousBattleSurvivorsForXp.includes(hero.definitionId)) {
                  let heroCopy = {...hero};
                  const levelBeforeXP = heroCopy.level;
                  heroCopy.currentExp += expPerSurvivor;
                  while (heroCopy.currentExp >= heroCopy.expToNextLevel) {
                      heroCopy.currentExp -= heroCopy.expToNextLevel;
                      heroCopy.level++; heroCopy.skillPoints++;
                      heroCopy.expToNextLevel = getExpToNextHeroLevel(heroCopy.level);
                      tempNotifications.push({id: `${Date.now()}-levelup-${heroCopy.definitionId}-${heroCopy.level}`, message: `${HERO_DEFINITIONS[heroCopy.definitionId]?.name} reached Level ${heroCopy.level}! (Wave Reward)`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()});
                  }
                  const levelsActuallyGained = heroCopy.level - levelBeforeXP;
                  if (levelsActuallyGained > 0) sharedSkillPointsGainedFromWaveXP += levelsActuallyGained;
                  return heroCopy;
              }
              return hero;
          });
      }
       if (!actualCustomWaveSequenceForState && previousWaveNumberCleared !== undefined && previousWaveNumberCleared >= MAX_WAVE_NUMBER) {
           tempNotifications.push({id: `${Date.now()}-maxwave-auto`, message: `Congratulations! You've cleared the final wave (auto-progress)!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()});
      }
  } else if (!isAutoProgression) { 
      newSessionTotalLoot = [];
      newSessionTotalExp = 0;
      newSessionTotalBuildingLevelUps = [];
  }


  const battleHeroes: BattleHero[] = tempUpdatedHeroes
    .filter(h => isAutoProgression ? (persistedHeroHp ? (persistedHeroHp[h.definitionId] || 0) > 0 : false) : true)
    .map((h, idx) => {
        const heroDef = HERO_DEFINITIONS[h.definitionId];
        const skillTree = SKILL_TREES[heroDef.skillTreeId];
        const calculatedStats = calculateHeroStats(h, heroDef, skillTree, state, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, globalBonuses, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS);
        let currentHp = isAutoProgression && persistedHeroHp && persistedHeroHp[h.definitionId] !== undefined ? persistedHeroHp[h.definitionId] : calculatedStats.maxHp;
        let currentMana = isAutoProgression && persistedHeroMana && persistedHeroMana[h.definitionId] !== undefined ? persistedHeroMana[h.definitionId] : (calculatedStats.maxMana || 0);
        let specialAttackCooldownsRemaining: Record<string, number> = {};
        Object.keys(h.specialAttackLevels).forEach(saId => specialAttackCooldownsRemaining[saId] = (isAutoProgression && persistedHeroSpecialCooldowns && persistedHeroSpecialCooldowns[h.definitionId]?.[saId] !== undefined) ? persistedHeroSpecialCooldowns[h.definitionId][saId] : 0);
        return {
            ...heroDef, ...h,
            attackType: heroDef.attackType || 'MELEE', rangedAttackRangeUnits: heroDef.rangedAttackRangeUnits,
            uniqueBattleId: `${h.definitionId}_${idx}_hero_wave${actualBattleTitleWaveNumber}`,
            currentHp: Math.max(0, currentHp), currentMana: Math.max(0, currentMana), calculatedStats,
            attackCooldown: (1000 / calculatedStats.attackSpeed), attackCooldownRemainingTicks: 0,
            movementSpeed: 0, x: 0, y: 0, specialAttackCooldownsRemaining, statusEffects: [], temporaryBuffs: [],
            currentEnergyShield: calculatedStats.maxEnergyShield || 0, shieldRechargeDelayTicksRemaining: 0,
            isTaunting: heroDef.id === 'PALADIN' && h.skillLevels['PSK001'] > 0,
        };
  });
  if (battleHeroes.length === 0) {
     tempNotifications.push({id: Date.now().toString(), message: 'Auto-progression failed: No heroes for next wave. Returning to Town.', type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
     return { ...state, resources: tempNewResources, heroes: tempUpdatedHeroes, currentWaveProgress: tempCurrentWaveProgress, activeView: 'TOWN', battleState: null, notifications: tempNotifications, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedFromWaveXP };
  }
  const battleEnemies: BattleEnemy[] = [];
  waveDefToUse.enemies.forEach((ew, i_outer) => ENEMY_DEFINITIONS[ew.enemyId] && Array.from({length: ew.count}).forEach((_, i_inner) => {
    const enemyDef = ENEMY_DEFINITIONS[ew.enemyId];
    const finalStats = calculateWaveEnemyStats(enemyDef, actualBattleTitleWaveNumber); // Use actualBattleTitleWaveNumber for scaling
    const battleEnemyInstance: BattleEnemy = {
        ...enemyDef, attackType: enemyDef.attackType || 'MELEE', rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
        calculatedStats: finalStats, uniqueBattleId: `${ew.enemyId}_${i_outer}_${i_inner}_enemy_wave${actualBattleTitleWaveNumber}`,
        currentHp: finalStats.maxHp, currentEnergyShield: finalStats.maxEnergyShield || 0, shieldRechargeDelayTicksRemaining: 0,
        attackCooldown: (1000 / finalStats.attackSpeed), attackCooldownRemainingTicks: 0,
        movementSpeed: 0, x: 0, y: 0, statusEffects: [], isElite: false, specialAttackCooldownsRemaining: {},
        summonStrengthModifier: enemyDef.summonAbility ? 1.0 : undefined,
        currentShieldHealCooldownMs: enemyDef.shieldHealAbility?.initialCooldownMs ?? enemyDef.shieldHealAbility?.cooldownMs,
    };
    battleEnemies.push(battleEnemyInstance);
  }));
  if (sharedSkillPointsGainedFromWaveXP > 0) tempNotifications.push({ id: Date.now().toString() + "-sspWave", message: `Gained ${sharedSkillPointsGainedFromWaveXP} Shared Skill Point(s) from wave XP!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
  
  const battleLogTitle = sourceMapNodeId && actualCustomWaveSequenceForState 
    ? `${mapNodeNameForLog || 'Map Battle'} - Wave ${actualBattleTitleWaveNumber}`
    : `Wave ${actualBattleTitleWaveNumber}`;

  const newBattleState: BattleState = {
    waveNumber: actualBattleTitleWaveNumber, 
    customWaveSequence: actualCustomWaveSequenceForState,
    currentCustomWaveIndex: actualCurrentCustomWaveIndexForState,
    sourceMapNodeId: sourceMapNodeId,
    heroes: battleHeroes, enemies: battleEnemies,
    battleLog: [`${battleLogTitle} starting!`], status: 'FIGHTING', ticksElapsed: 0, lastAttackEvents: [],
    battleLootCollected: [], defeatedEnemiesWithLoot: {}, battleExpCollected: 0, buildingLevelUpEventsInBattle: [], activePotionIdForUsage: null,
    sessionTotalLoot: newSessionTotalLoot, sessionTotalExp: newSessionTotalExp, sessionTotalBuildingLevelUps: newSessionTotalBuildingLevelUps,
  };
  return { ...state, resources: tempNewResources, heroes: tempUpdatedHeroes, currentWaveProgress: tempCurrentWaveProgress, activeView: 'BATTLEFIELD', battleState: newBattleState, notifications: tempNotifications, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedFromWaveXP };
};
