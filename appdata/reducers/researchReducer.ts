

import { GameState, GameAction, GlobalBonuses, ResearchDefinition, ResearchProgress, Cost, GameNotification, CompletedResearchEntry } from '../types';
import { RESEARCH_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../constants';
import { canAfford, formatNumber } from '../utils';
import { ICONS } from '../components/Icons';

export const researchReducer = (
    state: GameState,
    action: Extract<GameAction, { type: 'START_RESEARCH' | 'CANCEL_RESEARCH' | 'PROCESS_RESEARCH_TICK' }>,
    globalBonuses?: GlobalBonuses
): GameState => {
  // console.log('[researchReducer] researchReducer called with action:', action);
  switch (action.type) {
    case 'START_RESEARCH': {
      // console.log('[researchReducer] START_RESEARCH case reached. Payload:', action.payload);
      const { researchId, levelToResearch } = action.payload;
      
      const researchDef = RESEARCH_DEFINITIONS[researchId];
      if (!researchDef) {
        // console.warn(`[researchReducer] Research definition not found for ID: ${researchId}`);
        return state;
      }

      const completedLevel = state.completedResearch[researchId]?.level || 0;
      // console.log(`[researchReducer] Research: ${researchId}, Requested Lvl: ${levelToResearch}, Current Completed Lvl: ${completedLevel}`);

      if (levelToResearch <= completedLevel) {
          // console.warn(`[researchReducer] Research ${researchId} Lvl ${levelToResearch} already completed or lower than current.`);
          const alreadyDoneNotification: GameNotification = {id: Date.now().toString(), message: `${researchDef.name} Lvl ${levelToResearch} is already completed or a lower level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()};
          return { ...state, notifications: [...state.notifications, alreadyDoneNotification] };
      }
      if (levelToResearch !== completedLevel + 1) {
           // console.warn(`[researchReducer] Research ${researchId} Lvl ${levelToResearch} cannot be started. Next level should be ${completedLevel + 1}.`);
           const sequenceNotification: GameNotification = {id: Date.now().toString(), message: `Cannot start ${researchDef.name} Lvl ${levelToResearch}. Next level must be ${completedLevel + 1}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
           return { ...state, notifications: [...state.notifications, sequenceNotification] };
      }
      if (researchDef.maxLevel !== -1 && completedLevel >= researchDef.maxLevel) {
        const maxLevelNotification: GameNotification = {id: Date.now().toString(), message: `${researchDef.name} is already at max level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()};
        // console.log('[researchReducer] Max level reached for', researchDef.name);
        return { ...state, notifications: [...state.notifications, maxLevelNotification] };
      }

      let prerequisitesMet = true;
      for (const prereq of researchDef.prerequisites) {
        if ((state.completedResearch[prereq.researchId]?.level || 0) < prereq.level) {
          prerequisitesMet = false;
          const prereqDef = RESEARCH_DEFINITIONS[prereq.researchId];
          const prereqNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${prereqDef?.name || prereq.researchId} Lvl ${prereq.level} for ${researchDef.name}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
          // console.log('[researchReducer] Prerequisite not met for', researchDef.name, 'Requires:', prereqDef?.name, 'Lvl', prereq.level);
          return {...state, notifications: [...state.notifications, prereqNotification]};
        }
      }
      // console.log(`[researchReducer] Prerequisites for ${researchDef.name} Lvl ${levelToResearch}: ${prerequisitesMet ? 'Met' : 'Not Met'}`);


      const isAlreadyActive = Object.values(state.researchProgress).some(p => p.researchId === researchId && p.levelBeingResearched === levelToResearch) ||
                              state.researchQueue.some(q => q.researchId === researchId && q.levelToResearch === levelToResearch);
      if (isAlreadyActive) {
        const alreadyActiveNotification: GameNotification = {id: Date.now().toString(), message: `${researchDef.name} Lvl ${levelToResearch} is already being researched or queued.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()};
        // console.log('[researchReducer] Research already active/queued:', researchDef.name, 'Lvl', levelToResearch);
        return {...state, notifications: [...state.notifications, alreadyActiveNotification]};
      }

      const cost = researchDef.costPerLevel(levelToResearch);
      // console.log(`[researchReducer] Cost for ${researchDef.name} Lvl ${levelToResearch}:`, JSON.stringify(cost));
      const playerCanAfford = canAfford(state.resources, cost);
      // console.log(`[researchReducer] Player can afford ${researchDef.name} Lvl ${levelToResearch}:`, playerCanAfford, 'Player Resources:', JSON.stringify(state.resources));

      if (!playerCanAfford) {
        const insufficientNotification: GameNotification = {id: Date.now().toString(), message: `Not enough resources to start research: ${researchDef.name} Lvl ${levelToResearch}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
        return { ...state, notifications: [...state.notifications, insufficientNotification] };
      }

      const newResources = { ...state.resources };
      cost.forEach(c => newResources[c.resource] = (newResources[c.resource] || 0) - c.amount);

      let newResearchProgress = { ...state.researchProgress };
      let newResearchQueue = [...state.researchQueue];
      let researchStartedMessage = "";

      if (Object.keys(newResearchProgress).length < state.researchSlots) {
        let assignedSlotId = -1;
        for (let i = 0; i < state.researchSlots; i++) {
            if (!Object.values(newResearchProgress).find(p => p.researchSlotId === i)) {
                assignedSlotId = i;
                break;
            }
        }
        if (assignedSlotId !== -1) {
            const researchInstanceId = `${researchId}-${levelToResearch}-${Date.now()}`;
            newResearchProgress[researchInstanceId] = {
                researchId,
                levelBeingResearched: levelToResearch,
                currentProgressTicks: 0,
                targetTicks: researchDef.researchTimeTicks,
                researchSlotId: assignedSlotId,
                startTime: Date.now(),
            };
            researchStartedMessage = `Research started: ${researchDef.name} Lvl ${levelToResearch}.`;
            // console.log('[researchReducer] Research started in slot', assignedSlotId, newResearchProgress[researchInstanceId]);
        } else { 
             newResearchQueue.push({ researchId, levelToResearch });
             researchStartedMessage = `Research added to queue (no free slot found immediately): ${researchDef.name} Lvl ${levelToResearch}.`;
             // console.log('[researchReducer] All slots busy (logic error?), research added to queue:', { researchId, levelToResearch });
        }
      } else {
        newResearchQueue.push({ researchId, levelToResearch });
        researchStartedMessage = `Research added to queue: ${researchDef.name} Lvl ${levelToResearch}.`;
        // console.log('[researchReducer] All slots busy, research added to queue:', { researchId, levelToResearch });
      }

      const startNotification: GameNotification = { id: Date.now().toString(), message: researchStartedMessage, type: 'info', iconName: researchDef.iconName, timestamp: Date.now() };

      return {
        ...state,
        resources: newResources,
        researchProgress: newResearchProgress,
        researchQueue: newResearchQueue,
        notifications: [...state.notifications, startNotification]
      };
    }
    case 'CANCEL_RESEARCH': {
        const { researchId, researchSlotId } = action.payload;
        let newResearchProgress = { ...state.researchProgress };
        let newResearchQueue = [...state.researchQueue];
        const researchDef = RESEARCH_DEFINITIONS[researchId];
        let notificationMessage = "";
        let costRefunded: Cost[] = [];

        const activeResearchInstanceId = Object.keys(newResearchProgress).find(key =>
            newResearchProgress[key].researchId === researchId &&
            (researchSlotId === undefined || newResearchProgress[key].researchSlotId === researchSlotId)
        );

        if (activeResearchInstanceId && newResearchProgress[activeResearchInstanceId]) {
            const progressEntry = newResearchProgress[activeResearchInstanceId];
            costRefunded = researchDef.costPerLevel(progressEntry.levelBeingResearched).map(c => ({ ...c, amount: Math.floor(c.amount * 0.5) }));
            delete newResearchProgress[activeResearchInstanceId];
            notificationMessage = `${researchDef.name} Lvl ${progressEntry.levelBeingResearched} research cancelled.`;

            if (newResearchQueue.length > 0) {
                const nextInQueue = newResearchQueue.shift()!;
                const nextResearchDef = RESEARCH_DEFINITIONS[nextInQueue.researchId];
                const newInstanceId = `${nextInQueue.researchId}-${nextInQueue.levelToResearch}-${Date.now()}`;
                newResearchProgress[newInstanceId] = {
                    researchId: nextInQueue.researchId,
                    levelBeingResearched: nextInQueue.levelToResearch,
                    currentProgressTicks: 0,
                    targetTicks: nextResearchDef.researchTimeTicks,
                    researchSlotId: progressEntry.researchSlotId,
                    startTime: Date.now(),
                };
                 notificationMessage += ` Starting ${nextResearchDef.name} Lvl ${nextInQueue.levelToResearch} from queue.`;
            }

        } else {
            const queueIndex = newResearchQueue.findIndex(q => q.researchId === researchId);
            if (queueIndex !== -1) {
                const queuedItem = newResearchQueue.splice(queueIndex, 1)[0];
                costRefunded = researchDef.costPerLevel(queuedItem.levelToResearch).map(c => ({ ...c, amount: Math.floor(c.amount * 0.8) })); // Refund 80% from queue
                notificationMessage = `${researchDef.name} Lvl ${queuedItem.levelToResearch} removed from queue.`;
            } else {
                notificationMessage = `Could not find ${researchDef?.name || researchId} to cancel.`;
                 const noCancelNotification: GameNotification = {id: Date.now().toString(), message: notificationMessage, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                return { ...state, notifications: [...state.notifications, noCancelNotification]};
            }
        }

        const newResourcesAfterRefund = { ...state.resources };
        costRefunded.forEach(c => newResourcesAfterRefund[c.resource] = (newResourcesAfterRefund[c.resource] || 0) + c.amount);

        const cancelNotification: GameNotification = {id: Date.now().toString(), message: notificationMessage, type: 'info', iconName: researchDef?.iconName || NOTIFICATION_ICONS.info, timestamp: Date.now()};

        return {
            ...state,
            researchProgress: newResearchProgress,
            researchQueue: newResearchQueue,
            resources: newResourcesAfterRefund,
            notifications: [...state.notifications, cancelNotification]
        };
    }
    default:
      return state;
  }
};