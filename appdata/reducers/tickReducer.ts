
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
  // Ensure at least GAME_TICK_MS passes, scaled by gameSpeed for actual time progression
  const timeSinceLastTick = Math.max(GAME_TICK_MS, currentTime - newState.lastTickTimestamp);

  // 1. Process Building Production
  newState = processBuildingProduction(newState, globalBonuses, timeSinceLastTick, state.gameSpeed);

  // 2. Process Potion Crafting
  newState = processPotionCrafting(newState, globalBonuses, timeSinceLastTick, state.gameSpeed);

  // 3. Process Research
  newState = processResearchProgress(newState, globalBonuses, timeSinceLastTick, state.gameSpeed);

  // 4. Process Auto-Battler Minigame Tick if active (Passive elements only)
  // newState = processAutoBattlerTick(newState, timeSinceLastTick, state.gameSpeed);

  // 5. Fusion Anchor & Feeder Particle Management
  if (newState.battleState) {
    const now = Date.now();
    let updatedBattleState = { 
        ...newState.battleState,
        // Ensure arrays exist before operating on them
        fusionAnchors: [...(newState.battleState.fusionAnchors || [])],
        feederParticles: [...(newState.battleState.feederParticles || [])]
    };

    // Feeder Particle Spawner from Queues
    let newFeederParticlesThisTick: FeederParticle[] = [];
    updatedBattleState.fusionAnchors = updatedBattleState.fusionAnchors.map(anchor => {
      let updatedAnchor = { ...anchor };
      if (!updatedAnchor.feederQueue) updatedAnchor.feederQueue = []; // Ensure queue exists
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
    
    // Fusion Anchor Fade-out Cleanup
    updatedBattleState.fusionAnchors = updatedBattleState.fusionAnchors.filter(
      anchor => (now - anchor.lastUpdateTime) <= FUSION_ANCHOR_FADE_OUT_DURATION_MS || anchor.feederQueue.length > 0
    );
    
    // Feeder Particle Lifetime Cleanup
    updatedBattleState.feederParticles = updatedBattleState.feederParticles.filter(
      particle => (now - particle.timestamp) <= FEEDER_PARTICLE_DURATION_MS 
    );
    
    newState.battleState = updatedBattleState;
  }

  // 6. Cleanup old building level up events
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


  // Update last tick timestamp
  newState.lastTickTimestamp = currentTime;

  return newState;
};