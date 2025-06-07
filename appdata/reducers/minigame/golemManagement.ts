
import { GameState, GameAction, StoneQuarryMinigameState, ResourceType, MinigameGolemState, GameNotification } from '../../types';
import {
    SQMG_GOLEM_COST_DIRT,
    SQMG_GOLEM_COST_ESSENCE,
    SQMG_CLAY_GOLEM_COST_CLAY,
    SQMG_SAND_GOLEM_COST_SAND,
    SQMG_SAND_GOLEM_COST_ESSENCE,
    SQMG_CRYSTAL_GOLEM_COST_EMERALD,
    SQMG_CRYSTAL_GOLEM_COST_RUBY,
    SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE,
    SQMG_CRYSTAL_GOLEM_COST_ESSENCE,
    SQMG_INITIAL_GOLEM_CLICK_POWER,
    SQMG_INITIAL_GOLEM_CLICK_SPEED_MS,
    SQMG_INITIAL_GOLEM_MOVE_SPEED_MS,
    SQMG_GRID_SIZE,
    NOTIFICATION_ICONS
} from '../../constants';
import { formatNumber } from '../../utils';
import { ICONS } from '../../components/Icons';

export const handleMinigameCraftDirtGolem = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM' }>
): GameState => {
  const minigameState = state.stoneQuarryMinigame;
  if (!minigameState) return state;

  const newNotifications = [...state.notifications];
  const newMinigameState = { ...minigameState, resources: { ...minigameState.resources }, golems: [...minigameState.golems] };
  const currentDirtGolemCost = SQMG_GOLEM_COST_DIRT + (newMinigameState.dirtGolemsCraftedCount * 50);

  if (newMinigameState.resources[ResourceType.MINIGAME_DIRT] >= currentDirtGolemCost &&
      newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] >= SQMG_GOLEM_COST_ESSENCE) {

      newMinigameState.resources[ResourceType.MINIGAME_DIRT] -= currentDirtGolemCost;
      newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] -= SQMG_GOLEM_COST_ESSENCE;
      newMinigameState.dirtGolemsCraftedCount++;

      const newGolem: MinigameGolemState = {
          id: `golem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          r: Math.floor(Math.random() * SQMG_GRID_SIZE),
          c: Math.floor(Math.random() * SQMG_GRID_SIZE),
          golemType: 'DIRT',
          clickCooldownRemainingMs: newMinigameState.golemBaseClickSpeedMs,
          moveCooldownRemainingMs: newMinigameState.golemBaseMoveSpeedMs,
          clickPower: newMinigameState.golemBaseClickPower,
          lastClickTick: 0,
      };
      newMinigameState.golems.push(newGolem);
      newNotifications.push({id: Date.now().toString() + "-golemCrafted", message: `A Dirt Golem has been animated!`, type: 'success', iconName: ICONS.MINIGAME_GOLEM ? 'MINIGAME_GOLEM' : undefined, timestamp: Date.now()});
  } else {
      newNotifications.push({id: Date.now().toString() + "-golemCraftFail", message: `Not enough resources to craft a Dirt Golem. Needs ${formatNumber(currentDirtGolemCost)} Dirt & ${formatNumber(SQMG_GOLEM_COST_ESSENCE)} Essence.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
  }
  return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};

