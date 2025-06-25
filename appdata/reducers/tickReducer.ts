
import { GameState, GameAction, GlobalBonuses, GameNotification, BuildingSpecificUpgradeDefinition, ResearchProgress, CompletedResearchEntry, FeederParticle } from '../types'; // Added FeederParticle
import { GAME_TICK_MS, FUSION_ANCHOR_FADE_OUT_DURATION_MS, FEEDER_PARTICLE_DURATION_MS, FEEDER_SPAWN_INTERVAL_MS } from '../constants'; // Added FEEDER_SPAWN_INTERVAL_MS

// Korrigierte Importpfade
import { processBuildingProduction } from './tickActions/buildingProduction';
import { processPotionCrafting } from './tickActions/potionCrafting';
import { processResearchProgress } from './tickActions/researchProgress';
import { processAutoBattlerTick } from './tickActions/autoBattlerTick'; 

// Helper function to generate a unique ID
const generateUniqueIdForParticle = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


export const handleProcessTick = (state: GameState, action: Extract<GameAction, { type: 'PROCESS_TICK' }>, globalBonuses: GlobalBonuses): GameState => {
  let newState = { ...state };
  const currentTime = Date.now();
  const timeSinceLastGeneralTick = Math.max(GAME_TICK_MS / state.gameSpeed, currentTime - newState.lastTickTimestamp); // Wall-clock time since last general tick

  const TARGET_UPDATE_INTERVAL_MS = 1000; // Target wall-clock milliseconds for these updates

  // 1. Process Building Production
  if (currentTime - newState.lastProductionUpdateTime >= TARGET_UPDATE_INTERVAL_MS) {
    const elapsedWallClockForProduction = currentTime - newState.lastProductionUpdateTime;
    newState = processBuildingProduction(newState, globalBonuses, elapsedWallClockForProduction, state.gameSpeed);
    newState.lastProductionUpdateTime = currentTime;
  }

  // 2. Process Potion Crafting
  if (currentTime - newState.lastPotionCraftUpdateTime >= TARGET_UPDATE_INTERVAL_MS) {
    const elapsedWallClockForPotions = currentTime - newState.lastPotionCraftUpdateTime;
    newState = processPotionCrafting(newState, globalBonuses, elapsedWallClockForPotions, state.gameSpeed);
    newState.lastPotionCraftUpdateTime = currentTime;
  }

  // 3. Process Research
  if (currentTime - newState.lastResearchUpdateTime >= TARGET_UPDATE_INTERVAL_MS) {
    const elapsedWallClockForResearch = currentTime - newState.lastResearchUpdateTime;
    newState = processResearchProgress(newState, globalBonuses, elapsedWallClockForResearch, state.gameSpeed);
    newState.lastResearchUpdateTime = currentTime;
  }


  // 4. Process Auto-Battler Minigame Tick if active (Passive elements only)
  // newState = processAutoBattlerTick(newState, timeSinceLastGeneralTick, state.gameSpeed); // Still uses general tick if needed

  // 5. Fusion Anchor & Feeder Particle Management (runs every general tick for smoothness)
  if (newState.battleState) {
    const now = Date.now();
    let updatedBattleState = { 
        ...newState.battleState,
        fusionAnchors: [...(newState.battleState.fusionAnchors || [])],
        feederParticles: [...(newState.battleState.feederParticles || [])]
    };

    let newFeederParticlesThisTick: FeederParticle[] = [];
    updatedBattleState.fusionAnchors = updatedBattleState.fusionAnchors.map(anchor => {
      let updatedAnchor = { ...anchor };
      if (!updatedAnchor.feederQueue) updatedAnchor.feederQueue = [];
      if (updatedAnchor.feederQueue.length > 0 && (now - (updatedAnchor.lastFeederSpawnTime || 0) > FEEDER_SPAWN_INTERVAL_MS)) {
        const itemToSpawn = updatedAnchor.feederQueue.shift();
        if (itemToSpawn) {
          newFeederParticlesThisTick.push({
            id: generateUniqueIdForParticle(),
            targetAnchorId: updatedAnchor.id,
            amount: itemToSpawn.amount,
            isCritical: itemToSpawn.isCritical,
            timestamp: now,
          });
          updatedAnchor.lastFeederSpawnTime = now;
        }
      }
      return updatedAnchor;
    });

    if (newFeederParticlesThisTick.length > 0) {
      updatedBattleState.feederParticles = [...updatedBattleState.feederParticles, ...newFeederParticlesThisTick];
    }
    
    updatedBattleState.fusionAnchors = updatedBattleState.fusionAnchors.filter(
      anchor => (now - anchor.lastUpdateTime) <= FUSION_ANCHOR_FADE_OUT_DURATION_MS || (anchor.feederQueue && anchor.feederQueue.length > 0)
    );
    
    updatedBattleState.feederParticles = updatedBattleState.feederParticles.filter(
      particle => (now - particle.timestamp) <= FEEDER_PARTICLE_DURATION_MS 
    );
    
    newState.battleState = updatedBattleState;
  }

  // 6. Cleanup old building level up events (runs every general tick)
  const nowForCleanup = Date.now();
  const LEVEL_UP_EVENT_DURATION_MS = 10000;
  const activeLevelUpEvents: Record<string, { timestamp: number }> = {};
  let levelUpEventsChanged = false;
  Object.entries(state.buildingLevelUpEvents).forEach(([buildingId, eventData]) => {
    if (nowForCleanup - eventData.timestamp < LEVEL_UP_EVENT_DURATION_MS) {
      activeLevelUpEvents[buildingId] = eventData;
    } else {
      levelUpEventsChanged = true;
    }
  });

  if (levelUpEventsChanged || Object.keys(state.buildingLevelUpEvents).length !== Object.keys(activeLevelUpEvents).length) {
    newState.buildingLevelUpEvents = activeLevelUpEvents;
  }

  newState.lastTickTimestamp = currentTime;
  return newState;
};
