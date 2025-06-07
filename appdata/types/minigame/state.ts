import { ResourceType, MinigameEventType } from '../enums';
import { MinigameGridCellState } from './grid';
import { MinigameGolemState, MinigameMoleState } from './participants';
import { MinigameResourcePopupEvent } from './events';

export interface StoneQuarryMinigameState {
  gridInitialized: boolean;
  gridCells: MinigameGridCellState[][];
  resources: {
    [ResourceType.MINIGAME_DIRT]: number;
    [ResourceType.MINIGAME_CLAY]: number;
    [ResourceType.MINIGAME_SAND]: number;
    [ResourceType.MINIGAME_ESSENCE]: number;
    [ResourceType.MINIGAME_CRYSTAL]: number; // Generic crystal
    [ResourceType.MINIGAME_EMERALD]: number;
    [ResourceType.MINIGAME_RUBY]: number;
    [ResourceType.MINIGAME_SAPPHIRE]: number;
  };
  golems: MinigameGolemState[];
  moles: MinigameMoleState[];
  playerClickPower: number;
  lastGolemActionTimestamp: number;
  golemBaseClickPower: number;
  golemBaseClickSpeedMs: number;
  golemBaseMoveSpeedMs: number;
  golemClickPowerUpgradeLevel: number;
  golemClickSpeedUpgradeLevel: number;
  golemMoveSpeedUpgradeLevel: number;
  essenceDropChance: number;
  essenceDropChanceUpgradeLevel: number;
  playerMultiClickChance: number;
  playerMultiClickChanceUpgradeLevel: number;
  golemEssenceAffinity: number;
  golemEssenceAffinityUpgradeLevel: number;
  playerCrystalFindChance: number;
  playerCrystalFindChanceUpgradeLevel: number;
  golemCrystalSifters: number;
  golemCrystalSiftersUpgradeLevel: number;
  playerAdvancedExcavationChance: number;
  playerAdvancedExcavationUpgradeLevel: number;
  emeraldExpertiseChance: number;
  emeraldExpertiseUpgradeLevel: number;
  rubyRefinementChance: number;
  rubyRefinementUpgradeLevel: number;
  sapphireSynthesisChance: number;
  sapphireSynthesisUpgradeLevel: number;
  golemSynchronizationLevel: number;
  activeMinigameEvent: { type: MinigameEventType; durationRemainingTicks: number; } | null;
  popupEvents: MinigameResourcePopupEvent[];
  dirtGolemsCraftedCount: number;
}