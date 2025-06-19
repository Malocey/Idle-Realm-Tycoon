
import { GameState, BattleSummary, BattleSummaryHeroPerformance, BattleSummaryResource, BattleSummaryShard, BattleSummaryBuildingLevelUp, BattleHero, GameContextType, ResourceType } from '../../types';
import { formatNumber, getExpToNextHeroLevel } from '../../utils'; 
import { ICONS } from '../../components/Icons';

export const generateBattleSummary = (
  state: GameState,
  staticData: GameContextType['staticData']
): BattleSummary => {
  const battleState = state.battleState;
  if (!battleState) {
    // This case should ideally not be hit if called correctly before battleState is cleared.
    // But as a fallback, return an empty defeat summary.
    console.warn("generateBattleSummary called with no battleState. This might indicate an issue in the reducer flow.");
    return {
      result: 'DEFEAT',
      xpGained: 0,
      heroes: [],
      resourcesGained: [],
      shardsGained: [],
      buildingLevelUps: [],
    };
  }

  const result = battleState.status === 'VICTORY' ? 'VICTORY' : 'DEFEAT';
  
  // Use session totals for overall XP and resources
  const overallXpGained = battleState.sessionTotalExp || 0;
  const resourcesGainedFromSession = battleState.sessionTotalLoot || [];
  const buildingLevelUpsFromSession = battleState.sessionTotalBuildingLevelUps || [];

  const heroPerformances: BattleSummaryHeroPerformance[] = battleState.heroes.map(battleHero => {
    const heroDef = staticData.heroDefinitions[battleHero.definitionId];
    const liveStats = battleState.stats[battleHero.uniqueBattleId] || { damageDealt: 0, healingDone: 0 };

    const initialLevel = battleHero.initialLevelForSummary;
    const finalLevel = battleHero.level;
    const didLevelUp = finalLevel > initialLevel;

    let xpGainedByThisHero = 0;
    if (didLevelUp) {
        // XP to level up from initial level
        xpGainedByThisHero += getExpToNextHeroLevel(initialLevel) - battleHero.initialExpForSummary;
        // XP for all intermediate full levels
        for (let lvl = initialLevel + 1; lvl < finalLevel; lvl++) {
            xpGainedByThisHero += getExpToNextHeroLevel(lvl);
        }
        // XP into the current final level
        xpGainedByThisHero += battleHero.currentExp;
    } else {
        // XP gained within the same level
        xpGainedByThisHero = battleHero.currentExp - battleHero.initialExpForSummary;
    }
    xpGainedByThisHero = Math.max(0, xpGainedByThisHero);

    return {
      id: battleHero.definitionId,
      name: heroDef?.name || battleHero.id,
      xpGained: xpGainedByThisHero,
      didLevelUp,
      oldLevel: initialLevel,
      newLevel: finalLevel,
      totalDamageDealt: liveStats.damageDealt,
      totalHealingDone: liveStats.healingDone,
    };
  });

  const resourcesGained: BattleSummaryResource[] = resourcesGainedFromSession.map(cost => { 
    const resourceName = cost.resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      type: resourceName,
      amount: cost.amount,
      iconName: cost.resource as keyof typeof ICONS, 
    };
  });

  const shardsGained: BattleSummaryShard[] = []; // Implement actual shard drop logic if needed

  const buildingLevelUps: BattleSummaryBuildingLevelUp[] = buildingLevelUpsFromSession.map(event => ({ 
    buildingId: event.buildingId,
    buildingName: event.buildingName,
    newLevel: event.newLevel,
    iconName: event.iconName as keyof typeof ICONS,
  }));

  // Populate new context fields
  const wasDungeonGridBattle = battleState.isDungeonGridBattle || false;
  const wasDungeonBattle = battleState.isDungeonBattle || false;
  const sourceMapNodeIdForContext = battleState.sourceMapNodeId || undefined; 
  const wasDemoniconBattle = battleState.isDemoniconBattle || false;

  // Populate retry fields for starting from the beginning
  let waveNumberForRetry: number | undefined = undefined;
  let customWaveSequenceForRetry: string[] | undefined = undefined;
  let currentCustomWaveIndexForRetry: number | undefined = undefined;
  let demoniconEnemyIdForRetry: string | undefined = undefined;
  let demoniconRankForRetry: number | undefined = undefined;

  if (battleState.isDemoniconBattle) {
    demoniconEnemyIdForRetry = battleState.demoniconEnemyId;
    demoniconRankForRetry = 0; 
  } else if (battleState.sourceMapNodeId) {
    const mapNode = staticData.worldMapDefinitions[state.currentMapId]?.nodes.find(n => n.id === battleState.sourceMapNodeId);
    if (battleState.customWaveSequence && mapNode) {
      customWaveSequenceForRetry = battleState.customWaveSequence;
      currentCustomWaveIndexForRetry = 0; 
    } else if (mapNode && mapNode.battleWaveStart !== undefined) {
      waveNumberForRetry = mapNode.battleWaveStart; 
    } else if (mapNode) {
      waveNumberForRetry = 1; 
    }
  } else if (battleState.waveNumber !== undefined) { 
    waveNumberForRetry = 1; 
  }


  return {
    result,
    xpGained: overallXpGained, 
    heroes: heroPerformances,
    resourcesGained,
    shardsGained,
    buildingLevelUps,
    wasDungeonGridBattle,
    wasDungeonBattle,
    sourceMapNodeId: sourceMapNodeIdForContext,
    wasDemoniconBattle,
    waveNumberForRetry,
    customWaveSequenceForRetry,
    currentCustomWaveIndexForRetry,
    demoniconEnemyIdForRetry,
    demoniconRankForRetry,
  };
};