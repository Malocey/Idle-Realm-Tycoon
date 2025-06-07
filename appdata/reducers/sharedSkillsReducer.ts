
import { GameState, GameAction, GlobalBonuses, ResourceType, PlayerSharedSkillProgress, GameNotification } from '../types';
import { SHARED_SKILL_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants'; // Corrected import path
import { canAfford, formatNumber } from '../utils';
import { ICONS } from '../components/Icons';

export const handleSharedSkillsActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'UPGRADE_SHARED_SKILL_MAJOR' | 'UPGRADE_SHARED_SKILL_MINOR' }>,
    globalBonuses: GlobalBonuses // For consistency, though not directly used for shared skill cost calculation yet
): GameState => {
  switch (action.type) {
    case 'UPGRADE_SHARED_SKILL_MAJOR': {
      const { skillId } = action.payload;
      const skillDef = SHARED_SKILL_DEFINITIONS[skillId];
      if (!skillDef) {
        console.warn(`Shared skill definition ${skillId} not found.`);
        return state;
      }

      const currentProgress = state.playerSharedSkills[skillId] || { currentMajorLevel: 0, currentMinorLevel: 0 };
      const currentMajorLevel = currentProgress.currentMajorLevel;
      const currentMinorLevel = currentProgress.currentMinorLevel;

      if (currentMajorLevel >= skillDef.maxMajorLevels) {
        const notification: GameNotification = { id: Date.now().toString(), message: `${skillDef.name} is already at max rank.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, notification] };
      }

      // Check if all minor levels in the current tier are completed (if not the first major level)
      if (currentMajorLevel > 0) {
        const minorLevelsInCurrentTier = skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] || 0;
        if (currentMinorLevel < minorLevelsInCurrentTier) {
          const notification: GameNotification = { id: Date.now().toString(), message: `Complete all minor levels in Rank ${currentMajorLevel} of ${skillDef.name} first.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
          return { ...state, notifications: [...state.notifications, notification] };
        }
      }

      const costSkillPoints = skillDef.costSharedSkillPointsPerMajorLevel[currentMajorLevel] || Infinity;
      if (state.playerSharedSkillPoints < costSkillPoints) {
        const notification: GameNotification = { id: Date.now().toString(), message: `Not enough Shared Skill Points for ${skillDef.name} Rank ${currentMajorLevel + 1}. Need ${costSkillPoints}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, notification] };
      }

      const newSharedSkillPoints = state.playerSharedSkillPoints - costSkillPoints;
      const newProgress: PlayerSharedSkillProgress = {
        currentMajorLevel: currentMajorLevel + 1,
        currentMinorLevel: 0, // Reset minor levels on major upgrade
      };

      const newPlayerSharedSkills = {
        ...state.playerSharedSkills,
        [skillId]: newProgress,
      };
      const successNotification: GameNotification = { id: Date.now().toString(), message: `${skillDef.name} upgraded to Rank ${newProgress.currentMajorLevel}!`, type: 'success', iconName: skillDef.iconName, timestamp: Date.now() };
      
      return {
        ...state,
        playerSharedSkillPoints: newSharedSkillPoints,
        playerSharedSkills: newPlayerSharedSkills,
        notifications: [...state.notifications, successNotification],
      };
    }
    case 'UPGRADE_SHARED_SKILL_MINOR': {
      const { skillId } = action.payload;
      const skillDef = SHARED_SKILL_DEFINITIONS[skillId];
      if (!skillDef) {
        console.warn(`Shared skill definition ${skillId} not found.`);
        return state;
      }

      const currentProgress = state.playerSharedSkills[skillId];
      if (!currentProgress || currentProgress.currentMajorLevel === 0) {
        const notification: GameNotification = { id: Date.now().toString(), message: `Unlock ${skillDef.name} Rank 1 first.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, notification] };
      }

      const currentMajorLevel = currentProgress.currentMajorLevel;
      const currentMinorLevel = currentProgress.currentMinorLevel;
      const minorLevelsInCurrentTier = skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] || 0;

      if (currentMinorLevel >= minorLevelsInCurrentTier) {
        const notification: GameNotification = { id: Date.now().toString(), message: `${skillDef.name} Rank ${currentMajorLevel} is maxed on minor levels. Upgrade Rank.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, notification] };
      }
      
      const costHeroicPoints = skillDef.costHeroXpPoolPerMinorLevel(currentMajorLevel, currentMinorLevel);
      if ((state.resources[ResourceType.HEROIC_POINTS] || 0) < costHeroicPoints) {
        const notification: GameNotification = { id: Date.now().toString(), message: `Not enough Heroic Points for ${skillDef.name}. Need ${formatNumber(costHeroicPoints)}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, notification] };
      }

      const newResources = { ...state.resources };
      newResources[ResourceType.HEROIC_POINTS] = (newResources[ResourceType.HEROIC_POINTS] || 0) - costHeroicPoints;

      const newProgress: PlayerSharedSkillProgress = {
        ...currentProgress,
        currentMinorLevel: currentMinorLevel + 1,
      };
      
      const newPlayerSharedSkills = {
        ...state.playerSharedSkills,
        [skillId]: newProgress,
      };

      const effect = skillDef.effects[0];
      const minorBonusValue = effect.minorValuePerMinorLevel[currentMajorLevel -1] || 0;
      const successNotification: GameNotification = { id: Date.now().toString(), message: `${skillDef.name} minor level up! (+${(minorBonusValue * (effect.isPercentage ? 100 : 1)).toFixed(1)}${effect.isPercentage ? '%' : ''})`, type: 'success', iconName: skillDef.iconName, timestamp: Date.now() };

      return {
        ...state,
        resources: newResources,
        playerSharedSkills: newPlayerSharedSkills,
        notifications: [...state.notifications, successNotification],
      };
    }
    default:
      return state;
  }
};