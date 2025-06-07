
import { GameState, GameAction, GlobalBonuses, StoneQuarryMinigameState, ResourceType, MinigameUpgradeType, GameNotification } from '../types';
import { NOTIFICATION_ICONS } from '../constants';
import { ICONS } from '../components/Icons';
import { handleMinigameInit } from './minigame/initialization';
import { handleMinigameCellClick, handleMinigamePurchaseUpgrade } from './minigame/playerActions';
import { handleMinigameCraftDirtGolem, handleMinigameCraftClayGolem, handleMinigameCraftSandGolem, handleMinigameCraftCrystalGolem, handleMinigameUpgradeGolem } from './minigame/golemManagement';
import { handleMinigameTick } from './minigame/tickLogic';

export const stoneQuarryMinigameReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_INIT' | 'STONE_QUARRY_MINIGAME_CLICK_CELL' | 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE' | 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM' | 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM' | 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM' | 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM' | 'STONE_QUARRY_MINIGAME_UPGRADE_GOLEM' | 'STONE_QUARRY_MINIGAME_TICK' }>,
  globalBonuses?: GlobalBonuses // globalBonuses might not be used by all sub-reducers but passed for consistency
): GameState => {
  // Initialize popupEvents array for actions that might generate them.
  // This ensures it's reset for each relevant action dispatch.
  let minigameStateWithResetPopups: StoneQuarryMinigameState | null = null;
  if (state.stoneQuarryMinigame && (action.type === 'STONE_QUARRY_MINIGAME_CLICK_CELL' || action.type === 'STONE_QUARRY_MINIGAME_TICK')) {
    minigameStateWithResetPopups = {
      ...state.stoneQuarryMinigame,
      resources: { ...state.stoneQuarryMinigame.resources },
      gridCells: state.stoneQuarryMinigame.gridCells.map(row => row.map(cell => ({ ...cell }))),
      golems: state.stoneQuarryMinigame.golems.map(golem => ({ ...golem })),
      moles: state.stoneQuarryMinigame.moles.map(mole => ({ ...mole })),
      popupEvents: [], // Reset here
    };
  }

  const currentStateWithPopupsResetIfNeeded = minigameStateWithResetPopups ? { ...state, stoneQuarryMinigame: minigameStateWithResetPopups } : state;


  switch (action.type) {
    case 'STONE_QUARRY_MINIGAME_INIT':
      return handleMinigameInit(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_CLICK_CELL':
      return handleMinigameCellClick(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE':
      return handleMinigamePurchaseUpgrade(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM':
      return handleMinigameCraftDirtGolem(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM':
      return handleMinigameCraftClayGolem(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM':
      return handleMinigameCraftSandGolem(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM':
      return handleMinigameCraftCrystalGolem(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_UPGRADE_GOLEM':
      return handleMinigameUpgradeGolem(currentStateWithPopupsResetIfNeeded, action);
    case 'STONE_QUARRY_MINIGAME_TICK':
      return handleMinigameTick(currentStateWithPopupsResetIfNeeded, action);
    default:
      return state;
  }
};
