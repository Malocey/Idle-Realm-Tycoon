
import { GameState, ResearchProgress, CompletedResearchEntry, GameNotification, GlobalBonuses } from '../../types';
import { RESEARCH_DEFINITIONS } from '../../gameData';
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../../constants';
import { ICONS } from '../../components/Icons'; // Corrected import path

export const processResearchProgress = (state: GameState, globalBonuses: GlobalBonuses, elapsedWallClockMs: number, gameSpeed: number): GameState => {
  if (Object.keys(state.researchProgress).length === 0 && state.researchQueue.length === 0) {
    return state;
  }

  let newResearchProgress = { ...state.researchProgress };
  let newCompletedResearch = { ...state.completedResearch };
  let newNotifications = [...state.notifications];
  let newResearchQueue = [...state.researchQueue];
  
  const researchSlotIdsInUse = new Set<number>();
  Object.values(newResearchProgress).forEach(p => researchSlotIdsInUse.add(p.researchSlotId));

  // Calculate how many base game ticks effectively passed in the elapsedWallClockMs, considering gameSpeed
  const effectiveGameTicksPassed = Math.floor(elapsedWallClockMs / (GAME_TICK_MS / gameSpeed));

  Object.keys(newResearchProgress).forEach(instanceId => {
    const researchingItem = { ...newResearchProgress[instanceId] }; 
    const researchDef = RESEARCH_DEFINITIONS[researchingItem.researchId];
    if (!researchDef) return;

    const researchTimeReductionBonus = globalBonuses.researchTimeReduction || 0;
    const progressThisInterval = effectiveGameTicksPassed * (1 + researchTimeReductionBonus);
    
    researchingItem.currentProgressTicks += progressThisInterval;

    if (researchingItem.currentProgressTicks >= researchingItem.targetTicks) {
      newCompletedResearch[researchingItem.researchId] = {
        level: researchingItem.levelBeingResearched,
      };
      delete newResearchProgress[instanceId];
      researchSlotIdsInUse.delete(researchingItem.researchSlotId);

      newNotifications.push({
        id: Date.now().toString() + "-researchComplete-" + researchDef.id,
        message: `Research Complete: ${researchDef.name} Lvl ${researchingItem.levelBeingResearched}!`,
        type: 'success',
        iconName: researchDef.iconName || 'UPGRADE',
        timestamp: Date.now(),
      });
    } else {
      newResearchProgress[instanceId] = researchingItem; 
    }
  });
  
  if (newResearchQueue.length > 0 && researchSlotIdsInUse.size < state.researchSlots) {
      for (let i = 0; i < state.researchSlots; i++) {
          if (!researchSlotIdsInUse.has(i) && newResearchQueue.length > 0) {
              const nextQueuedItem = newResearchQueue.shift()!;
              const nextResearchDef = RESEARCH_DEFINITIONS[nextQueuedItem.researchId];
              if (nextResearchDef) {
                const newInstanceId = `${nextQueuedItem.researchId}-${nextQueuedItem.levelToResearch}-${Date.now()}`;
                newResearchProgress[newInstanceId] = {
                    researchId: nextQueuedItem.researchId,
                    levelBeingResearched: nextQueuedItem.levelToResearch,
                    currentProgressTicks: 0,
                    targetTicks: nextResearchDef.researchTimeTicks,
                    researchSlotId: i,
                    startTime: Date.now(),
                };
                researchSlotIdsInUse.add(i); 
                newNotifications.push({ id: Date.now().toString() + "-researchStartedFromQueue", message: `Started ${nextResearchDef.name} Lvl ${nextQueuedItem.levelToResearch} from queue.`, type: 'info', iconName: nextResearchDef.iconName, timestamp: Date.now() });
              }
          }
      }
  }

  return { ...state, researchProgress: newResearchProgress, completedResearch: newCompletedResearch, notifications: newNotifications, researchQueue: newResearchQueue };
};
