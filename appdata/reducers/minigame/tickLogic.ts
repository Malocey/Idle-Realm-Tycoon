
import { GameState, GameAction, StoneQuarryMinigameState, ResourceType, MinigameEventType, MinigameMoleState } from '../../types';
import {
    SQMG_GRID_SIZE,
    SQMG_EVENT_TRIGGER_CHANCE_PER_TICK,
    SQMG_EVENT_BASE_DURATION_TICKS,
    SQMG_CRYSTAL_SHOWER_BONUS_CHANCE,
    SQMG_ESSENCE_BOOM_BONUS_CHANCE,
    SQMG_MOLE_ATTACK_MIN_MOLES,
    SQMG_MOLE_ATTACK_MAX_MOLES,
    SQMG_MOLE_MOVE_COOLDOWN_MS,
    SQMG_MOLE_ACTION_COOLDOWN_MS,
    SQMG_MOLE_ATTACK_DURATION_TICKS,
    GAME_TICK_MS,
    SQMG_DIRT_TO_CLAY_CLICKS,
    SQMG_CLAY_TO_SAND_CLICKS,
    SQMG_CRYSTAL_DROP_CHANCE,
    SQMG_EMERALD_DROP_CHANCE_FROM_SAND,
    SQMG_RUBY_DROP_CHANCE_FROM_SAND,
    SQMG_SAPPHIRE_DROP_CHANCE_FROM_SAND,
    CLAY_GOLEM_CLICK_POWER_MULTIPLIER,
    SAND_GOLEM_CLICK_POWER_MULTIPLIER,
    CRYSTAL_GOLEM_CLICK_POWER_MULTIPLIER,
    CRYSTAL_GOLEM_RARE_FIND_BONUS_CHANCE,
} from '../../constants';
import { ICONS } from '../../components/Icons';
import { createPopupEvent } from './utils';

