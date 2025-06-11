
import { GameState, GameAction, GlobalBonuses, BattleHero, BattleEnemy, Cost, ResourceType, GameNotification, BattleState, BuildingLevelUpEventInBattle, WaveDefinition } from '../../types';
import { HERO_DEFINITIONS, SKILL_TREES, WAVE_DEFINITIONS, ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, worldMapDefinitions, calculateXPForAccountLevel as calculateXPForAccountLevelUtil } from '../../gameData/index';
import { calculateHeroStats, calculateWaveEnemyStats, getExpToNextHeroLevel, formatNumber } from '../../utils';
import { MAX_WAVE_NUMBER, NOTIFICATION_ICONS } from '../../constants';
import { ICONS } from '../../components/Icons';

type StartWaveBattlePreparationPayload = Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>['payload'];
type EndWaveBattleResultPayload = Extract<GameAction, { type: 'END_WAVE_BATTLE_RESULT' }>['payload'];

type WaveBattleFlowAction = 
  | { type: 'START_WAVE_BATTLE_PREPARATION'; payload: StartWaveBattlePreparationPayload }
  | { type: 'END_WAVE_BATTLE_RESULT'; payload: EndWaveBattleResultPayload };

interface WaveBattleFlowResult {
  updatedState: GameState;
  deferredActions: GameAction[];
}

