
import { GameState, GameAction, StoneQuarryMinigameState, ResourceType, GameNotification } from '../../types';
import {
    SQMG_GRID_SIZE,
    SQMG_DIRT_CLICK_YIELD,
    SQMG_INITIAL_GOLEM_CLICK_POWER,
    SQMG_INITIAL_GOLEM_CLICK_SPEED_MS,
    SQMG_INITIAL_GOLEM_MOVE_SPEED_MS,
    SQMG_ESSENCE_DROP_CHANCE,
    SQMG_PLAYER_MULTI_CLICK_CHANCE_BASE,
    SQMG_GOLEM_ESSENCE_AFFINITY_BASE,
    SQMG_PLAYER_CRYSTAL_FIND_CHANCE_BASE,
    SQMG_GOLEM_CRYSTAL_SIFTERS_BASE,
    SQMG_PLAYER_ADVANCED_EXCAVATION_BASE_CHANCE,
    NOTIFICATION_ICONS
} from '../../constants';
import { initializeGridCells } from './utils';
import { ICONS } from '../../components/Icons'; // For notification icon

export const handleMinigameInit = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_INIT' }>
): GameState => {
  let newMinigameState = state.stoneQuarryMinigame;
  let newNotifications = [...state.notifications];

  if (!newMinigameState || !newMinigameState.gridInitialized) {
    newMinigameState = {
      gridInitialized: true,
      gridCells: initializeGridCells(),
      resources: {
        [ResourceType.MINIGAME_DIRT]: 0,
        [ResourceType.MINIGAME_CLAY]: 0,
        [ResourceType.MINIGAME_SAND]: 0,
        [ResourceType.MINIGAME_ESSENCE]: 0,
        [ResourceType.MINIGAME_CRYSTAL]: 0,
        [ResourceType.MINIGAME_EMERALD]: 0,
        [ResourceType.MINIGAME_RUBY]: 0,
        [ResourceType.MINIGAME_SAPPHIRE]: 0,
      },
      golems: [],
      moles: [],
      playerClickPower: SQMG_DIRT_CLICK_YIELD,
      lastGolemActionTimestamp: Date.now(),
      golemBaseClickPower: SQMG_INITIAL_GOLEM_CLICK_POWER,
      golemBaseClickSpeedMs: SQMG_INITIAL_GOLEM_CLICK_SPEED_MS,
      golemBaseMoveSpeedMs: SQMG_INITIAL_GOLEM_MOVE_SPEED_MS,
      golemClickPowerUpgradeLevel: 0,
      golemClickSpeedUpgradeLevel: 0,
      golemMoveSpeedUpgradeLevel: 0,
      essenceDropChance: SQMG_ESSENCE_DROP_CHANCE,
      essenceDropChanceUpgradeLevel: 0,
      playerMultiClickChance: SQMG_PLAYER_MULTI_CLICK_CHANCE_BASE,
      playerMultiClickChanceUpgradeLevel: 0,
      golemEssenceAffinity: SQMG_GOLEM_ESSENCE_AFFINITY_BASE,
      golemEssenceAffinityUpgradeLevel: 0,
      playerCrystalFindChance: SQMG_PLAYER_CRYSTAL_FIND_CHANCE_BASE,
      playerCrystalFindChanceUpgradeLevel: 0,
      golemCrystalSifters: SQMG_GOLEM_CRYSTAL_SIFTERS_BASE,
      golemCrystalSiftersUpgradeLevel: 0,
      playerAdvancedExcavationChance: SQMG_PLAYER_ADVANCED_EXCAVATION_BASE_CHANCE,
      playerAdvancedExcavationUpgradeLevel: 0,
      emeraldExpertiseChance: 0,
      emeraldExpertiseUpgradeLevel: 0,
      rubyRefinementChance: 0,
      rubyRefinementUpgradeLevel: 0,
      sapphireSynthesisChance: 0,
      sapphireSynthesisUpgradeLevel: 0,
      golemSynchronizationLevel: 0,
      activeMinigameEvent: null,
      popupEvents: [],
      dirtGolemsCraftedCount: 0,
    };
    newNotifications.push({
        id: Date.now().toString() + "-minigameInit",
        message: "Stone Quarry Excavation site initialized!",
        type: 'info',
        iconName: ICONS.SHOVEL_ICON ? 'SHOVEL_ICON' : undefined,
        timestamp: Date.now()
    });
  }
  return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};
