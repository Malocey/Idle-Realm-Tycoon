
import { GameState, GameAction, GlobalBonuses, BattleHero, ActiveDemoniconChallenge, ResourceType, GameNotification, GameContextType, BattleState, Cost, PlayerHeroState, ActiveView } from '../types';
import { HERO_DEFINITIONS, SKILL_TREES, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../gameData/index';
import { calculateHeroStats as calculateHeroStatsUtil, calculateDemoniconEnemyStats as calculateDemoniconEnemyStatsUtil, formatNumber, mergeCosts, getExpToNextHeroLevel } from '../utils';
import { NOTIFICATION_ICONS } from '../constants';
import { ICONS } from '../components/Icons';

export const demoniconReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'START_DEMONICON_CHALLENGE' | 'END_BATTLE' | 'PROCESS_DEMONICON_VICTORY_REWARDS' | 'CONTINUE_DEMONICON_CHALLENGE' | 'CLEANUP_DEMONICON_STATE' }>,
  globalBonuses: GlobalBonuses,
  staticData: GameContextType['staticData']
): GameState => {
  switch (action.type) {
    case 'START_DEMONICON_CHALLENGE': {
      const { enemyId, rank } = action.payload; // Use rank from payload
      const enemyDef = staticData.enemyDefinitions[enemyId];
      if (!enemyDef) {
        return { ...state, notifications: [...state.notifications, {id: Date.now().toString(), message: `Error: Enemy data for ${enemyId} not found.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()}] };
      }

      const initialPersistedHeroStates: ActiveDemoniconChallenge['persistedHeroStatesInRun'] = {};
      state.heroes
        .filter(h => h.level > 0)
        .forEach(h => {
          const heroBattleDef = staticData.heroDefinitions[h.definitionId];
          const skillTree = staticData.skillTrees[heroBattleDef.skillTreeId];
          const calculatedStats = calculateHeroStatsUtil(h, heroBattleDef, skillTree, state, staticData.townHallUpgradeDefinitions, staticData.guildHallUpgradeDefinitions, staticData.equipmentDefinitions, globalBonuses, staticData.shardDefinitions, staticData.runBuffDefinitions, staticData.statusEffectDefinitions, true, state.achievedDemoniconMilestoneRewards);
          const initialCooldowns: Record<string, number> = {};
          Object.keys(h.specialAttackLevels).forEach(saId => {
            if (h.specialAttackLevels[saId] > 0) initialCooldowns[saId] = 0;
          });
          initialPersistedHeroStates[h.definitionId] = {
            level: h.level,
            currentExp: h.currentExp,
            expToNextLevel: h.expToNextLevel,
            skillPoints: h.skillPoints,
            currentHpForNextRank: calculatedStats.maxHp,
            currentManaForNextRank: calculatedStats.maxMana || 0,
            cooldownsForNextRank: initialCooldowns,
          };
        });

      if (Object.keys(initialPersistedHeroStates).length === 0) {
        return { ...state, notifications: [...state.notifications, {id: Date.now().toString(), message: "No heroes available for Demonicon challenge.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()}] };
      }

      const initialRank = rank; // Use rank from payload
      const initialEnemies = calculateDemoniconEnemyStatsUtil(enemyDef, initialRank, staticData, globalBonuses);

      const heroesForBattle: BattleHero[] = Object.entries(initialPersistedHeroStates).map(([heroDefId, phs]) => {
        const playerHeroState = state.heroes.find(ph => ph.definitionId === heroDefId)!;
        const heroDefForBattle = staticData.heroDefinitions[heroDefId];
        const skillTree = staticData.skillTrees[heroDefForBattle.skillTreeId];
        const calculatedStats = calculateHeroStatsUtil(playerHeroState, heroDefForBattle, skillTree, state, staticData.townHallUpgradeDefinitions, staticData.guildHallUpgradeDefinitions, staticData.equipmentDefinitions, globalBonuses, staticData.shardDefinitions, staticData.runBuffDefinitions, staticData.statusEffectDefinitions, true, state.achievedDemoniconMilestoneRewards);
        return {
          ...heroDefForBattle, ...playerHeroState,
          attackType: heroDefForBattle.attackType || 'MELEE',
          rangedAttackRangeUnits: heroDefForBattle.rangedAttackRangeUnits,
          uniqueBattleId: `${heroDefId}_demonicon_${initialRank}_${Date.now()}`,
          level: phs.level,
          currentExp: phs.currentExp,
          expToNextLevel: phs.expToNextLevel,
          skillPoints: phs.skillPoints,
          currentHp: phs.currentHpForNextRank,
          currentMana: phs.currentManaForNextRank,
          calculatedStats,
          attackCooldown: (1000 / calculatedStats.attackSpeed), attackCooldownRemainingTicks: 0,
          movementSpeed: 0, x: 0, y: 0,
          specialAttackCooldownsRemaining: { ...phs.cooldownsForNextRank },
          statusEffects: [], temporaryBuffs: [],
          currentEnergyShield: calculatedStats.maxEnergyShield || 0,
          shieldRechargeDelayTicksRemaining: 0,
          initialLevelForSummary: playerHeroState.level, 
          initialExpForSummary: playerHeroState.currentExp, 
        };
      });

      return {
        ...state,
        activeDemoniconChallenge: {
          enemyId,
          currentRank: initialRank,
          persistedHeroStatesInRun: initialPersistedHeroStates,
          lootThisRun: [],
          xpThisRun: 0,
        },
        battleState: {
          isDemoniconBattle: true,
          demoniconEnemyId: enemyId,
          demoniconRank: initialRank,
          heroes: heroesForBattle,
          enemies: initialEnemies,
          battleLog: [`Demonicon Challenge: ${enemyDef.name} - Rank ${initialRank + 1} starting!`],
          status: 'FIGHTING',
          ticksElapsed: 0,
          lastAttackEvents: [],
          damagePopups: [],
          fusionAnchors: [],
          feederParticles: [], 
          battleLootCollected: [],
          defeatedEnemiesWithLoot: {},
          battleExpCollected: 0,
          buildingLevelUpEventsInBattle: [],
          activePotionIdForUsage: null,
          sessionTotalLoot: [],
          sessionTotalExp: 0,
          sessionTotalBuildingLevelUps: [],
          stats: {}, 
        },
        activeView: ActiveView.BATTLEFIELD,
      };
    }
    case 'END_BATTLE': {
      if (!state.activeDemoniconChallenge || !state.battleState || !state.battleState.isDemoniconBattle) return state;
      const { outcome } = action.payload;
      const { enemyId, currentRank } = state.activeDemoniconChallenge;
      const battleStateFromEnd = state.battleState;

      // Prepare payload for PROCESS_DEMONICON_VICTORY_REWARDS which expects hero states
      const survivingHeroesWithFullState = battleStateFromEnd.heroes
        .filter(h => h.currentHp > 0)
        .map(bh => ({ // Map to the more detailed structure if PROCESS_DEMONICON_VICTORY_REWARDS expects it
            uniqueBattleId: bh.uniqueBattleId,
            definitionId: bh.definitionId,
            level: bh.level,
            currentExp: bh.currentExp,
            expToNextLevel: bh.expToNextLevel,
            skillPoints: bh.skillPoints,
            currentHp: bh.currentHp,
            currentMana: bh.currentMana,
            specialAttackCooldownsRemaining: { ...bh.specialAttackCooldownsRemaining }
        }));

      const processRewardsAction: GameAction = {
        type: 'PROCESS_DEMONICON_VICTORY_REWARDS',
        payload: {
          enemyId,
          clearedRank: currentRank,
          survivingHeroesWithState: survivingHeroesWithFullState,
          rankLootCollected: battleStateFromEnd.battleLootCollected,
          rankExpCollected: battleStateFromEnd.battleExpCollected,
        }
      };

      if (outcome === 'VICTORY') {
        return demoniconReducer(state, processRewardsAction, globalBonuses, staticData);
      } else {
        return demoniconReducer(state, { type: 'CLEANUP_DEMONICON_STATE' }, globalBonuses, staticData);
      }
    }

    case 'PROCESS_DEMONICON_VICTORY_REWARDS': {
      const { enemyId, clearedRank, survivingHeroesWithState, rankLootCollected, rankExpCollected } = action.payload;
      const currentChallenge = state.activeDemoniconChallenge;

      if (!currentChallenge || currentChallenge.enemyId !== enemyId || currentChallenge.currentRank !== clearedRank) {
        return state;
      }

      let newState = { ...state };
      let newResources = { ...state.resources };
      let newDemoniconHighestRank = { ...state.demoniconHighestRankCompleted };
      let newGlobalXP = state.globalDemoniconXP;
      let newGlobalLevel = state.globalDemoniconLevel;
      let newExpToNextGlobalLevel = state.expToNextGlobalDemoniconLevel;
      let newAchievedMilestoneRewards = [...state.achievedDemoniconMilestoneRewards];
      let notifications: GameNotification[] = [];
      const enemyDef = staticData.enemyDefinitions[enemyId];

      const updatedPersistedHeroStates: ActiveDemoniconChallenge['persistedHeroStatesInRun'] = { ...currentChallenge.persistedHeroStatesInRun };
      survivingHeroesWithState.forEach(shs => {
          updatedPersistedHeroStates[shs.definitionId] = {
              level: shs.level,
              currentExp: shs.currentExp,
              expToNextLevel: shs.expToNextLevel,
              skillPoints: shs.skillPoints,
              currentHpForNextRank: shs.currentHp,
              currentManaForNextRank: shs.currentMana,
              cooldownsForNextRank: { ...shs.specialAttackCooldownsRemaining }
          };
      });

      const updatedLootThisRun = mergeCosts(currentChallenge.lootThisRun, rankLootCollected || []);
      const updatedXpThisRun = (currentChallenge.xpThisRun || 0) + (rankExpCollected || 0); // Accumulate HERO EXP

      const prevHighestRank = state.demoniconHighestRankCompleted[enemyId] ?? -1;
      if (clearedRank > prevHighestRank) {
        const demonicCoinsEarned = 5 + Math.floor(clearedRank / 5);
        newResources.DEMONIC_COIN = (newResources.DEMONIC_COIN || 0) + demonicCoinsEarned;
        newDemoniconHighestRank[enemyId] = clearedRank;
        notifications.push({
          id: Date.now().toString(),
          message: `New Demonicon Record for ${enemyDef.name}! Rank ${clearedRank + 1} cleared. +${demonicCoinsEarned} Demonic Coins!`,
          type: 'success', iconName: ICONS.DEMONIC_COIN ? 'DEMONIC_COIN' : undefined, timestamp: Date.now()
        });

        const globalXPEarned = (clearedRank + 1) * 2;
        newGlobalXP += globalXPEarned;
        notifications.push({
          id: Date.now().toString() + "-demoniconGlobalXP",
          message: `Gained ${globalXPEarned} Global Demonicon XP from Rank ${clearedRank + 1} ${enemyDef.name}.`,
          type: 'info', iconName: ICONS.XP_ICON ? 'XP_ICON' : undefined, timestamp: Date.now()
        });

        while (newGlobalXP >= newExpToNextGlobalLevel) {
          newGlobalXP -= newExpToNextGlobalLevel;
          newGlobalLevel++;
          newExpToNextGlobalLevel = 20 + (newGlobalLevel - 1) * 30;
          notifications.push({
            id: Date.now().toString() + "-globalDemoniconLvlUp",
            message: `Global Demonicon Level Up! Level ${newGlobalLevel} reached! Bonuses increased.`,
            type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now()
          });
        }
        const enemyMilestones = staticData.demoniconMilestoneRewards[enemyId] || [];
        enemyMilestones.forEach(milestone => {
          if (clearedRank === milestone.rankToAchieve && !newAchievedMilestoneRewards.includes(milestone.id)) {
            newAchievedMilestoneRewards.push(milestone.id);
            milestone.rewards.forEach(reward => notifications.push({id: `${Date.now()}-milestone-${milestone.id}-${reward.stat}`, message: `Demonicon Milestone for ${enemyDef.name} Rank ${clearedRank + 1}: ${reward.description}`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now()}));
          }
        });
      }

      newState = {
        ...state,
        resources: newResources,
        demoniconHighestRankCompleted: newDemoniconHighestRank,
        globalDemoniconXP: newGlobalXP,
        globalDemoniconLevel: newGlobalLevel,
        expToNextGlobalDemoniconLevel: newExpToNextGlobalLevel,
        achievedDemoniconMilestoneRewards: newAchievedMilestoneRewards,
        activeDemoniconChallenge: {
          ...currentChallenge,
          persistedHeroStatesInRun: updatedPersistedHeroStates,
          lootThisRun: updatedLootThisRun,
          xpThisRun: updatedXpThisRun,
        },
        notifications: [...state.notifications, ...notifications],
      };

      if (survivingHeroesWithState.length > 0) {
        const nextRank = clearedRank + 1;
        const heroesForNextRank: BattleHero[] = Object.entries(updatedPersistedHeroStates)
            .filter(([heroDefId, phs]) => phs.currentHpForNextRank > 0) // Only include heroes that can continue
            .map(([heroDefId, phs]) => {
                const playerHeroState = newState.heroes.find(ph => ph.definitionId === heroDefId)!;
                const heroDefForBattle = staticData.heroDefinitions[heroDefId];
                const skillTree = staticData.skillTrees[heroDefForBattle.skillTreeId];
                const heroStateForCalc: PlayerHeroState = {
                    ...playerHeroState,
                    level: phs.level,
                    currentExp: phs.currentExp,
                    expToNextLevel: phs.expToNextLevel,
                    skillPoints: phs.skillPoints,
                };
                const calculatedStats = calculateHeroStatsUtil(heroStateForCalc, heroDefForBattle, skillTree, newState, staticData.townHallUpgradeDefinitions, staticData.guildHallUpgradeDefinitions, staticData.equipmentDefinitions, globalBonuses, staticData.shardDefinitions, staticData.runBuffDefinitions, staticData.statusEffectDefinitions, true, newState.achievedDemoniconMilestoneRewards);
                return {
                    ...heroDefForBattle, ...playerHeroState,
                    attackType: heroDefForBattle.attackType || 'MELEE',
                    rangedAttackRangeUnits: heroDefForBattle.rangedAttackRangeUnits,
                    uniqueBattleId: `${heroDefId}_demonicon_${nextRank}_${Date.now()}`,
                    level: phs.level, currentExp: phs.currentExp, expToNextLevel: phs.expToNextLevel, skillPoints: phs.skillPoints,
                    currentHp: phs.currentHpForNextRank, currentMana: phs.currentManaForNextRank,
                    calculatedStats,
                    attackCooldown: (1000 / calculatedStats.attackSpeed), attackCooldownRemainingTicks: 0,
                    movementSpeed: 0, x: 0, y: 0,
                    specialAttackCooldownsRemaining: { ...phs.cooldownsForNextRank },
                    statusEffects: [], temporaryBuffs: [],
                    currentEnergyShield: calculatedStats.maxEnergyShield || 0,
                    shieldRechargeDelayTicksRemaining: 0,
                    initialLevelForSummary: phs.level, 
                    initialExpForSummary: phs.currentExp, 
                };
        });

        if (heroesForNextRank.length === 0) { // All heroes died even if rank was won (e.g. DOTs)
            return demoniconReducer(newState, { type: 'CLEANUP_DEMONICON_STATE' }, globalBonuses, staticData);
        }

        const newBattleState: BattleState = {
          isDemoniconBattle: true, demoniconEnemyId: enemyId, demoniconRank: nextRank,
          heroes: heroesForNextRank, enemies: calculateDemoniconEnemyStatsUtil(enemyDef, nextRank, staticData, globalBonuses),
          battleLog: [`Demonicon Challenge: ${enemyDef.name} - Rank ${nextRank + 1} starting!`],
          status: 'FIGHTING', ticksElapsed: 0, lastAttackEvents: [],
          damagePopups: [],
          fusionAnchors: [],
          feederParticles: [], 
          battleLootCollected: [], defeatedEnemiesWithLoot: {}, battleExpCollected: 0,
          buildingLevelUpEventsInBattle: [], activePotionIdForUsage: null,
          sessionTotalLoot: [...updatedLootThisRun],
          sessionTotalExp: updatedXpThisRun,
          sessionTotalBuildingLevelUps: [],
          stats: {}, 
        };

        return {
          ...newState,
          activeDemoniconChallenge: { ...newState.activeDemoniconChallenge!, currentRank: nextRank },
          battleState: newBattleState,
          activeView: ActiveView.BATTLEFIELD,
        };
      } else {
        return demoniconReducer(newState, { type: 'CLEANUP_DEMONICON_STATE' }, globalBonuses, staticData);
      }
    }

    case 'CONTINUE_DEMONICON_CHALLENGE': {
      if (!state.activeDemoniconChallenge || Object.keys(state.activeDemoniconChallenge.persistedHeroStatesInRun).length === 0) {
        return demoniconReducer(state, { type: 'CLEANUP_DEMONICON_STATE' }, globalBonuses, staticData);
      }
      const { enemyId, currentRank, persistedHeroStatesInRun, lootThisRun, xpThisRun } = state.activeDemoniconChallenge;
      const enemyDef = staticData.enemyDefinitions[enemyId];
      if (!enemyDef) return demoniconReducer(state, { type: 'CLEANUP_DEMONICON_STATE' }, globalBonuses, staticData);

      const heroesForNextRank: BattleHero[] = Object.entries(persistedHeroStatesInRun)
        .filter(([heroDefId, phs]) => phs.currentHpForNextRank > 0)
        .map(([heroDefId, phs]) => {
            const playerHeroState = state.heroes.find(ph => ph.definitionId === heroDefId)!;
            const heroDefForBattle = staticData.heroDefinitions[heroDefId];
            const skillTree = staticData.skillTrees[heroDefForBattle.skillTreeId];
            const heroStateForCalc: PlayerHeroState = {
                ...playerHeroState, level: phs.level, currentExp: phs.currentExp, expToNextLevel: phs.expToNextLevel, skillPoints: phs.skillPoints,
            };
            const calculatedStats = calculateHeroStatsUtil(heroStateForCalc, heroDefForBattle, skillTree, state, staticData.townHallUpgradeDefinitions, staticData.guildHallUpgradeDefinitions, staticData.equipmentDefinitions, globalBonuses, staticData.shardDefinitions, staticData.runBuffDefinitions, staticData.statusEffectDefinitions, true, state.achievedDemoniconMilestoneRewards);
            return {
              ...heroDefForBattle, ...playerHeroState,
              attackType: heroDefForBattle.attackType || 'MELEE',
              rangedAttackRangeUnits: heroDefForBattle.rangedAttackRangeUnits,
              uniqueBattleId: `${heroDefId}_demonicon_${currentRank}_${Date.now()}`,
              level: phs.level, currentExp: phs.currentExp, expToNextLevel: phs.expToNextLevel, skillPoints: phs.skillPoints,
              currentHp: phs.currentHpForNextRank, currentMana: phs.currentManaForNextRank,
              calculatedStats,
              attackCooldown: (1000 / calculatedStats.attackSpeed), attackCooldownRemainingTicks: 0,
              movementSpeed: 0, x: 0, y: 0,
              specialAttackCooldownsRemaining: { ...phs.cooldownsForNextRank },
              statusEffects: [], temporaryBuffs: [],
              currentEnergyShield: calculatedStats.maxEnergyShield || 0,
              shieldRechargeDelayTicksRemaining: 0,
              initialLevelForSummary: phs.level, 
              initialExpForSummary: phs.currentExp, 
            };
      });

      if (heroesForNextRank.length === 0) { // Should not happen if logic in PROCESS_DEMONICON_VICTORY_REWARDS is correct
        return demoniconReducer(state, { type: 'CLEANUP_DEMONICON_STATE' }, globalBonuses, staticData);
      }

      return {
        ...state,
        battleState: {
          isDemoniconBattle: true, demoniconEnemyId: enemyId, demoniconRank: currentRank,
          heroes: heroesForNextRank, enemies: calculateDemoniconEnemyStatsUtil(enemyDef, currentRank, staticData, globalBonuses),
          battleLog: [`Demonicon Challenge: ${enemyDef.name} - Rank ${currentRank + 1} starting!`],
          status: 'FIGHTING', ticksElapsed: 0, lastAttackEvents: [],
          damagePopups: [],
          fusionAnchors: [],
          feederParticles: [], 
          battleLootCollected: [], defeatedEnemiesWithLoot: {}, battleExpCollected: 0,
          buildingLevelUpEventsInBattle: [], activePotionIdForUsage: null,
          sessionTotalLoot: [...lootThisRun],
          sessionTotalExp: xpThisRun,
          sessionTotalBuildingLevelUps: [],
          stats: {}, 
        },
        activeView: ActiveView.BATTLEFIELD,
      };
    }

    case 'CLEANUP_DEMONICON_STATE': {
      let newNotifications = [...state.notifications];
      let newResources = { ...state.resources };
      let finalHeroesState = [...state.heroes];

      if (state.activeDemoniconChallenge) {
        const { persistedHeroStatesInRun, lootThisRun, xpThisRun, enemyId, currentRank } = state.activeDemoniconChallenge;
        const enemyName = staticData.enemyDefinitions[enemyId]?.name || enemyId;

        finalHeroesState = state.heroes.map(hero => {
          const persistedData = persistedHeroStatesInRun[hero.definitionId];
          if (persistedData) {
            return {
              ...hero,
              level: persistedData.level,
              currentExp: persistedData.currentExp,
              expToNextLevel: persistedData.expToNextLevel,
              skillPoints: persistedData.skillPoints,
            };
          }
          return hero;
        });

        lootThisRun.forEach(lootItem => {
            newResources[lootItem.resource] = (newResources[lootItem.resource] || 0) + lootItem.amount;
        });

        const lootSummary = lootThisRun.map(l => `${formatNumber(l.amount)} ${l.resource.replace(/_/g, ' ')}`).join(', ');
        const xpSummary = xpThisRun > 0 ? `${formatNumber(xpThisRun)} total Hero EXP gained by heroes this run` : "";

        let summaryMessage = `Demonicon run vs ${enemyName} (ended at Rank ${currentRank + 1}) concluded.`;
        if (lootSummary) summaryMessage += ` Rewards: ${lootSummary}.`;
        if (xpSummary) summaryMessage += ` ${xpSummary}.`;
        if (!lootSummary && !xpSummary && currentRank >= 0) summaryMessage += " No additional rewards gained this run.";
        else if (!lootSummary && !xpSummary && currentRank < 0) summaryMessage = `Demonicon challenge vs ${enemyName} ended.`;


        newNotifications.push({
            id: Date.now().toString() + "-demoniconRunEndSummary",
            message: summaryMessage,
            type: 'info', iconName: ICONS.LOOT_BAG ? 'LOOT_BAG' : undefined, timestamp: Date.now()
        });
      }
      return {
        ...state,
        resources: newResources,
        heroes: finalHeroesState,
        activeDemoniconChallenge: null,
        battleState: null,
        activeView: ActiveView.DEMONICON_PORTAL,
        notifications: [...newNotifications, {id: Date.now().toString(), message: "Returned to Demonicon Portal.", type: 'info', iconName: ICONS.REPLAY ? 'REPLAY': undefined, timestamp: Date.now()}],
      };
    }
    default:
      return state;
  }
};
