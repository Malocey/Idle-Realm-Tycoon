
import { PlayerQuest, QuestTemplate, QuestObjective, QuestReward, QuestObjectiveType, MAX_ACTIVE_QUESTS, ResourceType, QuestRewardType } from '../types';
import { formatNumber } from './formatters';
import { SHARD_DEFINITIONS } from '../gameData/shardDefinitions';

export const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function generateNewQuest(
  currentHighestWave: number,
  activeQuestTemplatePrefixes: string[], 
  questTemplates: QuestTemplate[]
): PlayerQuest | null {
  const eligibleTemplates = questTemplates.filter(template => {
    if (template.minWaveRequirement && currentHighestWave < template.minWaveRequirement) {
      return false;
    }
    if (activeQuestTemplatePrefixes.includes(template.idPrefix)) { 
      return false;
    }
    return true;
  });

  if (eligibleTemplates.length === 0) {
    return null; 
  }

  const selectedTemplate = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];

  const objectives: QuestObjective[] = selectedTemplate.objectiveTemplates.map(objTemplate => {
    let targetValue = objTemplate.baseTargetValue;
    if (objTemplate.type === QuestObjectiveType.REACH_WAVE) {
      targetValue = Math.max(currentHighestWave + 1, currentHighestWave + objTemplate.baseTargetValue);
    } else if (objTemplate.targetValueScaleFactor) {
      targetValue = Math.max(1, Math.floor(objTemplate.baseTargetValue + objTemplate.targetValueScaleFactor * currentHighestWave));
    }
    
    const description = objTemplate.descriptionPattern.replace('{count}', formatNumber(targetValue));

    return {
      type: objTemplate.type,
      targetValue,
      currentValue: 0,
      resourceType: objTemplate.resourceType,
      enemyId: objTemplate.enemyId,
      description,
    };
  });

  const rewards: QuestReward[] = selectedTemplate.rewardTemplates.map(rewTemplate => {
    let rewardAmount = rewTemplate.baseAmount || 1;
    let rewardShardLevel = rewTemplate.shardLevel || 1;
    const maxUpgradedShardLevelCap = 3; 

    if (rewTemplate.type === QuestRewardType.SHARD && rewTemplate.shardDefinitionId) {
      const shardDef = SHARD_DEFINITIONS[rewTemplate.shardDefinitionId];
      const actualMaxLevelForShard = shardDef ? shardDef.maxFusionLevel : maxUpgradedShardLevelCap;

      if (currentHighestWave >= 25) {
        if (Math.random() < 0.05) { 
          rewardShardLevel = Math.min(rewardShardLevel + 2, actualMaxLevelForShard, maxUpgradedShardLevelCap);
        } else if (Math.random() < 0.15) { 
          rewardShardLevel = Math.min(rewardShardLevel + 1, actualMaxLevelForShard, maxUpgradedShardLevelCap);
        }
        if (Math.random() < 0.10) { 
          rewardAmount = Math.min(rewardAmount + 1, 2); 
        }
      } else if (currentHighestWave >= 15) {
        if (Math.random() < 0.10) { 
          rewardShardLevel = Math.min(rewardShardLevel + 1, actualMaxLevelForShard, maxUpgradedShardLevelCap);
        }
        if (Math.random() < 0.05) { 
          rewardAmount = Math.min(rewardAmount + 1, 2);
        }
      } else if (currentHighestWave >= 8) {
        if (Math.random() < 0.05) { 
          rewardShardLevel = Math.min(rewardShardLevel + 1, actualMaxLevelForShard, maxUpgradedShardLevelCap);
        }
      }
    } else if (rewTemplate.amountScaleFactor && rewTemplate.baseAmount) {
      rewardAmount = Math.max(1, Math.floor(rewTemplate.baseAmount + rewTemplate.amountScaleFactor * currentHighestWave));
    }
    
    let description = rewTemplate.descriptionPattern;
    if (rewTemplate.type === QuestRewardType.SHARD) {
        description = description.replace('{count}', rewardAmount.toString()).replace('{level}', rewardShardLevel.toString());
    } else {
        description = description.replace('{count}', formatNumber(rewardAmount));
    }

    return {
      type: rewTemplate.type,
      shardDefinitionId: rewTemplate.shardDefinitionId,
      shardLevel: rewardShardLevel,
      resourceType: rewTemplate.resourceType,
      amount: rewardAmount,
      description,
      iconName: rewTemplate.iconName,
    };
  });

  let title = selectedTemplate.titlePattern;
  if (objectives.length > 0 && selectedTemplate.titlePattern.includes('{count}')) {
    title = selectedTemplate.titlePattern.replace('{count}', formatNumber(objectives[0].targetValue));
  }

  return {
    id: `${selectedTemplate.idPrefix}-${generateUniqueId()}`,
    templateIdPrefix: selectedTemplate.idPrefix,
    title,
    objectives,
    rewards,
    isCompleted: false,
    isClaimed: false,
    generationTimestamp: Date.now(),
  };
}