export const waveBattleFlowReducer = (
  state: GameState,
  action: WaveBattleFlowAction,
  globalBonuses: GlobalBonuses
): WaveBattleFlowResult => {
  let deferredAccountXpActions: GameAction[] = [];

  switch (action.type) {
    case 'START_WAVE_BATTLE_PREPARATION': {
      const {
          waveNumber, // For normal waves, or initial wave number for old map battles
          isAutoProgression,
          persistedHeroHp,
          persistedHeroMana,
          persistedHeroSpecialCooldowns,
          rewardsForPreviousWave,
          expFromPreviousWave,
          previousWaveNumberCleared, // For normal waves, this is the actual wave number; for custom, it's the 0-indexed previous step
          buildingLevelUpEventsFromPreviousWave, 
          previousBattleOutcomeForQuestProcessing,
          sourceMapNodeId,
          customWaveSequence, 
          currentCustomWaveIndex // 0-indexed for the wave TO START
      } = action.payload;

      let waveDefToUse: WaveDefinition | undefined;
      let actualBattleTitleWaveNumber = waveNumber; // This is the wave number for display purposes
      let actualCustomWaveSequenceForState: string[] | undefined = customWaveSequence;
      let actualCurrentCustomWaveIndexForState: number | undefined = currentCustomWaveIndex;

      if (sourceMapNodeId) {
        const mapNode = worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === sourceMapNodeId);
        if (customWaveSequence && currentCustomWaveIndex !== undefined) {
          // Continuing a custom sequence
          waveDefToUse = WAVE_DEFINITIONS.find(w => w.id === customWaveSequence[currentCustomWaveIndex]);
          actualBattleTitleWaveNumber = currentCustomWaveIndex + 1; // 1-indexed for display
        } else if (mapNode?.customWaveDefinitionIds && mapNode.customWaveDefinitionIds.length > 0) {
          // Starting a new custom sequence from map node
          actualCustomWaveSequenceForState = mapNode.customWaveDefinitionIds;
          actualCurrentCustomWaveIndexForState = 0;
          waveDefToUse = WAVE_DEFINITIONS.find(w => w.id === actualCustomWaveSequenceForState![0]);
          actualBattleTitleWaveNumber = 1; // First step in custom sequence
        } else if (mapNode?.battleWaveStart !== undefined) {
            // Fallback to old map battle system (single wave specified by battleWaveStart)
            waveDefToUse = WAVE_DEFINITIONS.find(w => w.waveNumber === mapNode.battleWaveStart);
            actualBattleTitleWaveNumber = mapNode.battleWaveStart;
            // Clear custom sequence flags as this is not a custom sequence
            actualCustomWaveSequenceForState = undefined;
            actualCurrentCustomWaveIndexForState = undefined;
        }
      } else { // Normal wave progression
        waveDefToUse = WAVE_DEFINITIONS.find(w => w.waveNumber === waveNumber);
        actualBattleTitleWaveNumber = waveNumber;
      }
      
      if (!waveDefToUse) {
        let errorMsg = `Wave definition not found for ${sourceMapNodeId ? `map node ${sourceMapNodeId}` : `wave ${waveNumber}`}.`;
        if(customWaveSequence && currentCustomWaveIndex !== undefined){
          errorMsg += ` Attempted custom wave ID: ${customWaveSequence[currentCustomWaveIndex]}.`;
        }
        console.error(errorMsg);
        const errorNotification: GameNotification = { id: Date.now().toString(), message: errorMsg, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
        return { updatedState: { ...state, notifications: [...state.notifications, errorNotification] }, deferredActions: [] };
      }
      if (state.heroes.length === 0) {
        const noHeroesNotification: GameNotification = { id: Date.now().toString(), message: "Cannot start battle: No heroes available.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
        return { updatedState: { ...state, notifications: [...state.notifications, noHeroesNotification] }, deferredActions: [] };
      }


      let tempNewResources = { ...state.resources };
      let tempUpdatedHeroes = state.heroes.map(h => ({...h}));
      let tempCurrentWaveProgress = state.currentWaveProgress;
      let tempNotifications = [...state.notifications];
      let sharedSkillPointsGainedFromWaveXP = 0;
      let newSessionTotalLoot: Cost[] = (isAutoProgression && state.battleState?.sessionTotalLoot) ? [...state.battleState.sessionTotalLoot] : [];
      let newSessionTotalExp: number = (isAutoProgression && state.battleState?.sessionTotalExp) ? state.battleState.sessionTotalExp : 0;
      let newSessionTotalBuildingLevelUps = (isAutoProgression && state.battleState?.sessionTotalBuildingLevelUps) ? [...state.battleState.sessionTotalBuildingLevelUps] : [];
      // Removed: let deferredAccountXpActions: GameAction[] = [];


      if (isAutoProgression && previousWaveNumberCleared !== undefined) {
          const effectivePrevWaveForProgress = actualCustomWaveSequenceForState ? (previousWaveNumberCleared +1) : previousWaveNumberCleared;
          
          if (!actualCustomWaveSequenceForState && previousWaveNumberCleared > state.currentWaveProgress) {
            const accountXpForWave = previousWaveNumberCleared * 10;
             deferredAccountXpActions.push({ type: 'GAIN_ACCOUNT_XP', payload: { amount: accountXpForWave, source: `Wave ${previousWaveNumberCleared} First Clear` } });
          }
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
         return { updatedState: { ...state, resources: tempNewResources, heroes: tempUpdatedHeroes, currentWaveProgress: tempCurrentWaveProgress, activeView: 'TOWN', battleState: null, notifications: tempNotifications, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedFromWaveXP }, deferredActions: deferredAccountXpActions };
      }
      const battleEnemies: BattleEnemy[] = [];
      waveDefToUse.enemies.forEach((ew, i_outer) => ENEMY_DEFINITIONS[ew.enemyId] && Array.from({length: ew.count}).forEach((_, i_inner) => {
        const enemyDef = ENEMY_DEFINITIONS[ew.enemyId];
        const finalStats = calculateWaveEnemyStats(enemyDef, actualBattleTitleWaveNumber);
        const battleEnemyInstance: BattleEnemy = {
            ...enemyDef, attackType: enemyDef.attackType || 'MELEE', rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
            calculatedStats: finalStats, uniqueBattleId: `${ew.enemyId}_${i_outer}_${i_inner}_enemy_wave${actualBattleTitleWaveNumber}`,
            currentHp: finalStats.maxHp, currentEnergyShield: finalStats.maxEnergyShield || 0, shieldRechargeDelayTicksRemaining: 0,
            attackCooldown: (1000 / finalStats.attackSpeed), attackCooldownRemainingTicks: 0,
            movementSpeed: 0, x: 0, y: 0, statusEffects: [], temporaryBuffs: [], isElite: ew.isElite || false, specialAttackCooldownsRemaining: {},
            summonStrengthModifier: enemyDef.summonAbility ? 1.0 : undefined,
            currentShieldHealCooldownMs: enemyDef.shieldHealAbility?.initialCooldownMs ?? enemyDef.shieldHealAbility?.cooldownMs,
        };
        battleEnemies.push(battleEnemyInstance);
      }));
      if (sharedSkillPointsGainedFromWaveXP > 0) tempNotifications.push({ id: Date.now().toString() + "-sspWave", message: `Gained ${sharedSkillPointsGainedFromWaveXP} Shared Skill Point(s) from wave XP!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
      
      const battleLogTitle = sourceMapNodeId && actualCustomWaveSequenceForState 
        ? `${worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === sourceMapNodeId)?.name || 'Map Battle'} - Wave ${actualBattleTitleWaveNumber}`
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
      
      return { updatedState: { ...state, resources: tempNewResources, heroes: tempUpdatedHeroes, currentWaveProgress: tempCurrentWaveProgress, activeView: 'BATTLEFIELD', battleState: newBattleState, notifications: tempNotifications, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedFromWaveXP }, deferredActions: deferredAccountXpActions };
    }
    case 'END_WAVE_BATTLE_RESULT': {
      const { outcome, battleStateFromEnd } = action.payload;
      let finalResources = { ...state.resources };
      let finalUpdatedHeroes = [...state.heroes];
      let finalCurrentWaveProgress = state.currentWaveProgress;
      let finalNotificationsArr = [...state.notifications];
      let sharedSkillPointsGainedThisBattleEnd = 0;
      // Removed: let deferredAccountXpActions: GameAction[] = [];

      if (outcome === 'VICTORY') {
        const currentWaveBattleNum = battleStateFromEnd.waveNumber || 0;
        
        if (!battleStateFromEnd.customWaveSequence) { // Normal Wave
            if (currentWaveBattleNum > state.currentWaveProgress) { // First time clear
                const accountXpForWave = currentWaveBattleNum * 10;
                deferredAccountXpActions.push({ type: 'GAIN_ACCOUNT_XP', payload: { amount: accountXpForWave, source: `Wave ${currentWaveBattleNum} First Clear` } });
            }
            finalCurrentWaveProgress = Math.max(state.currentWaveProgress, currentWaveBattleNum);
        } else if (battleStateFromEnd.customWaveSequence && battleStateFromEnd.currentCustomWaveIndex !== undefined && battleStateFromEnd.sourceMapNodeId) { // Custom Map Sequence Wave
            const mapNodeKey = `${battleStateFromEnd.sourceMapNodeId}_battle_won`;
            if (battleStateFromEnd.currentCustomWaveIndex === battleStateFromEnd.customWaveSequence.length - 1 && !state.mapPoiCompletionStatus[mapNodeKey]) {
                // This is the *final* wave of the custom sequence, and it's a first-time clear for the POI
                const waveDef = WAVE_DEFINITIONS.find(w => w.id === battleStateFromEnd.customWaveSequence![battleStateFromEnd.currentCustomWaveIndex!]);
                let totalBaseExpForWave = 0;
                waveDef?.enemies.forEach(ew => {
                    const enemyDef = ENEMY_DEFINITIONS[ew.enemyId];
                    if(enemyDef) totalBaseExpForWave += (enemyDef.expReward * ew.count);
                });
                const accountXpForMapNode = Math.floor(totalBaseExpForWave * 0.5); 
                if (accountXpForMapNode > 0) {
                    const mapNodeName = worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === battleStateFromEnd.sourceMapNodeId)?.name || battleStateFromEnd.sourceMapNodeId;
                    deferredAccountXpActions.push({ type: 'GAIN_ACCOUNT_XP', payload: { amount: accountXpForMapNode, source: `${mapNodeName} First Clear` } });
                }
            }
        }
        
        (battleStateFromEnd.sessionTotalLoot || []).forEach(r => finalResources[r.resource] = (finalResources[r.resource] || 0) + Math.floor(r.amount));
        const survivingBattleHeroes = battleStateFromEnd.heroes.filter(bh => bh.currentHp > 0);
        if ((battleStateFromEnd.sessionTotalExp || 0) > 0 && survivingBattleHeroes.length > 0) {
            let modifiedExpReward = (battleStateFromEnd.sessionTotalExp || 0) * (1 + globalBonuses.waveXpRewardBonus) * (1 + globalBonuses.heroXpGainBonus);
            const expPerSurvivor = Math.floor(modifiedExpReward / survivingBattleHeroes.length);
            finalUpdatedHeroes = finalUpdatedHeroes.map(hero => {
                if (survivingBattleHeroes.some(bh => bh.definitionId === hero.definitionId)) {
                    let currentExp = hero.currentExp + expPerSurvivor; let level = hero.level; let skillPoints = hero.skillPoints; let expToNextLevel = hero.expToNextLevel; let levelsGained = 0;
                    while (currentExp >= expToNextLevel && level < 100) { currentExp -= expToNextLevel; level++; skillPoints++; levelsGained++; expToNextLevel = getExpToNextHeroLevel(level); finalNotificationsArr.push({id: `${Date.now()}-levelup-${hero.definitionId}-${level}`, message: `${HERO_DEFINITIONS[hero.definitionId]?.name} reached Level ${level}!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()}); }
                    if (levelsGained > 0) sharedSkillPointsGainedThisBattleEnd += levelsGained;
                    return { ...hero, currentExp, level, skillPoints, expToNextLevel };
                } return hero;
            });
        }
        const battleDisplayName = battleStateFromEnd.sourceMapNodeId && battleStateFromEnd.customWaveSequence
            ? `${worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === battleStateFromEnd.sourceMapNodeId)?.name || 'Map Battle'} - Wave ${battleStateFromEnd.waveNumber} of ${battleStateFromEnd.customWaveSequence.length}`
            : battleStateFromEnd.sourceMapNodeId
            ? `${worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === battleStateFromEnd.sourceMapNodeId)?.name || 'Map Battle'} - Wave ${battleStateFromEnd.waveNumber}`
            : `Wave ${battleStateFromEnd.waveNumber}`;
        
        if (!battleStateFromEnd.customWaveSequence && (battleStateFromEnd.waveNumber || 0) >= MAX_WAVE_NUMBER) {
            finalNotificationsArr.push({id: `${Date.now()}-maxwave-end`, message: `Congratulations! You've cleared the final wave!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()});
        }
      } else { // DEFEAT
        (battleStateFromEnd.battleLootCollected || []).forEach(r => finalResources[r.resource] = (finalResources[r.resource] || 0) + Math.floor(r.amount));
        if (battleStateFromEnd.battleExpCollected && battleStateFromEnd.battleExpCollected > 0 && battleStateFromEnd.heroes.length > 0) {
            let modifiedExpReward = battleStateFromEnd.battleExpCollected * (1 + globalBonuses.heroXpGainBonus);
            finalResources[ResourceType.HEROIC_POINTS] = (finalResources[ResourceType.HEROIC_POINTS] || 0) + Math.floor(modifiedExpReward);
        }
        const battleDisplayName = battleStateFromEnd.sourceMapNodeId && battleStateFromEnd.customWaveSequence
            ? `${worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === battleStateFromEnd.sourceMapNodeId)?.name || 'Map Battle'} - Wave ${battleStateFromEnd.waveNumber} of ${battleStateFromEnd.customWaveSequence.length}`
            : battleStateFromEnd.sourceMapNodeId
            ? `${worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === battleStateFromEnd.sourceMapNodeId)?.name || 'Map Battle'} - Wave ${battleStateFromEnd.waveNumber}`
            : `Wave ${battleStateFromEnd.waveNumber}`;
        finalNotificationsArr.push({ id: Date.now().toString(), message: `${battleDisplayName} lost. Loot from this wave collected. Returning to Town.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() });
      }
      if (sharedSkillPointsGainedThisBattleEnd > 0) {
        finalNotificationsArr.push({ id: Date.now().toString() + "-sspBattleEndFlow", message: `Gained ${sharedSkillPointsGainedThisBattleEnd} Shared Skill Point(s)!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
      }
      
      return { 
        updatedState: { 
            ...state, 
            resources: finalResources, 
            heroes: finalUpdatedHeroes, 
            currentWaveProgress: finalCurrentWaveProgress, 
            notifications: finalNotificationsArr, 
            playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedThisBattleEnd,
        },
        deferredActions: deferredAccountXpActions
      };
    }
    default:
      return { updatedState: state, deferredActions: [] };
  }
};