import { QuestObjectiveType, QuestRewardType, ResourceType } from './enums';

export const MAX_ACTIVE_QUESTS = 3;

export interface QuestObjective {
  type: QuestObjectiveType;
  targetValue: number;
  currentValue: number;
  resourceType?: ResourceType;
  enemyId?: string;
  description: string;
}

export interface QuestReward {
  type: QuestRewardType;
  shardDefinitionId?: string;
  shardLevel?: number;
  resourceType?: ResourceType;
  amount?: number;
  description: string;
  iconName?: string;
}

export interface PlayerQuest {
  id: string;
  templateIdPrefix: string;
  title: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  isCompleted: boolean;
  isClaimed: boolean;
  generationTimestamp: number;
}

export interface QuestTemplate {
  idPrefix: string;
  titlePattern: string;
  objectiveTemplates: Array<{
    type: QuestObjectiveType;
    baseTargetValue: number;
    targetValueScaleFactor?: number;
    resourceType?: ResourceType;
    enemyId?: string;
    descriptionPattern: string;
  }>;
  rewardTemplates: Array<{
    type: QuestRewardType;
    shardDefinitionId?: string;
    shardLevel?: number;
    resourceType?: ResourceType;
    baseAmount?: number;
    amountScaleFactor?: number;
    descriptionPattern: string;
    iconName?: string;
  }>;
  minWaveRequirement?: number;
}
