
import { GameState, GameAction, GlobalBonuses, GoldMineMinigameState, ResourceType, GoldMinePopupEvent, GoldMinePlayerStats, GameNotification } from '../../../types';
import {
  BASE_GOLD_MINE_GRID_ROWS,
  BASE_GOLD_MINE_GRID_COLS,
  STAMINA_COST_PER_MOVE,
  STAMINA_COST_PER_MINE_ACTION,
  INITIAL_GOLD_MINE_PLAYER_STATS, 
  RESOURCE_COLORS,
  GAME_TICK_MS,
  MAX_GOLD_MINE_DEPTH,
  ROW_INCREASE_PER_DEPTH,
  COL_INCREASE_PER_DEPTH,
} from '../../../constants'; 
import { GOLD_MINE_UPGRADE_DEFINITIONS } from '../../../gameData';
import { ICONS } from '../../../components/Icons';
import { generateGoldMineGrid, revealCellsAroundPlayer } from './gridLogic';
import { formatNumber, calculateGoldMinePlayerStats } from '../../../utils';


const createGoldMinePopupEvent = (
  text: string,
  r: number,
  c: number,
  color: string = 'white'
): GoldMinePopupEvent => {
  return {
    id: `gm-popup-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    r,
    c,
    color,
    timestamp: Date.now(),
  };
};

export const goldMineMinigameReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'GOLD_MINE_MINIGAME_INIT' | 'GOLD_MINE_MINIGAME_START_RUN' | 'GOLD_MINE_MINIGAME_MINE_CELL' | 'GOLD_MINE_MINIGAME_MOVE_PLAYER' | 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE' | 'GOLD_MINE_MINIGAME_PURCHASE_UPGRADE' | 'GOLD_MINE_MINIGAME_TICK' }>,
  globalBonuses?: GlobalBonuses 
): GameState => {
  switch (action.type) {
    case 'GOLD_MINE_MINIGAME_INIT': {
      if (state.goldMineMinigame === null || action.payload?.depth) {
        const depth = action.payload?.depth || 1;
        const initialPermanentUpgrades = state.goldMineMinigame?.permanentUpgradeLevels || {};
        const initialPlayerStats = calculateGoldMinePlayerStats(INITIAL_GOLD_MINE_PLAYER_STATS, initialPermanentUpgrades);
        const initialGridRows = BASE_GOLD_MINE_GRID_ROWS + (depth - 1) * ROW_INCREASE_PER_DEPTH;
        const initialGridCols = BASE_GOLD_MINE_GRID_COLS + (depth - 1) * COL_INCREASE_PER_DEPTH;
        return {
          ...state,
          goldMineMinigame: {
            status: 'IDLE_AT_SURFACE',
            grid: [],
            gridRows: initialGridRows,
            gridCols: initialGridCols,
            playerGridPos: { r: 0, c: 0 },
            currentStamina: initialPlayerStats.maxStamina,
            playerStats: initialPlayerStats,
            currentDepth: depth,
            maxUnlockedDepth: state.goldMineMinigame?.maxUnlockedDepth || 1,
            resourcesCollectedThisRun: {},
            permanentUpgradeLevels: initialPermanentUpgrades,
            popupEvents: [],
            runStartTime: null,
            totalTimeInMineSeconds: 0,
          }
        };
      }
      return state;
    }
    case 'GOLD_MINE_MINIGAME_START_RUN': {
      if (!state.goldMineMinigame || state.goldMineMinigame.status !== 'IDLE_AT_SURFACE') return state;
      
      const selectedDepth = action.payload?.depth || state.goldMineMinigame.currentDepth || 1;
      if (selectedDepth > state.goldMineMinigame.maxUnlockedDepth) {
        // Should ideally be prevented by UI, but double check here
        return {
          ...state,
          notifications: [...state.notifications, {id: Date.now().toString(), message: `Depth ${selectedDepth} is not yet unlocked.`, type: 'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp: Date.now()}]
        };
      }
      
      const actualRows = BASE_GOLD_MINE_GRID_ROWS + (selectedDepth - 1) * ROW_INCREASE_PER_DEPTH;
      const actualCols = BASE_GOLD_MINE_GRID_COLS + (selectedDepth - 1) * COL_INCREASE_PER_DEPTH;
      const newGrid = generateGoldMineGrid(actualRows, actualCols, selectedDepth);
      
      let startPos = { r: 0, c: 0 };
      for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
              if (newGrid[r][c].type === 'EXIT_SHAFT') {
                  startPos = { r, c };
                  break;
              }
          }
      }
      
      const currentPlayerStats = state.goldMineMinigame.playerStats; 
      const { newGrid: revealedGrid } = revealCellsAroundPlayer(newGrid, startPos, currentPlayerStats.fogOfWarRadius);

      const startRunNotification: GameNotification = {
        id: Date.now().toString(), 
        message: `Descending into the mine (Depth ${selectedDepth}).`, 
        type: 'info', 
        iconName: ICONS.PICKAXE_ICON ? 'PICKAXE_ICON' : undefined, 
        timestamp: Date.now()
      };

      return {
        ...state,
        goldMineMinigame: {
          ...state.goldMineMinigame,
          status: 'MINING_IN_PROGRESS',
          grid: revealedGrid,
          gridRows: actualRows, // Update grid dimensions in state
          gridCols: actualCols,
          playerGridPos: startPos,
          currentStamina: currentPlayerStats.maxStamina, 
          playerStats: currentPlayerStats, 
          resourcesCollectedThisRun: {},
          runStartTime: Date.now(),
          totalTimeInMineSeconds: 0,
          currentDepth: selectedDepth, // Set the current depth for the run
          popupEvents: [],
          mineshaftExitPos: startPos,
        },
        notifications: [...state.notifications, startRunNotification]
      };
    }
     case 'GOLD_MINE_MINIGAME_MINE_CELL':
     case 'GOLD_MINE_MINIGAME_MOVE_PLAYER': { 
      if (!state.goldMineMinigame || state.goldMineMinigame.status !== 'MINING_IN_PROGRESS') return state;
      
      const { dr, dc } = action.payload;
      const { grid, playerGridPos, currentStamina, playerStats, resourcesCollectedThisRun, gridRows, gridCols } = state.goldMineMinigame;
      const newNotifications: GameNotification[] = []; 
      let newPopupEvents: GoldMinePopupEvent[] = [];

      const targetR = playerGridPos.r + dr;
      const targetC = playerGridPos.c + dc;

      if (targetR < 0 || targetR >= gridRows || targetC < 0 || targetC >= gridCols) {
        return state; 
      }

      const targetCell = grid[targetR][targetC];
      let newPlayerGridPos = { ...playerGridPos };
      let newCurrentStamina = currentStamina;
      let newGrid = grid.map(row => row.map(cell => ({ ...cell })));
      let newResourcesCollected = { ...resourcesCollectedThisRun };
      let newStatus: GoldMineMinigameState['status'] = state.goldMineMinigame.status;

      if (targetCell.type === ResourceType.OBSTACLE) {
        newPopupEvents.push(createGoldMinePopupEvent("Blocked!", targetR, targetC, RESOURCE_COLORS.STONE));
      } else if (targetCell.type === ResourceType.EMPTY || targetCell.type === 'EXIT_SHAFT') {
        if (newCurrentStamina < STAMINA_COST_PER_MOVE) {
          newNotifications.push({ id: Date.now().toString(), message: "Not enough stamina to move.", type: 'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp: Date.now() });
        } else {
          newCurrentStamina -= STAMINA_COST_PER_MOVE;
          newPlayerGridPos = { r: targetR, c: targetC };
          if (targetCell.type === 'EXIT_SHAFT') {
             return goldMineMinigameReducer(state, {type: 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE'}, globalBonuses);
          }
        }
      } else { 
        if (newCurrentStamina < STAMINA_COST_PER_MINE_ACTION) {
          newNotifications.push({ id: Date.now().toString(), message: "Not enough stamina to mine.", type: 'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp: Date.now() });
        } else {
          newCurrentStamina -= STAMINA_COST_PER_MINE_ACTION;
          const cellToUpdate = { ...newGrid[targetR][targetC] };
          cellToUpdate.currentHp -= playerStats.miningSpeed; 
          newPopupEvents.push(createGoldMinePopupEvent(`-${playerStats.miningSpeed} HP`, targetR, targetC, RESOURCE_COLORS.STONE));

          if (cellToUpdate.currentHp <= 0) {
            const resourceType = cellToUpdate.type as ResourceType.DIRT | ResourceType.STONE | ResourceType.GOLD_ORE | ResourceType.DIAMOND_ORE;
            let amount = 1; 
            if (resourceType === ResourceType.GOLD_ORE) amount = Math.floor(Math.random() * 3) + 1; 
            if (resourceType === ResourceType.DIAMOND_ORE) amount = 1; 

            newResourcesCollected[resourceType] = (newResourcesCollected[resourceType] || 0) + amount;
            newPopupEvents.push(createGoldMinePopupEvent(`+${amount} ${resourceType.replace('MINIGAME_','').replace(/_/g, ' ')}`, targetR, targetC, RESOURCE_COLORS[resourceType]));
            
            cellToUpdate.type = ResourceType.EMPTY;
            cellToUpdate.hardness = 0;
            cellToUpdate.currentHp = 0;
            newPlayerGridPos = { r: targetR, c: targetC }; 
          }
          newGrid[targetR][targetC] = cellToUpdate;
        }
      }
      
      if (newCurrentStamina <= 0 && newStatus === 'MINING_IN_PROGRESS') {
        newStatus = 'FATIGUED_RETURN_TO_SURFACE';
        newNotifications.push({ id: Date.now().toString(), message: "Exhausted! Returning to surface.", type: 'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp: Date.now() });
      }
      
      const { newGrid: revealedGridAfterMove } = revealCellsAroundPlayer(newGrid, newPlayerGridPos, playerStats.fogOfWarRadius);

      return {
        ...state,
        goldMineMinigame: {
          ...state.goldMineMinigame,
          playerGridPos: newPlayerGridPos,
          currentStamina: newCurrentStamina,
          grid: revealedGridAfterMove,
          resourcesCollectedThisRun: newResourcesCollected,
          popupEvents: newPopupEvents, 
          status: newStatus,
        },
        notifications: [...state.notifications, ...newNotifications],
      };
    }
    case 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE': {
      if (!state.goldMineMinigame) return state;

      const { resourcesCollectedThisRun, status: currentStatusBeforeReturn, currentDepth, maxUnlockedDepth } = state.goldMineMinigame;
      let finalResources = { ...state.resources };
      let lootSummary: string[] = [];
      let newMaxUnlockedDepth = maxUnlockedDepth;
      const notifications = [...state.notifications];

      Object.entries(resourcesCollectedThisRun).forEach(([resource, amount]) => {
        if (amount > 0) {
          finalResources[resource as ResourceType] = (finalResources[resource as ResourceType] || 0) + amount;
          lootSummary.push(`${formatNumber(amount)} ${resource.replace('MINIGAME_','').replace(/_/g, ' ')}`);
        }
      });

      const runDuration = state.goldMineMinigame.runStartTime ? (Date.now() - state.goldMineMinigame.runStartTime) / 1000 : state.goldMineMinigame.totalTimeInMineSeconds;

      let runReport = lootSummary.length > 0 
          ? `Run ended (Depth ${currentDepth}). Collected: ${lootSummary.join(', ')} in ${runDuration.toFixed(1)}s.`
          : `Run ended (Depth ${currentDepth}). Nothing collected in ${runDuration.toFixed(1)}s.`;
      
      if (currentStatusBeforeReturn === 'MINING_IN_PROGRESS' && currentDepth === maxUnlockedDepth && maxUnlockedDepth < MAX_GOLD_MINE_DEPTH) {
        newMaxUnlockedDepth++;
        runReport += ` Next depth unlocked: ${newMaxUnlockedDepth}!`;
         notifications.push({id: Date.now().toString(), message: `Depth ${newMaxUnlockedDepth} unlocked!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now()});
      }
      
      const updatedPlayerStats = calculateGoldMinePlayerStats(INITIAL_GOLD_MINE_PLAYER_STATS, state.goldMineMinigame.permanentUpgradeLevels);
      
      const returnNotification: GameNotification = {
        id: Date.now().toString(), 
        message: runReport, 
        type: currentStatusBeforeReturn === 'FATIGUED_RETURN_TO_SURFACE' ? 'warning' : 'info', 
        iconName: ICONS.LOOT_BAG ? 'LOOT_BAG' : undefined, 
        timestamp: Date.now()
      };
      notifications.push(returnNotification);

      return {
        ...state,
        resources: finalResources,
        goldMineMinigame: {
          ...state.goldMineMinigame,
          status: 'IDLE_AT_SURFACE',
          grid: [],
          playerStats: updatedPlayerStats, 
          currentStamina: updatedPlayerStats.maxStamina, 
          resourcesCollectedThisRun: {},
          runStartTime: null,
          totalTimeInMineSeconds: 0,
          popupEvents: [],
          maxUnlockedDepth: newMaxUnlockedDepth, // Update max unlocked depth
          // currentDepth remains as is, or reset to 1 if preferred upon returning. For now, keeps last selected.
        },
        notifications
      };
    }
    case 'GOLD_MINE_MINIGAME_PURCHASE_UPGRADE': {
      if (!state.goldMineMinigame || state.goldMineMinigame.status !== 'IDLE_AT_SURFACE') return state;
      
      const { upgradeId } = action.payload;
      const upgradeDef = GOLD_MINE_UPGRADE_DEFINITIONS[upgradeId];
      if (!upgradeDef) {
        console.warn(`Gold Mine Upgrade Definition not found for ID: ${upgradeId}`);
        return state;
      }

      const currentLevel = state.goldMineMinigame.permanentUpgradeLevels[upgradeId] || 0;
      if (upgradeDef.maxLevel !== -1 && currentLevel >= upgradeDef.maxLevel) {
        return state; 
      }

      const newPermanentUpgradeLevels = {
        ...state.goldMineMinigame.permanentUpgradeLevels,
        [upgradeId]: currentLevel + 1,
      };

      const newPlayerStats = calculateGoldMinePlayerStats(INITIAL_GOLD_MINE_PLAYER_STATS, newPermanentUpgradeLevels);
      
      const purchaseNotification: GameNotification = {
        id: Date.now().toString(),
        message: `Upgraded ${upgradeDef.name} to Level ${currentLevel + 1}!`,
        type: 'success',
        iconName: upgradeDef.iconName,
        timestamp: Date.now(),
      };

      return {
        ...state,
        goldMineMinigame: {
          ...state.goldMineMinigame,
          permanentUpgradeLevels: newPermanentUpgradeLevels,
          playerStats: newPlayerStats,
          currentStamina: newPlayerStats.maxStamina, 
        },
        notifications: [...state.notifications, purchaseNotification],
      };
    }
    case 'GOLD_MINE_MINIGAME_TICK': {
      if (!state.goldMineMinigame || state.goldMineMinigame.status !== 'MINING_IN_PROGRESS') return state;
      
      let newTotalTime = state.goldMineMinigame.totalTimeInMineSeconds + (GAME_TICK_MS / 1000) * state.gameSpeed;

      return {
        ...state,
        goldMineMinigame: {
          ...state.goldMineMinigame,
          totalTimeInMineSeconds: newTotalTime,
        }
      };
    }
    default:
      return state;
  }
};
