
import { GameState, GameAction, GlobalBonuses, BattleHero, BattleEnemy, Cost, ResourceType, GameNotification, BattleState, BuildingLevelUpEventInBattle } from '../../types';
import { HERO_DEFINITIONS, SKILL_TREES, WAVE_DEFINITIONS, ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../../gameData/index';
import { calculateHeroStats, calculateWaveEnemyStats, getExpToNextHeroLevel, formatNumber } from '../../utils';
import { MAX_WAVE_NUMBER, NOTIFICATION_ICONS } from '../../constants';
import { ICONS } from '../../components/Icons';

export const waveBattleFlowReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' | 'END_WAVE_BATTLE_RESULT' }>,
  globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'START_WAVE_BATTLE_PREPARATION': {
      const {
          waveNumber,
          isAutoProgression,
          persistedHeroHp,
          persistedHeroMana,
          persistedHeroSpecialCooldowns,
          rewardsForPreviousWave,
          expFromPreviousWave,
          previousWaveNumberCleared,
          buildingLevelUpEventsFromPreviousWave, // Corrected property name here
          previousBattleOutcomeForQuestProcessing
      } = action.payload;
      const waveDef = WAVE_DEFINITIONS.find(w => w.waveNumber === waveNumber);
      if (!waveDef) return state;
      if (isAutoProgression && (!state.heroes || state.heroes.length === 0 || !persistedHeroHp)) return state;

      let tempNewResources = { ...state.resources };
      let tempUpdatedHeroes = state.heroes.map(h => ({...h}));
      let tempCurrentWaveProgress = state.currentWaveProgress;
      let tempNotifications = [...state.notifications];
      let sharedSkillPointsGainedFromWaveXP = 0;
      let newSessionTotalLoot: Cost[] = state.battleState?.sessionTotalLoot || [];
      let newSessionTotalExp: number = state.battleState?.sessionTotalExp || 0;
      let newSessionTotalBuildingLevelUps = state.battleState?.sessionTotalBuildingLevelUps || [];

      if (isAutoProgression && previousWaveNumberCleared !== undefined) {
          tempCurrentWaveProgress = Math.max(state.currentWaveProgress, previousWaveNumberCleared);
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
          if (buildingLevelUpEventsFromPreviousWave) { // Use corrected name here
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
                      if (heroCopy.level - levelBeforeXP > 0) sharedSkillPointsGainedFromWaveXP += (heroCopy.level - levelBeforeXP);
                      return heroCopy;
                  }
                  return hero;
              });
          }
           if (previousWaveNumberCleared >= MAX_WAVE_NUMBER) {
               tempNotifications.push({id: `${Date.now()}-maxwave-auto`, message: `Congratulations! You've cleared the final wave (auto-progress)!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()});
          }
      } else { 
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
                uniqueBattleId: `${h.definitionId}_${idx}_hero_wave${waveNumber}`,
                currentHp: Math.max(0, currentHp), currentMana: Math.max(0, currentMana), calculatedStats,
                attackCooldown: (1000 / calculatedStats.attackSpeed), attackCooldownRemainingTicks: 0,
                movementSpeed: 0, x: 0, y: 0, specialAttackCooldownsRemaining, statusEffects: [], temporaryBuffs: [],
                currentEnergyShield: calculatedStats.maxEnergyShield || 0, shieldRechargeDelayTicksRemaining: 0,
                isTaunting: heroDef.id === 'PALADIN' && h.skillLevels['PSK001'] > 0,
            };
      });
      if (battleHeroes.length === 0 && isAutoProgression) {
         tempNotifications.push({id: Date.now().toString(), message: 'Auto-progression failed: No heroes for next wave. Returning to Town.', type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
         return { ...state, resources: tempNewResources, heroes: tempUpdatedHeroes, currentWaveProgress: tempCurrentWaveProgress, activeView: 'TOWN', battleState: null, notifications: tempNotifications, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedFromWaveXP };
      }
      const battleEnemies: BattleEnemy[] = [];
      waveDef.enemies.forEach((ew, i_outer) => ENEMY_DEFINITIONS[ew.enemyId] && Array.from({length: ew.count}).forEach((_, i_inner) => {
        const enemyDef = ENEMY_DEFINITIONS[ew.enemyId];
        const finalStats = calculateWaveEnemyStats(enemyDef, waveNumber);
        battleEnemies.push({
            ...enemyDef, attackType: enemyDef.attackType || 'MELEE', rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
            calculatedStats: finalStats, uniqueBattleId: `${ew.enemyId}_${i_outer}_${i_inner}_enemy_wave${waveNumber}`,
            currentHp: finalStats.maxHp, currentEnergyShield: finalStats.maxEnergyShield || 0, shieldRechargeDelayTicksRemaining: 0,
            attackCooldown: (1000 / finalStats.attackSpeed), attackCooldownRemainingTicks: 0,
            movementSpeed: 0, x: 0, y: 0, statusEffects: [], isElite: false, specialAttackCooldownsRemaining: {}
        });
      }));
      if (sharedSkillPointsGainedFromWaveXP > 0) tempNotifications.push({ id: Date.now().toString() + "-sspWave", message: `Gained ${sharedSkillPointsGainedFromWaveXP} Shared Skill Point(s) from wave XP!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
      const newBattleState: BattleState = {
        waveNumber: waveNumber, heroes: battleHeroes, enemies: battleEnemies,
        battleLog: [`Wave ${waveNumber} starting!`], status: 'FIGHTING', ticksElapsed: 0, lastAttackEvents: [],
        battleLootCollected: [], defeatedEnemiesWithLoot: {}, battleExpCollected: 0, buildingLevelUpEventsInBattle: [], activePotionIdForUsage: null,
        sessionTotalLoot: newSessionTotalLoot, sessionTotalExp: newSessionTotalExp, sessionTotalBuildingLevelUps: newSessionTotalBuildingLevelUps,
      };
      return { ...state, resources: tempNewResources, heroes: tempUpdatedHeroes, currentWaveProgress: tempCurrentWaveProgress, activeView: 'BATTLEFIELD', battleState: newBattleState, notifications: tempNotifications, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedFromWaveXP };
    }
    case 'END_WAVE_BATTLE_RESULT': {
      const { outcome, battleStateFromEnd } = action.payload;
      let finalResources = { ...state.resources };
      let finalUpdatedHeroes = [...state.heroes];
      let finalCurrentWaveProgress = state.currentWaveProgress;
      let finalNotificationsArr = [...state.notifications];
      let sharedSkillPointsGainedThisBattleEnd = 0;

      if (outcome === 'VICTORY') {
        finalCurrentWaveProgress = Math.max(state.currentWaveProgress, battleStateFromEnd.waveNumber || 0);
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
        finalNotificationsArr.push({ id: Date.now().toString(), message: `Wave ${battleStateFromEnd.waveNumber} cleared! Rewards gained. Returning to Town.`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now() });
        if ((battleStateFromEnd.waveNumber || 0) >= MAX_WAVE_NUMBER) finalNotificationsArr.push({id: `${Date.now()}-maxwave-end`, message: `Congratulations! You've cleared the final wave!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()});
      } else { // DEFEAT
        (action.payload.battleStateFromEnd.battleLootCollected || []).forEach(r => finalResources[r.resource] = (finalResources[r.resource] || 0) + Math.floor(r.amount));
        if (action.payload.battleStateFromEnd.battleExpCollected && action.payload.battleStateFromEnd.battleExpCollected > 0 && battleStateFromEnd.heroes.length > 0) {
            let modifiedExpReward = action.payload.battleStateFromEnd.battleExpCollected * (1 + globalBonuses.heroXpGainBonus);
            finalResources[ResourceType.HEROIC_POINTS] = (finalResources[ResourceType.HEROIC_POINTS] || 0) + Math.floor(modifiedExpReward);
        }
        finalNotificationsArr.push({ id: Date.now().toString(), message: `Wave ${battleStateFromEnd.waveNumber} lost. Loot from this wave collected. Returning to Town.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() });
      }
      if (sharedSkillPointsGainedThisBattleEnd > 0) {
        finalNotificationsArr.push({ id: Date.now().toString() + "-sspBattleEndFlow", message: `Gained ${sharedSkillPointsGainedThisBattleEnd} Shared Skill Point(s)!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
      }
      return { ...state, resources: finalResources, heroes: finalUpdatedHeroes, currentWaveProgress: finalCurrentWaveProgress, activeView: 'TOWN', battleState: null, notifications: finalNotificationsArr, playerSharedSkillPoints: state.playerSharedSkillPoints + sharedSkillPointsGainedThisBattleEnd };
    }
    default:
      return state;
  }
};