export const handleMinigameCraftClayGolem = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM' }>
): GameState => {
  const minigameState = state.stoneQuarryMinigame;
  if (!minigameState) return state;

  const newNotifications = [...state.notifications];
  const newMinigameState = { ...minigameState, resources: { ...minigameState.resources }, golems: [...minigameState.golems] };
  const dirtGolems = newMinigameState.golems.filter(g => g.golemType === 'DIRT');

  if (dirtGolems.length > 0 && newMinigameState.resources[ResourceType.MINIGAME_CLAY] >= SQMG_CLAY_GOLEM_COST_CLAY) {
      newMinigameState.resources[ResourceType.MINIGAME_CLAY] -= SQMG_CLAY_GOLEM_COST_CLAY;
      const dirtGolemToConsumeIndex = newMinigameState.golems.findIndex(g => g.id === dirtGolems[0].id);
      const consumedDirtGolem = newMinigameState.golems.splice(dirtGolemToConsumeIndex, 1)[0];
      const newClayGolem: MinigameGolemState = {
          ...consumedDirtGolem,
          id: `clay-golem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          golemType: 'CLAY',
          clickPower: newMinigameState.golemBaseClickPower,
          clickCooldownRemainingMs: newMinigameState.golemBaseClickSpeedMs,
          moveCooldownRemainingMs: newMinigameState.golemBaseMoveSpeedMs,
          lastClickTick: 0,
      };
      newMinigameState.golems.push(newClayGolem);
      newNotifications.push({id: Date.now().toString() + "-clayGolemCrafted", message: `A Dirt Golem has been transformed into a Clay Golem!`, type: 'success', iconName: ICONS.MINIGAME_GOLEM ? 'MINIGAME_GOLEM' : undefined, timestamp: Date.now()});
  } else if (dirtGolems.length === 0) {
      newNotifications.push({id: Date.now().toString() + "-clayGolemFailNoDirt", message: `No Dirt Golem available to transform.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
  } else {
      newNotifications.push({id: Date.now().toString() + "-clayGolemFailNoClay", message: `Not enough Clay to craft a Clay Golem. Needs ${SQMG_CLAY_GOLEM_COST_CLAY} Clay.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
  }
  return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};

export const handleMinigameCraftSandGolem = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM' }>
): GameState => {
    const minigameState = state.stoneQuarryMinigame;
    if (!minigameState) return state;

    const newNotifications = [...state.notifications];
    const newMinigameState = { ...minigameState, resources: { ...minigameState.resources }, golems: [...minigameState.golems] };
    const clayGolems = newMinigameState.golems.filter(g => g.golemType === 'CLAY');

    if (clayGolems.length > 0 &&
        newMinigameState.resources[ResourceType.MINIGAME_SAND] >= SQMG_SAND_GOLEM_COST_SAND &&
        newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] >= SQMG_SAND_GOLEM_COST_ESSENCE) {
        newMinigameState.resources[ResourceType.MINIGAME_SAND] -= SQMG_SAND_GOLEM_COST_SAND;
        newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] -= SQMG_SAND_GOLEM_COST_ESSENCE;
        const clayGolemToConsumeIndex = newMinigameState.golems.findIndex(g => g.id === clayGolems[0].id);
        const consumedClayGolem = newMinigameState.golems.splice(clayGolemToConsumeIndex, 1)[0];
        const newSandGolem: MinigameGolemState = {
            ...consumedClayGolem,
            id: `sand-golem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            golemType: 'SAND',
            clickPower: newMinigameState.golemBaseClickPower,
            clickCooldownRemainingMs: newMinigameState.golemBaseClickSpeedMs,
            moveCooldownRemainingMs: newMinigameState.golemBaseMoveSpeedMs,
            lastClickTick: 0,
        };
        newMinigameState.golems.push(newSandGolem);
        newNotifications.push({id: Date.now().toString() + "-sandGolemCrafted", message: `A Clay Golem has been transformed into a Sand Golem!`, type: 'success', iconName: ICONS.MINIGAME_GOLEM ? 'MINIGAME_GOLEM' : undefined, timestamp: Date.now()});
    } else if (clayGolems.length === 0) {
        newNotifications.push({id: Date.now().toString() + "-sandGolemFailNoClay", message: `No Clay Golem available to transform.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
    } else {
        let missingRes = [];
        if (newMinigameState.resources[ResourceType.MINIGAME_SAND] < SQMG_SAND_GOLEM_COST_SAND) missingRes.push("Sand");
        if (newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] < SQMG_SAND_GOLEM_COST_ESSENCE) missingRes.push("Essence");
        newNotifications.push({id: Date.now().toString() + "-sandGolemFailNoRes", message: `Not enough resources. Missing: ${missingRes.join(', ')}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
    }
    return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};

export const handleMinigameCraftCrystalGolem = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM' }>
): GameState => {
    const minigameState = state.stoneQuarryMinigame;
    if (!minigameState) return state;

    const newNotifications = [...state.notifications];
    const newMinigameState = { ...minigameState, resources: { ...minigameState.resources }, golems: [...minigameState.golems] };
    const sandGolems = newMinigameState.golems.filter(g => g.golemType === 'SAND');

    if (sandGolems.length > 0 &&
        newMinigameState.resources[ResourceType.MINIGAME_EMERALD] >= SQMG_CRYSTAL_GOLEM_COST_EMERALD &&
        newMinigameState.resources[ResourceType.MINIGAME_RUBY] >= SQMG_CRYSTAL_GOLEM_COST_RUBY &&
        newMinigameState.resources[ResourceType.MINIGAME_SAPPHIRE] >= SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE &&
        newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] >= SQMG_CRYSTAL_GOLEM_COST_ESSENCE) {
        newMinigameState.resources[ResourceType.MINIGAME_EMERALD] -= SQMG_CRYSTAL_GOLEM_COST_EMERALD;
        newMinigameState.resources[ResourceType.MINIGAME_RUBY] -= SQMG_CRYSTAL_GOLEM_COST_RUBY;
        newMinigameState.resources[ResourceType.MINIGAME_SAPPHIRE] -= SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE;
        newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] -= SQMG_CRYSTAL_GOLEM_COST_ESSENCE;
        const sandGolemToConsumeIndex = newMinigameState.golems.findIndex(g => g.id === sandGolems[0].id);
        const consumedSandGolem = newMinigameState.golems.splice(sandGolemToConsumeIndex, 1)[0];
        const newCrystalGolem: MinigameGolemState = {
            ...consumedSandGolem,
            id: `crystal-golem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            golemType: 'CRYSTAL',
            clickPower: newMinigameState.golemBaseClickPower,
            clickCooldownRemainingMs: newMinigameState.golemBaseClickSpeedMs,
            moveCooldownRemainingMs: newMinigameState.golemBaseMoveSpeedMs,
            lastClickTick: 0,
        };
        newMinigameState.golems.push(newCrystalGolem);
        newNotifications.push({id: Date.now().toString() + "-crystalGolemCrafted", message: `A Sand Golem has been infused into a Crystal Golem!`, type: 'success', iconName: ICONS.MINIGAME_GOLEM ? 'MINIGAME_GOLEM' : undefined, timestamp: Date.now()});
    } else if (sandGolems.length === 0) {
         newNotifications.push({id: Date.now().toString() + "-crystalGolemFailNoSand", message: `No Sand Golem available to transform.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
    } else {
        let missingRes = [];
        if (newMinigameState.resources[ResourceType.MINIGAME_EMERALD] < SQMG_CRYSTAL_GOLEM_COST_EMERALD) missingRes.push("Emeralds");
        if (newMinigameState.resources[ResourceType.MINIGAME_RUBY] < SQMG_CRYSTAL_GOLEM_COST_RUBY) missingRes.push("Rubies");
        if (newMinigameState.resources[ResourceType.MINIGAME_SAPPHIRE] < SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE) missingRes.push("Sapphires");
        if (newMinigameState.resources[ResourceType.MINIGAME_ESSENCE] < SQMG_CRYSTAL_GOLEM_COST_ESSENCE) missingRes.push("Essence");
         newNotifications.push({id: Date.now().toString() + "-crystalGolemFailNoRes", message: `Not enough resources. Missing: ${missingRes.join(', ')}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
    }
    return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};

export const handleMinigameUpgradeGolem = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_UPGRADE_GOLEM' }>
): GameState => {
  const minigameState = state.stoneQuarryMinigame;
  if (!minigameState) return state;

  const newNotifications: GameNotification[] = [...state.notifications, {id: Date.now().toString() + "-specificGolemUpgradeFuture", message: `Specific Golem upgrades are handled globally.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()}];
  return { ...state, notifications: newNotifications };
};
