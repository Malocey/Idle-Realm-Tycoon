
import { GameState, GameAction, PlayerQuest, MAX_ACTIVE_QUESTS, QuestObjectiveType, QuestRewardType, ResourceType, GameNotification } from '../types';
import { generateNewQuest, generateUniqueId } from '../utils/questUtils';
import { QUEST_DEFINITIONS, SHARD_DEFINITIONS, HERO_DEFINITIONS, ENEMY_DEFINITIONS } from '../gameData/index'; 
import { NOTIFICATION_ICONS, RESOURCE_COLORS } from '../constants';
import { ICONS } from '../components/Icons';
import { formatNumber } from '../utils';


export const questReducer = (state: GameState, action: Extract<GameAction, { type: 'GENERATE_NEW_QUESTS' | 'CLAIM_QUEST_REWARD' | 'PROCESS_QUEST_PROGRESS_FROM_BATTLE' }>): GameState => {
  switch (action.type) {
    case 'GENERATE_NEW_QUESTS': {
      if (state.activeQuests.length >= MAX_ACTIVE_QUESTS) {
        return state; 
      }

      let newActiveQuests = [...state.activeQuests];
      const activeTemplatePrefixes = newActiveQuests.map(q => q.templateIdPrefix);
      
      const slotsToFill = MAX_ACTIVE_QUESTS - newActiveQuests.length;
      for (let i = 0; i < slotsToFill; i++) {
        const newQuest = generateNewQuest(
          state.currentWaveProgress,
          activeTemplatePrefixes, 
          QUEST_DEFINITIONS 
        );

        if (newQuest) {
          newActiveQuests.push(newQuest);
          activeTemplatePrefixes.push(newQuest.templateIdPrefix); 
        } else {
          break; 
        }
      }
      
      if (newActiveQuests.length > state.activeQuests.length) {
        return { ...state, activeQuests: newActiveQuests };
      }
      return state;
    }
    case 'PROCESS_QUEST_PROGRESS_FROM_BATTLE': {
      const { lootCollected, defeatedEnemyOriginalIds, waveNumberReached } = action.payload;
      let updatedQuests = [...state.activeQuests];
      let notificationsToAdd: GameNotification[] = [];

      updatedQuests = updatedQuests.map(quest => {
        if (quest.isCompleted) return quest;

        let objectivesCompletedThisCheck = 0;
        const newObjectives = quest.objectives.map(obj => {
          if (obj.currentValue >= obj.targetValue) {
            objectivesCompletedThisCheck++;
            return obj;
          }

          let progressMade = 0;
          switch (obj.type) {
            case QuestObjectiveType.DEFEAT_ENEMIES:
              if (obj.enemyId) {
                progressMade = defeatedEnemyOriginalIds.filter(id => id === obj.enemyId).length;
              } else {
                progressMade = defeatedEnemyOriginalIds.length;
              }
              break;
            case QuestObjectiveType.COLLECT_RESOURCE:
              if (obj.resourceType) {
                const relevantLoot = lootCollected.find(l => l.resource === obj.resourceType);
                if (relevantLoot) progressMade = relevantLoot.amount;
              }
              break;
            case QuestObjectiveType.REACH_WAVE:
              if (waveNumberReached && waveNumberReached >= obj.targetValue) {
                progressMade = obj.targetValue - obj.currentValue; // Mark as complete
              }
              break;
          }
          
          const newCurrentValue = Math.min(obj.targetValue, obj.currentValue + progressMade);
          if (newCurrentValue > obj.currentValue) {
            // console.log(`Quest "${quest.title}" objective "${obj.description}" progress: ${obj.currentValue} -> ${newCurrentValue}`);
          }
          if (newCurrentValue >= obj.targetValue) {
            objectivesCompletedThisCheck++;
          }
          return { ...obj, currentValue: newCurrentValue };
        });

        if (objectivesCompletedThisCheck === newObjectives.length && !quest.isCompleted) {
          notificationsToAdd.push({
            id: `${Date.now()}-questComplete-${quest.id}`,
            message: `Quest Completed: ${quest.title}!`,
            type: 'success',
            iconName: ICONS.QUEST_ICON ? 'QUEST_ICON' : NOTIFICATION_ICONS.success,
            timestamp: Date.now(),
          });
          return { ...quest, objectives: newObjectives, isCompleted: true };
        }
        return { ...quest, objectives: newObjectives };
      });

      if (notificationsToAdd.length > 0) {
        return { ...state, activeQuests: updatedQuests, notifications: [...state.notifications, ...notificationsToAdd] };
      }
      return { ...state, activeQuests: updatedQuests };
    }

    case 'CLAIM_QUEST_REWARD': {
      const questId = action.payload.questId;
      const questIndex = state.activeQuests.findIndex(q => q.id === questId);

      if (questIndex === -1 || !state.activeQuests[questIndex].isCompleted || state.activeQuests[questIndex].isClaimed) {
        return state; 
      }

      const questToClaim = state.activeQuests[questIndex];
      let newResources = { ...state.resources };
      let updatedHeroes = [...state.heroes];
      const notificationsToAdd: GameNotification[] = [];

      questToClaim.rewards.forEach(reward => {
        switch (reward.type) {
          case QuestRewardType.RESOURCE:
            if (reward.resourceType && reward.amount) {
              newResources[reward.resourceType] = (newResources[reward.resourceType] || 0) + reward.amount;
            }
            break;
          case QuestRewardType.HERO_XP:
            if (reward.amount) {
              newResources[ResourceType.HEROIC_POINTS] = (newResources[ResourceType.HEROIC_POINTS] || 0) + reward.amount;
            }
            break;
          case QuestRewardType.SHARD:
            if (reward.shardDefinitionId && reward.shardLevel && reward.amount && updatedHeroes.length > 0) {
              const shardDef = SHARD_DEFINITIONS[reward.shardDefinitionId];
              if (shardDef) {
                const firstHeroIndex = 0; // Add to first hero
                let targetHero = { ...updatedHeroes[firstHeroIndex] };
                let heroShards = [...(targetHero.ownedShards || [])];
                for (let i = 0; i < reward.amount; i++) {
                  heroShards.push({
                    instanceId: generateUniqueId(),
                    definitionId: reward.shardDefinitionId,
                    level: reward.shardLevel,
                  });
                }
                targetHero.ownedShards = heroShards;
                updatedHeroes[firstHeroIndex] = targetHero;
              }
            }
            break;
        }
         notificationsToAdd.push({
            id: `${Date.now()}-rewardClaimed-${questToClaim.id}-${reward.description.slice(0,10)}`,
            message: `Claimed: ${reward.description} (from ${questToClaim.title})`,
            type: 'success',
            iconName: reward.iconName || NOTIFICATION_ICONS.success,
            timestamp: Date.now(),
        });
      });
      
      const remainingQuests = state.activeQuests.filter(q => q.id !== questId);
      
      // Try to generate a new quest
      let finalQuests = [...remainingQuests];
      const activeTemplatePrefixesForNewGen = finalQuests.map(q => q.templateIdPrefix);
      const newGeneratedQuest = generateNewQuest(
          state.currentWaveProgress,
          activeTemplatePrefixesForNewGen,
          QUEST_DEFINITIONS
      );
      if (newGeneratedQuest && finalQuests.length < MAX_ACTIVE_QUESTS) {
          finalQuests.push(newGeneratedQuest);
      }

      return { 
        ...state, 
        activeQuests: finalQuests, 
        resources: newResources, 
        heroes: updatedHeroes,
        notifications: [...state.notifications, ...notificationsToAdd]
      };
    }

    default:
      return state;
  }
};