export const handleMinigameTick = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_TICK' }>
): GameState => {
  const minigameState = state.stoneQuarryMinigame;
  if (!minigameState || !minigameState.gridInitialized) return state;

  const newNotifications = [...state.notifications];
  // Ensure deep copy for mutable parts of minigameState
  const newMinigameState: StoneQuarryMinigameState = {
    ...minigameState,
    resources: { ...minigameState.resources },
    gridCells: minigameState.gridCells.map(row => row.map(cell => ({ ...cell }))),
    golems: minigameState.golems.map(golem => ({ ...golem })),
    moles: minigameState.moles.map(mole => ({ ...mole })),
    popupEvents: [], // Reset for this tick
  };

  const timeElapsedMs = GAME_TICK_MS / state.gameSpeed;

  // --- Event Logic ---
  if (newMinigameState.activeMinigameEvent) {
    newMinigameState.activeMinigameEvent.durationRemainingTicks -= 1;
    if (newMinigameState.activeMinigameEvent.durationRemainingTicks <= 0) {
      const endedEventType = newMinigameState.activeMinigameEvent.type;
      newNotifications.push({id: Date.now().toString() + `-eventEnd-${endedEventType}`, message: `Event Ended: ${endedEventType.replace(/_/g, ' ')}!`, type: 'info', iconName: ICONS.INFO ? 'INFO' : undefined, timestamp: Date.now()});
      if (endedEventType === MinigameEventType.MOLE_ATTACK) {
        newMinigameState.moles = [];
      }
      newMinigameState.activeMinigameEvent = null;
    }
  } else {
    if (Math.random() < SQMG_EVENT_TRIGGER_CHANCE_PER_TICK) {
      const possibleEvents: MinigameEventType[] = [MinigameEventType.CRYSTAL_SHOWER, MinigameEventType.ESSENCE_BOOM, MinigameEventType.MOLE_ATTACK];
      const eventType = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      let duration = SQMG_EVENT_BASE_DURATION_TICKS;
      if (eventType === MinigameEventType.MOLE_ATTACK) duration = SQMG_MOLE_ATTACK_DURATION_TICKS;
      newMinigameState.activeMinigameEvent = { type: eventType, durationRemainingTicks: duration };
      newNotifications.push({id: Date.now().toString() + `-eventStart-${eventType}`, message: `Event Started: ${eventType.replace(/_/g, ' ')}!`, type: 'success', iconName: ICONS.STAR_INDICATOR_ICON ? 'STAR_INDICATOR_ICON' : undefined, timestamp: Date.now()});
      if (eventType === MinigameEventType.MOLE_ATTACK) {
        const moleCount = SQMG_MOLE_ATTACK_MIN_MOLES + Math.floor(Math.random() * (SQMG_MOLE_ATTACK_MAX_MOLES - SQMG_MOLE_ATTACK_MIN_MOLES + 1));
        newMinigameState.moles = [];
        for (let i = 0; i < moleCount; i++) {
          newMinigameState.moles.push({
            id: `mole-${Date.now()}-${i}`, r: Math.floor(Math.random() * SQMG_GRID_SIZE), c: Math.floor(Math.random() * SQMG_GRID_SIZE),
            targetR: null, targetC: null, actionCooldownMs: SQMG_MOLE_ACTION_COOLDOWN_MS, moveCooldownMs: SQMG_MOLE_MOVE_COOLDOWN_MS,
          });
        }
      }
    }
  }

  // --- Mole Logic ---
  if (newMinigameState.activeMinigameEvent?.type === MinigameEventType.MOLE_ATTACK && newMinigameState.moles.length > 0) {
    newMinigameState.moles = newMinigameState.moles.map(mole => {
      let updatedMole = { ...mole };
      updatedMole.moveCooldownMs = Math.max(0, updatedMole.moveCooldownMs - timeElapsedMs);
      updatedMole.actionCooldownMs = Math.max(0, updatedMole.actionCooldownMs - timeElapsedMs);
      const currentCell = newMinigameState.gridCells[updatedMole.r][updatedMole.c];

      if (updatedMole.targetR === null || updatedMole.targetC === null || (updatedMole.targetR === mole.r && updatedMole.targetC === mole.c && updatedMole.actionCooldownMs <=0) ) {
        if (updatedMole.actionCooldownMs <= 0 && (currentCell.currentResource === ResourceType.MINIGAME_SAND || currentCell.currentResource === ResourceType.MINIGAME_CLAY)) {
          if (currentCell.currentResource === ResourceType.MINIGAME_SAND) {
            currentCell.currentResource = ResourceType.MINIGAME_CLAY;
            currentCell.clicksToNextResource = SQMG_CLAY_TO_SAND_CLICKS;
          } else if (currentCell.currentResource === ResourceType.MINIGAME_CLAY) {
            currentCell.currentResource = ResourceType.MINIGAME_DIRT;
            currentCell.clicksToNextResource = SQMG_DIRT_TO_CLAY_CLICKS;
          }
          currentCell.currentClicks = 0;
          newMinigameState.popupEvents.push(createPopupEvent(currentCell.currentResource, 0, currentCell.r, currentCell.c, false));
          updatedMole.actionCooldownMs = SQMG_MOLE_ACTION_COOLDOWN_MS;
        }
        const validTargetCells = newMinigameState.gridCells.flat().filter(cell => cell.currentResource === ResourceType.MINIGAME_SAND || cell.currentResource === ResourceType.MINIGAME_CLAY);
        if (validTargetCells.length > 0) {
          const target = validTargetCells[Math.floor(Math.random() * validTargetCells.length)];
          updatedMole.targetR = target.r; updatedMole.targetC = target.c;
        } else { updatedMole.targetR = null; updatedMole.targetC = null; }
      }

      if (updatedMole.moveCooldownMs <= 0 && updatedMole.targetR !== null && updatedMole.targetC !== null) {
        if (mole.r !== updatedMole.targetR || mole.c !== updatedMole.targetC) {
          updatedMole.r = Math.max(0, Math.min(SQMG_GRID_SIZE -1, updatedMole.r + Math.sign(updatedMole.targetR - updatedMole.r)));
          updatedMole.c = Math.max(0, Math.min(SQMG_GRID_SIZE -1, updatedMole.c + Math.sign(updatedMole.targetC - updatedMole.c)));
        }
        updatedMole.moveCooldownMs = SQMG_MOLE_MOVE_COOLDOWN_MS;
      }
      return updatedMole;
    });
  }

  // --- Golem Logic ---
  if (newMinigameState.golems.length > 0) {
    newMinigameState.lastGolemActionTimestamp = Date.now();
    newMinigameState.golems = newMinigameState.golems.map(golem => {
      let updatedGolem = { ...golem };
      const cell = newMinigameState.gridCells[golem.r][golem.c];
      updatedGolem.clickCooldownRemainingMs -= timeElapsedMs;

      if (updatedGolem.clickCooldownRemainingMs <= 0 && cell) {
        let effectiveClickPower = newMinigameState.golemBaseClickPower;
        let golemTypeMultiplier = 1;
        let golemRareFindBonus = 0;
        switch(golem.golemType) {
            case 'CLAY': golemTypeMultiplier = CLAY_GOLEM_CLICK_POWER_MULTIPLIER; break;
            case 'SAND': golemTypeMultiplier = SAND_GOLEM_CLICK_POWER_MULTIPLIER; break;
            case 'CRYSTAL': golemTypeMultiplier = CRYSTAL_GOLEM_CLICK_POWER_MULTIPLIER; golemRareFindBonus = CRYSTAL_GOLEM_RARE_FIND_BONUS_CHANCE; break;
        }
        effectiveClickPower *= golemTypeMultiplier;

        newMinigameState.resources[cell.currentResource] = (newMinigameState.resources[cell.currentResource] || 0) + effectiveClickPower;
        newMinigameState.popupEvents.push(createPopupEvent(cell.currentResource, effectiveClickPower, cell.r, cell.c, false));
        updatedGolem.lastClickTick = Date.now();

        if (cell.currentResource !== ResourceType.MINIGAME_SAND) cell.currentClicks += effectiveClickPower;

        let golemEssenceDropChance = newMinigameState.essenceDropChance + (newMinigameState.golemEssenceAffinity * golemTypeMultiplier) + golemRareFindBonus;
        if (newMinigameState.activeMinigameEvent?.type === MinigameEventType.ESSENCE_BOOM) golemEssenceDropChance += SQMG_ESSENCE_BOOM_BONUS_CHANCE;
        if ((cell.currentResource === ResourceType.MINIGAME_CLAY || cell.currentResource === ResourceType.MINIGAME_SAND) && Math.random() < golemEssenceDropChance) {
          newMinigameState.resources[ResourceType.MINIGAME_ESSENCE]++;
          newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_ESSENCE, 1, cell.r, cell.c, false));
        }

        let golemGenericCrystalDropChance = (newMinigameState.golemCrystalSifters * golemTypeMultiplier) + golemRareFindBonus;
        if (newMinigameState.activeMinigameEvent?.type === MinigameEventType.CRYSTAL_SHOWER) golemGenericCrystalDropChance += SQMG_CRYSTAL_SHOWER_BONUS_CHANCE;
        else if (cell.currentResource === ResourceType.MINIGAME_SAND) golemGenericCrystalDropChance += SQMG_CRYSTAL_DROP_CHANCE;
        if ((cell.currentResource === ResourceType.MINIGAME_SAND || (newMinigameState.activeMinigameEvent?.type === MinigameEventType.CRYSTAL_SHOWER && cell.currentResource !== ResourceType.MINIGAME_DIRT)) && Math.random() < golemGenericCrystalDropChance) {
          newMinigameState.resources[ResourceType.MINIGAME_CRYSTAL]++;
          newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_CRYSTAL, 1, cell.r, cell.c, false));
        }

        if (cell.currentResource === ResourceType.MINIGAME_SAND) {
          if (Math.random() < SQMG_EMERALD_DROP_CHANCE_FROM_SAND + golemRareFindBonus) {
            newMinigameState.resources[ResourceType.MINIGAME_EMERALD]++;
            newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_EMERALD, 1, cell.r, cell.c, false));
          }
          if (Math.random() < SQMG_RUBY_DROP_CHANCE_FROM_SAND + golemRareFindBonus) {
            newMinigameState.resources[ResourceType.MINIGAME_RUBY]++;
            newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_RUBY, 1, cell.r, cell.c, false));
          }
          if (Math.random() < SQMG_SAPPHIRE_DROP_CHANCE_FROM_SAND + golemRareFindBonus) {
            newMinigameState.resources[ResourceType.MINIGAME_SAPPHIRE]++;
            newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_SAPPHIRE, 1, cell.r, cell.c, false));
          }
        }

        if (cell.currentResource !== ResourceType.MINIGAME_SAND && cell.currentClicks >= cell.clicksToNextResource) {
          if (cell.currentResource === ResourceType.MINIGAME_DIRT) {
            cell.currentResource = ResourceType.MINIGAME_CLAY; cell.clicksToNextResource = SQMG_CLAY_TO_SAND_CLICKS;
          } else if (cell.currentResource === ResourceType.MINIGAME_CLAY) {
            cell.currentResource = ResourceType.MINIGAME_SAND; cell.clicksToNextResource = Infinity;
          }
          cell.currentClicks = 0;
        }
        updatedGolem.clickCooldownRemainingMs = newMinigameState.golemBaseClickSpeedMs;
      }

      updatedGolem.moveCooldownRemainingMs -= timeElapsedMs;
      if (updatedGolem.moveCooldownRemainingMs <= 0) {
        const validMoves: {r: number, c: number}[] = [];
        const directions = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
        for(const [dr, dc] of directions) {
          const newR = golem.r + dr; const newC = golem.c + dc;
          if(newR >= 0 && newR < SQMG_GRID_SIZE && newC >= 0 && newC < SQMG_GRID_SIZE) validMoves.push({r: newR, c: newC});
        }
        if (validMoves.length > 0) {
          const {r: newR, c: newC} = validMoves[Math.floor(Math.random() * validMoves.length)];
          updatedGolem.r = newR; updatedGolem.c = newC;
        }
        updatedGolem.moveCooldownRemainingMs = newMinigameState.golemBaseMoveSpeedMs;
      }
      return updatedGolem;
    });
  }

  return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};
