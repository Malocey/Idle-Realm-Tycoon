
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, ResourceType, BattleState, GameContextType, PlayerHeroState, BattleHero, EnemyDefinition, ActiveView, BattleEnemy } from '../../types';
import { calculateGlobalBonusesFromAllSources, formatNumber, canAfford, calculateHeroStats as calculateHeroStatsUtil, calculateWaveEnemyStats } from '../../utils';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS as ALL_ENEMY_DEFINITIONS, WAVE_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, RUN_BUFF_DEFINITIONS, SKILL_TREES, SHARD_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../../gameData/index';
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../../constants';
import { ICONS } from '../../components/Icons';

type StartWaveBattlePreparationPayload = Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>['payload'];

interface StartBattleReducerResult {
  updatedState: GameState;
  deferredActions: GameAction[];
}

export const startBattleReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>,
  globalBonuses: GlobalBonuses,
  staticData: GameContextType['staticData']
): StartBattleReducerResult => {
  if (action.type !== 'START_WAVE_BATTLE_PREPARATION') {
    return { updatedState: state, deferredActions: [] };
  }

  const payload = action.payload;
  const deferredActions: GameAction[] = [];
  let newResources = { ...state.resources };
  let newNotifications = [...state.notifications];
  let newBuildingLevelUpEvents = { ...state.buildingLevelUpEvents };
  let newBuildings = [...state.buildings];

  // Apply rewards from the previous wave if auto-progressing
  if (payload.isAutoProgression && payload.rewardsForPreviousWave) {
    payload.rewardsForPreviousWave.forEach(reward => {
      newResources[reward.resource] = (newResources[reward.resource] || 0) + reward.amount;
    });
  }
  if (payload.isAutoProgression && payload.expFromPreviousWave) {
    newResources[ResourceType.HEROIC_POINTS] = (newResources[ResourceType.HEROIC_POINTS] || 0) + payload.expFromPreviousWave;
  }
  if (payload.isAutoProgression && payload.buildingLevelUpEventsFromPreviousWave) {
    payload.buildingLevelUpEventsFromPreviousWave.forEach(event => {
      const buildingIndex = newBuildings.findIndex(b => b.id === event.buildingId);
      if (buildingIndex !== -1) {
        newBuildings[buildingIndex] = { ...newBuildings[buildingIndex], level: event.newLevel };
        newBuildingLevelUpEvents[event.buildingId] = { timestamp: Date.now() }; // Update timestamp for UI
      }
    });
  }

  const heroesForBattle: BattleHero[] = state.heroes
    .filter(h => h.level > 0) 
    .map((playerHeroState, idx) => {
      const heroDef = staticData.heroDefinitions[playerHeroState.definitionId];
      const skillTree = staticData.skillTrees[heroDef.skillTreeId];

      const fullHeroStateFromPreviousWave = payload.persistedFullHeroStatesFromPreviousWave?.[playerHeroState.definitionId];

      const baseStateForCalc: PlayerHeroState = fullHeroStateFromPreviousWave
        ? {
            ...playerHeroState, 
            definitionId: fullHeroStateFromPreviousWave.definitionId, 
            level: fullHeroStateFromPreviousWave.level,
            currentExp: fullHeroStateFromPreviousWave.currentExp,
            expToNextLevel: fullHeroStateFromPreviousWave.expToNextLevel,
            skillPoints: fullHeroStateFromPreviousWave.skillPoints,
            skillLevels: playerHeroState.skillLevels,
            specialAttackLevels: playerHeroState.specialAttackLevels,
            equipmentLevels: playerHeroState.equipmentLevels,
            permanentBuffs: playerHeroState.permanentBuffs,
            ownedShards: playerHeroState.ownedShards,
            potionSlots: playerHeroState.potionSlots,
            appliedPermanentStats: playerHeroState.appliedPermanentStats,
          }
        : playerHeroState;


      const calculatedStats = calculateHeroStatsUtil(
        baseStateForCalc, 
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
        false, 
        state.achievedDemoniconMilestoneRewards
      );

      const persistedHp = payload.persistedHeroHp?.[playerHeroState.definitionId];
      const persistedMana = payload.persistedHeroMana?.[playerHeroState.definitionId];
      const persistedCooldowns = payload.persistedHeroSpecialCooldowns?.[playerHeroState.definitionId] || {};
      
      const initialLevelForSummary = fullHeroStateFromPreviousWave 
          ? fullHeroStateFromPreviousWave.initialLevelForSummary
          : playerHeroState.level;
      const initialExpForSummary = fullHeroStateFromPreviousWave
          ? fullHeroStateFromPreviousWave.initialExpForSummary
          : playerHeroState.currentExp;


      return {
        ...heroDef, 
        ...baseStateForCalc, 
        attackType: heroDef.attackType || 'MELEE', 
        rangedAttackRangeUnits: heroDef.rangedAttackRangeUnits, 
        uniqueBattleId: `${playerHeroState.definitionId}_wave_${payload.waveNumber || (payload.currentCustomWaveIndex !== undefined ? payload.currentCustomWaveIndex + 1 : 0)}_${idx}_${Date.now()}`,
        currentHp: persistedHp !== undefined ? Math.min(persistedHp, calculatedStats.maxHp) : calculatedStats.maxHp,
        currentMana: persistedMana !== undefined ? Math.min(persistedMana, calculatedStats.maxMana || 0) : (calculatedStats.maxMana || 0),
        calculatedStats, 
        attackCooldown: (1000 / calculatedStats.attackSpeed),
        attackCooldownRemainingTicks: 0,
        movementSpeed: 0, x: 0, y: 0,
        specialAttackCooldownsRemaining: { ...persistedCooldowns },
        statusEffects: [],
        temporaryBuffs: [],
        currentEnergyShield: calculatedStats.maxEnergyShield || 0,
        shieldRechargeDelayTicksRemaining: 0,
        initialLevelForSummary, 
        initialExpForSummary,   
      };
    });

  if (heroesForBattle.length === 0) {
    newNotifications.push({ id: Date.now().toString(), message: "No heroes available for battle. Recruit or revive heroes.", type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() });
    return { updatedState: { ...state, notifications: newNotifications }, deferredActions: [] };
  }

  let enemiesForBattle: BattleEnemy[] = [];
  let waveIdentifierForLog: string;

  if (payload.customWaveSequence && payload.currentCustomWaveIndex !== undefined && payload.sourceMapNodeId) {
    const customWaveId = payload.customWaveSequence[payload.currentCustomWaveIndex];
    const waveDef = staticData.waveDefinitions.find(w => w.id === customWaveId);
    waveIdentifierForLog = `Map Battle (${payload.sourceMapNodeId} - Wave ${payload.currentCustomWaveIndex + 1}/${payload.customWaveSequence.length})`;

    if (waveDef) {
      waveDef.enemies.forEach(ew => {
        const enemyDef = staticData.enemyDefinitions[ew.enemyId];
        if (enemyDef) {
          for (let i = 0; i < ew.count; i++) {
            const stats = calculateWaveEnemyStats(enemyDef, payload.currentCustomWaveIndex! + 1, ew.isElite); 
            enemiesForBattle.push({
              ...enemyDef,
              attackType: enemyDef.attackType || 'MELEE',
              rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
              uniqueBattleId: `${ew.enemyId}_mapwave_${payload.currentCustomWaveIndex! + 1}_${i}_${Date.now()}`,
              currentHp: stats.maxHp,
              calculatedStats: stats,
              attackCooldown: (1000 / stats.attackSpeed),
              attackCooldownRemainingTicks: 0,
              movementSpeed: 0, x: 0, y: 0,
              statusEffects: [],
              temporaryBuffs: [],
              isElite: ew.isElite,
              specialAttackCooldownsRemaining: {},
              currentEnergyShield: stats.maxEnergyShield || 0,
              shieldRechargeDelayTicksRemaining: 0,
            });
          }
        }
      });
    }
  } else {
    const waveDef = staticData.waveDefinitions.find(w => w.waveNumber === payload.waveNumber);
    waveIdentifierForLog = `Wave ${payload.waveNumber}`;
    if (waveDef) {
      waveDef.enemies.forEach(ew => {
        const enemyDef = staticData.enemyDefinitions[ew.enemyId];
        if (enemyDef) {
          for (let i = 0; i < ew.count; i++) {
            const stats = calculateWaveEnemyStats(enemyDef, payload.waveNumber, ew.isElite);
            enemiesForBattle.push({
              ...enemyDef,
              attackType: enemyDef.attackType || 'MELEE',
              rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
              uniqueBattleId: `${ew.enemyId}_wave_${payload.waveNumber}_${i}_${Date.now()}`,
              currentHp: stats.maxHp,
              calculatedStats: stats,
              attackCooldown: (1000 / stats.attackSpeed),
              attackCooldownRemainingTicks: 0,
              movementSpeed: 0, x: 0, y: 0,
              statusEffects: [],
              temporaryBuffs: [],
              isElite: ew.isElite,
              specialAttackCooldownsRemaining: {},
              currentEnergyShield: stats.maxEnergyShield || 0,
              shieldRechargeDelayTicksRemaining: 0,
            });
          }
        }
      });
    }
  }


  if (enemiesForBattle.length === 0) {
     newNotifications.push({ id: Date.now().toString(), message: `No enemies defined for ${waveIdentifierForLog}. Battle cannot start.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() });
     return { updatedState: { ...state, notifications: newNotifications, resources: newResources, buildings: newBuildings, buildingLevelUpEvents: newBuildingLevelUpEvents }, deferredActions };
  }

  const newBattleState: BattleState = {
    waveNumber: payload.waveNumber,
    customWaveSequence: payload.customWaveSequence,
    currentCustomWaveIndex: payload.currentCustomWaveIndex,
    sourceMapNodeId: payload.sourceMapNodeId,
    heroes: heroesForBattle,
    enemies: enemiesForBattle,
    battleLog: [`${waveIdentifierForLog} starting!`],
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
    sessionTotalLoot: payload.persistedSessionTotalLoot || [],
    sessionTotalExp: payload.persistedSessionTotalExp || 0,
    sessionTotalBuildingLevelUps: [], // Initialize as empty, will accumulate per-tick from battleState
    stats: {},
  };

  deferredActions.push({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.BATTLEFIELD });

  const updatedState: GameState = {
    ...state,
    resources: newResources,
    buildings: newBuildings,
    buildingLevelUpEvents: newBuildingLevelUpEvents,
    battleState: newBattleState,
    notifications: newNotifications,
  };

  return {
    updatedState,
    deferredActions
  };
};