
import { GameState, GameAction, DungeonRunState, BattleHero, BattleEnemy, GameNotification, ResourceType, GlobalBonuses, CellType, DungeonGridState, DungeonCell, Cost, DungeonDefinition, DungeonEncounterDefinition, TrapDefinition, DungeonEventDefinition, DungeonEventType, PlayerOwnedShard, PlayerActiveRunBuff, RunBuffDefinition, EnemyChannelingAbilityDefinition } from '../../types';
import { DUNGEON_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, TRAP_DEFINITIONS, DUNGEON_EVENT_DEFINITIONS, RUN_BUFF_DEFINITIONS } from '../../gameData/index';
import { ICONS } from '../../components/Icons';
import { NOTIFICATION_ICONS, XP_PER_REVEALED_CELL, XP_PER_LOOT_CELL, XP_PER_EVENT_CELL } from '../../constants';
import { canAfford, calculateHeroStats, calculateDungeonEnemyStats, getExpToNextHeroLevel, formatNumber, calculateRunExpToNextLevel } from '../../utils';
import { generateUniqueDungeonLootId } from './utils';

const DEFAULT_GRID_ROWS = 12;
const DEFAULT_GRID_COLS = 12;
const FOG_OF_WAR_RADIUS = 1;


const revealCellsAroundParty = (gridState: DungeonGridState, activeRunBuffs: PlayerActiveRunBuff[], runBuffDefs: Record<string, RunBuffDefinition>): { newGrid: DungeonCell[][], newlyRevealedCount: number } => {
  const { grid, partyPosition, rows, cols } = gridState;
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let newlyRevealedCount = 0;

  let sightRadiusBonus = 0;
  const sightBuff = activeRunBuffs.find(b => b.definitionId === 'RUN_BUFF_SIGHT_RADIUS');
  if (sightBuff) {
    sightRadiusBonus = 1 * sightBuff.stacks;
  }
  const currentSightRadius = FOG_OF_WAR_RADIUS + sightRadiusBonus;


  for (let r = Math.max(0, partyPosition.r - currentSightRadius); r <= Math.min(rows - 1, partyPosition.r + currentSightRadius); r++) {
    for (let c = Math.max(0, partyPosition.c - currentSightRadius); c <= Math.min(cols - 1, partyPosition.c + currentSightRadius); c++) {
      if (Math.abs(r - partyPosition.r) + Math.abs(c - partyPosition.c) <= currentSightRadius) {
        if (!newGrid[r][c].isRevealed) {
          newGrid[r][c].isRevealed = true;
          if (newGrid[r][c].type !== CellType.WALL) {
            newlyRevealedCount++;
          }
        }
      }
    }
  }
  if (!newGrid[partyPosition.r][partyPosition.c].isVisited) {
      newGrid[partyPosition.r][partyPosition.c].isVisited = true;
  }
  return { newGrid, newlyRevealedCount };
};

const generateRandomDungeonGrid = (dungeonId: string, floorIndex: number, dungeonDef: DungeonDefinition | undefined): DungeonGridState => {
  const floorDef = dungeonDef?.floors[floorIndex];
  const rows = floorDef?.rows || DEFAULT_GRID_ROWS;
  const cols = floorDef?.cols || DEFAULT_GRID_COLS;

  const grid: DungeonCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: CellType.WALL, isRevealed: false, isVisited: false, isTrapTriggered:false, isEventTriggered:false }))
  );

  const mainPathCoords: {r: number, c: number}[] = [];
  const directions = [{dr: -1, dc: 0}, {dr: 1, dc: 0}, {dr: 0, dc: -1}, {dr: 0, dc: 1}];

  const startR = Math.floor(Math.random() * (rows - 2)) + 1;
  const startC = Math.floor(Math.random() * (cols - 2)) + 1;
  grid[startR][startC] = { type: CellType.START, isRevealed: false, isVisited: false, isTrapTriggered:false, isEventTriggered:false };
  mainPathCoords.push({r: startR, c: startC});

  const frontier: {r: number, c: number, wallR: number, wallC: number}[] = [];

  const addFrontier = (r_path: number, c_path: number) => {
    for (const dir of directions) {
      const wallR = r_path + dir.dr;
      const wallC = c_path + dir.dc;
      const nextR = r_path + dir.dr * 2;
      const nextC = c_path + dir.dc * 2;
      if (nextR > 0 && nextR < rows -1 && nextC > 0 && nextC < cols -1 && grid[nextR][nextC].type === CellType.WALL) {
        if (!frontier.some(f => f.r === nextR && f.c === nextC)) {
            frontier.push({ r: nextR, c: nextC, wallR, wallC });
        }
      }
    }
  };
  addFrontier(startR, startC);

  while (frontier.length > 0) {
    const randIdx = Math.floor(Math.random() * frontier.length);
    const { r, c, wallR, wallC } = frontier.splice(randIdx, 1)[0];

    if (grid[r][c].type === CellType.WALL) {
      grid[wallR][wallC] = { type: CellType.EMPTY, isRevealed: false, isVisited: false, isTrapTriggered:false, isEventTriggered:false };
      mainPathCoords.push({r: wallR, c: wallC});
      grid[r][c] = { type: CellType.EMPTY, isRevealed: false, isVisited: false, isTrapTriggered:false, isEventTriggered:false };
      mainPathCoords.push({r,c});
      addFrontier(r, c);
    }
  }

  let exitR = -1, exitC = -1;
  let maxDist = -1;
  const emptyPathCellsForExit = mainPathCoords.filter(coord => grid[coord.r][coord.c].type === CellType.EMPTY && !(coord.r === startR && coord.c === startC));
  if (emptyPathCellsForExit.length > 0) {
    for (const cellCoord of emptyPathCellsForExit) {
        const dist = Math.abs(cellCoord.r - startR) + Math.abs(cellCoord.c - startC);
        if (dist > maxDist) {
            maxDist = dist;
            exitR = cellCoord.r;
            exitC = cellCoord.c;
        }
    }
  }
  if (exitR !== -1 && exitC !== -1 && grid[exitR]?.[exitC]) {
    grid[exitR][exitC].type = CellType.EXIT;
  } else {
    const fallbackExit = emptyPathCellsForExit[Math.floor(Math.random() * emptyPathCellsForExit.length)] || {r: rows-2, c: cols-2};
    exitR = fallbackExit.r; exitC = fallbackExit.c;
    if(grid[exitR]?.[exitC]) grid[exitR][exitC].type = CellType.EXIT; else console.warn("Fallback exit position is invalid for floor ", floorIndex);
  }

  const tier = dungeonDef?.tier || 1;
  const availableEncounters = floorDef?.enemies || [];
  const availableTraps = floorDef?.possibleTraps || [];
  const availableEvents = floorDef?.possibleEvents || [];
  const basicShardDefinitions = ['ATTACK_SHARD_BASIC', 'HEALTH_SHARD_BASIC', 'DEFENSE_SHARD_BASIC'];

  const totalEncounterWeight = availableEncounters.reduce((sum, enc) => sum + enc.weight, 0);
  const totalTrapWeight = availableTraps.reduce((sum, trap) => sum + trap.weight, 0);
  const totalEventWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);

  let enemyDensity = 0.15 + floorIndex * 0.02;
  let lootDensity = 0.08 + floorIndex * 0.01;
  let trapDensity = 0.05 + floorIndex * 0.01;
  let eventDensity = 0.06 + floorIndex * 0.01;

  mainPathCoords.forEach(coord => {
    if (grid[coord.r][coord.c].type === CellType.EMPTY) {
      const rand = Math.random();
      if (rand < enemyDensity && totalEncounterWeight > 0) {
        let randomWeight = Math.random() * totalEncounterWeight;
        for (const encounter of availableEncounters) {
          if (randomWeight < encounter.weight) {
            grid[coord.r][coord.c].type = CellType.ENEMY;
            grid[coord.r][coord.c].enemyEncounterId = encounter.id;
            break;
          } randomWeight -= encounter.weight;
        }
      } else if (rand < enemyDensity + lootDensity) {
        grid[coord.r][coord.c].type = CellType.LOOT;
        const lootItems: Cost[] = [];
        lootItems.push({ resource: ResourceType.GOLD, amount: Math.floor(200 + Math.random() * (300 + tier * 100 + floorIndex * 50)) });
        if (Math.random() < 0.30) lootItems.push({ resource: ResourceType.WOOD, amount: Math.floor(50 + Math.random() * (100 + tier * 20 + floorIndex * 10)) });
        if (Math.random() < 0.25) lootItems.push({ resource: ResourceType.STONE, amount: Math.floor(30 + Math.random() * (70 + tier * 15 + floorIndex * 8)) });
        if (Math.random() < 0.10) lootItems.push({ resource: ResourceType.IRON, amount: Math.floor(5 + Math.random() * (10 + tier * 3 + floorIndex * 2)) });
        if (Math.random() < 0.05) lootItems.push({ resource: ResourceType.CRYSTALS, amount: Math.floor(3 + Math.random() * (7 + tier * 2 + floorIndex * 1)) });
        grid[coord.r][coord.c].lootData = lootItems;
        if (Math.random() < 0.12) grid[coord.r][coord.c].shardLoot = [{definitionId: basicShardDefinitions[Math.floor(Math.random() * basicShardDefinitions.length)], level: 1, count: 1}];
      } else if (rand < enemyDensity + lootDensity + trapDensity && totalTrapWeight > 0) {
        let randomWeight = Math.random() * totalTrapWeight;
        for (const trap of availableTraps) {
          if (randomWeight < trap.weight) {
            grid[coord.r][coord.c].type = CellType.TRAP;
            grid[coord.r][coord.c].trapId = trap.definitionId;
            break;
          } randomWeight -= trap.weight;
        }
      } else if (rand < enemyDensity + lootDensity + trapDensity + eventDensity && totalEventWeight > 0) {
        let randomWeight = Math.random() * totalEventWeight;
        for (const event of availableEvents) {
          if (randomWeight < event.weight) {
            grid[coord.r][coord.c].type = CellType.EVENT;
            grid[coord.r][coord.c].eventId = event.definitionId;
            break;
          } randomWeight -= event.weight;
        }
      }
    }
  });

  return {
    grid,
    rows,
    cols,
    partyPosition: { r: startR, c: startC },
    dungeonDefinitionId: dungeonId,
    currentFloor: floorIndex,
  };
};


export const handleGridInteractionActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'START_DUNGEON_EXPLORATION' | 'MOVE_PARTY_ON_GRID' | 'UPDATE_GRID_CELL' }>,
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'START_DUNGEON_EXPLORATION': {
      const { dungeonId, floorIndex } = action.payload;
      const dungeonDef = DUNGEON_DEFINITIONS[dungeonId];
      let notifications = [...state.notifications];

      if (!dungeonDef) {
          notifications.push({id: Date.now().toString(), message: "Dungeon definition not found.", type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
          return {...state, notifications};
      }

      const explorerGuild = state.buildings.find(b => b.id === 'EXPLORERS_GUILD');
      if (!explorerGuild || explorerGuild.level < dungeonDef.minExplorerGuildLevel) {
          notifications.push({id: Date.now().toString(), message: `Requires Explorer's Guild Lvl ${dungeonDef.minExplorerGuildLevel}`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
          return {...state, notifications};
      }

      let nextActiveDungeonRun = state.activeDungeonRun;
      let nextActiveDungeonGrid: DungeonGridState | null = null;
      let nextResources = {...state.resources};
      let nextActiveView = state.activeView;

      if (state.activeDungeonRun && state.activeDungeonRun.dungeonDefinitionId === dungeonId &&
          state.activeDungeonGrid && state.activeDungeonGrid.dungeonDefinitionId === dungeonId &&
          state.activeDungeonGrid.currentFloor === floorIndex) {
            notifications.push({id: Date.now().toString(), message: `Resuming ${dungeonDef.name} - Floor ${floorIndex + 1}`, type: 'info', iconName: ICONS.COMPASS ? 'COMPASS': undefined, timestamp: Date.now()});
            return { ...state, activeView: 'DUNGEON_EXPLORE', battleState: null, notifications };
      }

      if (state.activeDungeonRun && state.activeDungeonRun.dungeonDefinitionId === dungeonId) {
        nextActiveDungeonGrid = generateRandomDungeonGrid(dungeonId, floorIndex, dungeonDef);
        const { newGrid: revealedGrid, newlyRevealedCount } = revealCellsAroundParty(nextActiveDungeonGrid, state.activeDungeonRun.activeRunBuffs, RUN_BUFF_DEFINITIONS);
        nextActiveDungeonGrid.grid = revealedGrid;

        const updatedHeroStatesForRun: DungeonRunState['heroStatesAtFloorStart'] = {};
        state.heroes.forEach(h => {
            const persistedState = state.activeDungeonRun!.heroStatesAtFloorStart[h.definitionId];
            if (persistedState) {
                const heroDef = HERO_DEFINITIONS[h.definitionId];
                const skillTree = SKILL_TREES[heroDef.skillTreeId];
                const calculatedStats = calculateHeroStats(h, heroDef, skillTree, state, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, globalBonuses, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS);
                updatedHeroStatesForRun[h.definitionId] = {
                    currentHp: Math.min(persistedState.currentHp, calculatedStats.maxHp),
                    currentMana: Math.min(persistedState.currentMana, calculatedStats.maxMana || 0),
                    maxHp: calculatedStats.maxHp,
                    maxMana: calculatedStats.maxMana || 0,
                    specialAttackCooldownsRemaining: persistedState.specialAttackCooldownsRemaining
                };
            }
        });

        const initialRunXPFromReveal = newlyRevealedCount * XP_PER_REVEALED_CELL;
        let updatedRunXP = state.activeDungeonRun.runXP + initialRunXPFromReveal;
        let updatedRunLevel = state.activeDungeonRun.runLevel;
        let updatedExpToNextRunLevel = state.activeDungeonRun.expToNextRunLevel;
        let updatedOfferedBuffChoices = state.activeDungeonRun.offeredBuffChoices;

        if (initialRunXPFromReveal > 0) {
             notifications.push({ id: Date.now().toString() + "-runXPGainReveal", message: `Gained ${initialRunXPFromReveal} Run XP from revealing cells.`, type: 'info', iconName: ICONS.XP_ICON ? 'XP_ICON' : undefined, timestamp: Date.now() });
        }

        while (updatedRunXP >= updatedExpToNextRunLevel) {
            updatedRunLevel++;
            updatedRunXP -= updatedExpToNextRunLevel;
            updatedExpToNextRunLevel = calculateRunExpToNextLevel(updatedRunLevel);
            notifications.push({ id: Date.now().toString() + "-runLevelUpInit", message: `Run Level Up! Reached Level ${updatedRunLevel}. Choose a buff!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });

            const numChoices = (DUNGEON_DEFINITIONS[dungeonId]?.finalReward.permanentBuffChoices || 3) + globalBonuses.dungeonBuffChoicesBonus;
            const availableBuffs = Object.values(RUN_BUFF_DEFINITIONS).filter(buff => state.unlockedRunBuffs.includes(buff.id));
            const chosenBuffIds: string[] = [];
            if(availableBuffs.length > 0){
                 for (let i = 0; i < numChoices && availableBuffs.length > 0; i++) {
                    const randomIndex = Math.floor(Math.random() * availableBuffs.length);
                    chosenBuffIds.push(availableBuffs.splice(randomIndex, 1)[0].id);
                }
            }
            updatedOfferedBuffChoices = chosenBuffIds.length > 0 ? chosenBuffIds : null;
        }
        nextActiveDungeonRun = {
            ...state.activeDungeonRun,
            currentFloorIndex: floorIndex,
            heroStatesAtFloorStart: updatedHeroStatesForRun,
            survivingHeroIds: state.activeDungeonRun.survivingHeroIds.filter(id => updatedHeroStatesForRun[id]?.currentHp > 0),
            runXP: updatedRunXP,
            runLevel: updatedRunLevel,
            expToNextRunLevel: updatedExpToNextRunLevel,
            offeredBuffChoices: updatedOfferedBuffChoices,
        };
        nextActiveView = 'DUNGEON_EXPLORE';
        const floorEntryMessage = `Proceeding to Floor ${floorIndex + 1} of ${dungeonDef.name}`;
        notifications.push({id: Date.now().toString(), message: floorEntryMessage, type: 'info', iconName: ICONS.COMPASS ? 'COMPASS' : undefined, timestamp: Date.now()});
      } else {
        if (!canAfford(state.resources, dungeonDef.entryCost)) {
            notifications.push({id: Date.now().toString(), message: `Not enough resources to enter ${dungeonDef.name}`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
            return {...state, notifications};
        }
        dungeonDef.entryCost.forEach(c => nextResources[c.resource] = (nextResources[c.resource] || 0) - c.amount);
        nextActiveDungeonGrid = generateRandomDungeonGrid(dungeonId, floorIndex, dungeonDef);
        const { newGrid: revealedGrid, newlyRevealedCount } = revealCellsAroundParty(nextActiveDungeonGrid, [], RUN_BUFF_DEFINITIONS);
        nextActiveDungeonGrid.grid = revealedGrid;
        const heroStatesAtFloorStart: DungeonRunState['heroStatesAtFloorStart'] = {};
        state.heroes.forEach(h => {
            const heroDef = HERO_DEFINITIONS[h.definitionId];
            const skillTree = SKILL_TREES[heroDef.skillTreeId];
            const calculatedStats = calculateHeroStats(h, heroDef, skillTree, state, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, globalBonuses, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS);
            const initialCooldowns: Record<string, number> = {};
            Object.keys(h.specialAttackLevels).forEach(saId => { if(h.specialAttackLevels[saId] > 0) initialCooldowns[saId] = 0; });
            heroStatesAtFloorStart[h.definitionId] = {
                currentHp: calculatedStats.maxHp,
                currentMana: calculatedStats.maxMana || 0,
                maxHp: calculatedStats.maxHp,
                maxMana: calculatedStats.maxMana || 0,
                specialAttackCooldownsRemaining: initialCooldowns
            };
        });

        const initialRunXPFromReveal = newlyRevealedCount * XP_PER_REVEALED_CELL;
        let newRunRunXP = initialRunXPFromReveal;
        let newRunRunLevel = 1;
        let newRunExpToNext = calculateRunExpToNextLevel(1);
        let newRunOfferedBuffs = null;

        if (initialRunXPFromReveal > 0) {
             notifications.push({ id: Date.now().toString() + "-runXPGainNewRun", message: `Gained ${initialRunXPFromReveal} Run XP from revealing cells.`, type: 'info', iconName: ICONS.XP_ICON ? 'XP_ICON' : undefined, timestamp: Date.now() });
        }

        while (newRunRunXP >= newRunExpToNext) {
            newRunRunLevel++;
            newRunRunXP -= newRunExpToNext;
            newRunExpToNext = calculateRunExpToNextLevel(newRunRunLevel);
            notifications.push({ id: Date.now().toString() + "-runLevelUpNewRun", message: `Run Level Up! Reached Level ${newRunRunLevel}. Choose a buff!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
            const numChoices = (DUNGEON_DEFINITIONS[dungeonId]?.finalReward.permanentBuffChoices || 3) + globalBonuses.dungeonBuffChoicesBonus;
            const availableBuffs = Object.values(RUN_BUFF_DEFINITIONS).filter(buff => state.unlockedRunBuffs.includes(buff.id));
            const chosenBuffIds: string[] = [];
            if(availableBuffs.length > 0){
                 for (let i = 0; i < numChoices && availableBuffs.length > 0; i++) {
                    const randomIndex = Math.floor(Math.random() * availableBuffs.length);
                    chosenBuffIds.push(availableBuffs.splice(randomIndex, 1)[0].id);
                }
            }
            newRunOfferedBuffs = chosenBuffIds.length > 0 ? chosenBuffIds : null;
        }
        nextActiveDungeonRun = {
          dungeonDefinitionId: dungeonId,
          currentFloorIndex: floorIndex,
          heroStatesAtFloorStart,
          survivingHeroIds: state.heroes.map(h => h.definitionId),
          runXP: newRunRunXP,
          runLevel: newRunRunLevel,
          expToNextRunLevel: newRunExpToNext,
          activeRunBuffs: [],
          offeredBuffChoices: newRunOfferedBuffs,
        };
        nextActiveView = 'DUNGEON_EXPLORE';
        notifications.push({id: Date.now().toString(), message: `Entering ${dungeonDef.name} - Floor ${floorIndex + 1}`, type: 'info', iconName: ICONS.COMPASS ? 'COMPASS' : undefined, timestamp: Date.now()});
      }
      return { ...state, resources: nextResources, activeView: nextActiveView, activeDungeonGrid: nextActiveDungeonGrid, activeDungeonRun: nextActiveDungeonRun, battleState: null, notifications };
    }
    case 'MOVE_PARTY_ON_GRID': {
      if (!state.activeDungeonGrid || !state.activeDungeonRun || state.activeDungeonRun.offeredBuffChoices) return state;
      const { dr, dc } = action.payload;
      const { grid, partyPosition, rows, cols } = state.activeDungeonGrid;
      const newR = partyPosition.r + dr;
      const newC = partyPosition.c + dc;

      if (newR < 0 || newR >= rows || newC < 0 || newC >= cols || grid[newR][newC].type === CellType.WALL) {
        return state;
      }

      let newGridState = { ...state.activeDungeonGrid, partyPosition: { r: newR, c: newC } };
      const { newGrid: revealedGrid, newlyRevealedCount } = revealCellsAroundParty(newGridState, state.activeDungeonRun.activeRunBuffs, RUN_BUFF_DEFINITIONS);
      newGridState.grid = revealedGrid;

      const targetCell = newGridState.grid[newR][newC];
      let nextActiveView = state.activeView;
      let nextBattleState = state.battleState;
      let nextResources = { ...state.resources };
      let nextActiveDungeonRun = { ...state.activeDungeonRun };
      let nextActiveDungeonGrid: DungeonGridState | null = state.activeDungeonGrid ? { ...state.activeDungeonGrid, ...newGridState } : null;
      let notifications = [...state.notifications];
      let updatedHeroes = [...state.heroes];
      let xpGainedThisMove = 0;

      if (newlyRevealedCount > 0 && targetCell.type !== CellType.WALL) {
        xpGainedThisMove += newlyRevealedCount * XP_PER_REVEALED_CELL;
      }

      if (targetCell.type === CellType.ENEMY && targetCell.enemyEncounterId) {
        const dungeonDef = DUNGEON_DEFINITIONS[newGridState.dungeonDefinitionId];
        const floorDef = dungeonDef.floors[newGridState.currentFloor];
        const encounterDef = floorDef.enemies.find(enc => enc.id === targetCell.enemyEncounterId);
        if (!encounterDef) {
            console.error(`Encounter definition ${targetCell.enemyEncounterId} not found for dungeon ${dungeonDef.name} floor ${floorDef.floorNumber}`);
             if(nextActiveDungeonGrid){
                const updatedGrid = nextActiveDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
                updatedGrid[newR][newC].type = CellType.EMPTY;
                updatedGrid[newR][newC].enemyEncounterId = undefined;
                nextActiveDungeonGrid.grid = updatedGrid;
                notifications.push({id:Date.now().toString(), message: `Encounter data missing, cell cleared.`, type:'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp:Date.now()});
            }
        } else {
            const battleHeroes: BattleHero[] = state.heroes
                .filter(h => nextActiveDungeonRun.heroStatesAtFloorStart[h.definitionId]?.currentHp > 0)
                .map((h, idx) => {
                const heroDef = HERO_DEFINITIONS[h.definitionId];
                const skillTree = SKILL_TREES[heroDef.skillTreeId];
                const calculatedStats = calculateHeroStats(h, heroDef, skillTree, state, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, globalBonuses, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS);
                const heroFloorStartData = nextActiveDungeonRun.heroStatesAtFloorStart[h.definitionId];
                return {
                    ...heroDef, ...h,
                    attackType: heroDef.attackType || 'MELEE',
                    rangedAttackRangeUnits: heroDef.rangedAttackRangeUnits,
                    uniqueBattleId: `${h.definitionId}_${idx}_dGridBattle`,
                    currentHp: heroFloorStartData.currentHp,
                    currentMana: heroFloorStartData.currentMana,
                    calculatedStats,
                    attackCooldown: (1000 / calculatedStats.attackSpeed),
                    attackCooldownRemainingTicks: 0,
                    movementSpeed: 0,
                    x: 0,
                    y: 0,
                    specialAttackCooldownsRemaining: heroFloorStartData.specialAttackCooldownsRemaining,
                    statusEffects: [], temporaryBuffs: [],
                    currentEnergyShield: calculatedStats.maxEnergyShield || 0,
                    shieldRechargeDelayTicksRemaining: 0,
                };
            });
            const battleEnemies: BattleEnemy[] = [];
            encounterDef.enemies.forEach(ew => {
                const enemyDef = ENEMY_DEFINITIONS[ew.enemyId];
                if (enemyDef) {
                    for (let i = 0; i < ew.count; i++) {
                        const scaledStats = calculateDungeonEnemyStats(enemyDef, dungeonDef, newGridState.currentFloor, encounterDef.isElite);
                        const newEnemy: BattleEnemy = {
                            ...enemyDef,
                            attackType: enemyDef.attackType || 'MELEE',
                            rangedAttackRangeUnits: enemyDef.rangedAttackRangeUnits,
                            calculatedStats: scaledStats,
                            uniqueBattleId: `${ew.enemyId}_${i}_${encounterDef.id}_${Math.random().toString(16).slice(2)}`,
                            currentHp: scaledStats.maxHp,
                            currentEnergyShield: scaledStats.maxEnergyShield || 0,
                            shieldRechargeDelayTicksRemaining: 0,
                            attackCooldown: (1000 / scaledStats.attackSpeed),
                            attackCooldownRemainingTicks: 0,
                            movementSpeed: 0,
                            x: 0,
                            y: 0,
                            statusEffects: [],
                            temporaryBuffs: [],
                            isElite: encounterDef.isElite,
                            specialAttackCooldownsRemaining: {}, 
                            summonStrengthModifier: enemyDef.summonAbility ? 1.0 : undefined,
                            currentShieldHealCooldownMs: enemyDef.shieldHealAbility?.initialCooldownMs ?? enemyDef.shieldHealAbility?.cooldownMs,
                        };
                        if (enemyDef.channelingAbilities) {
                             enemyDef.channelingAbilities.forEach((caDef: EnemyChannelingAbilityDefinition) => {
                                if(newEnemy.specialAttackCooldownsRemaining) {
                                   newEnemy.specialAttackCooldownsRemaining[caDef.id] = caDef.initialCooldownMs ?? caDef.cooldownMs;
                                }
                            });
                        }
                        battleEnemies.push(newEnemy);
                    }
                }
            });
            nextBattleState = {
                dungeonRunId: newGridState.dungeonDefinitionId,
                dungeonFloor: newGridState.currentFloor,
                isDungeonBattle: true,
                isDungeonGridBattle: true,
                sourceGridCell: { r: newR, c: newC },
                heroes: battleHeroes,
                enemies: battleEnemies,
                battleLog: [`Encounter: ${encounterDef.name || 'Enemies'} at (${newC}, ${newR})!`],
                status: 'FIGHTING',
                ticksElapsed: 0, lastAttackEvents: [], battleLootCollected: [], defeatedEnemiesWithLoot: {}, battleExpCollected: 0, buildingLevelUpEventsInBattle: [], activePotionIdForUsage: null,
                sessionTotalLoot: [], 
                sessionTotalExp: 0,
                sessionTotalBuildingLevelUps: [],
            };
            nextActiveView = 'BATTLEFIELD';
            notifications.push({id:Date.now().toString(), message: `Encounter: ${encounterDef.name || 'Enemies'}! ${encounterDef.isElite ? '(Elite)' : ''}`, type:'warning', iconName: ICONS.ENEMY ? 'ENEMY' : undefined, timestamp:Date.now()});
        }
      } else if (targetCell.type === CellType.LOOT) {
        xpGainedThisMove += XP_PER_LOOT_CELL;
        let foundItemsMessage = "Found nothing of value.";
        if (targetCell.lootData && targetCell.lootData.length > 0) {
            targetCell.lootData.forEach(loot => {
                let amountToGain = loot.amount;
                if (loot.resource === ResourceType.GOLD) {
                    let goldBonusPercentage = 0;
                    const fortuneFinderBuff = nextActiveDungeonRun.activeRunBuffs.find(b => b.definitionId === 'RUN_BUFF_LOOT_FIND');
                    if (fortuneFinderBuff) {
                        goldBonusPercentage += 0.20 * fortuneFinderBuff.stacks;
                        const ffDef = RUN_BUFF_DEFINITIONS['RUN_BUFF_LOOT_FIND'];
                        if (ffDef && ffDef.libraryEffectsPerUpgradeLevel) {
                            const libraryLevel = state.runBuffLibraryLevels[ffDef.id] || 0;
                            if (libraryLevel > 0) {
                                const libraryEffects = ffDef.libraryEffectsPerUpgradeLevel(libraryLevel);
                                libraryEffects.forEach(libEffect => {
                                    goldBonusPercentage += libEffect.value * fortuneFinderBuff.stacks;
                                });
                            }
                        }
                    }
                    amountToGain = Math.floor(amountToGain * (1 + goldBonusPercentage));
                }
              nextResources[loot.resource] = (nextResources[loot.resource] || 0) + amountToGain;
            });
            foundItemsMessage = `Found ${targetCell.lootData.map(l => `${formatNumber(l.amount)} ${l.resource.replace(/_/g,' ')}`).join(', ')}!`;
        }
        if (targetCell.shardLoot && targetCell.shardLoot.length > 0 && nextActiveDungeonRun.survivingHeroIds.length > 0) {
            const firstSurvivingHeroId = nextActiveDungeonRun.survivingHeroIds[0];
            const heroIndex = updatedHeroes.findIndex(h => h.definitionId === firstSurvivingHeroId);
            if (heroIndex !== -1) {
                const heroToUpdate = { ...updatedHeroes[heroIndex] };
                let heroShards = [...(heroToUpdate.ownedShards || [])];
                let foundShardsDesc: string[] = [];
                targetCell.shardLoot.forEach(shardLootItem => {
                    for (let i = 0; i < shardLootItem.count; i++) {
                        const newShard: PlayerOwnedShard = {
                            instanceId: generateUniqueDungeonLootId(),
                            definitionId: shardLootItem.definitionId,
                            level: shardLootItem.level,
                        };
                        heroShards.push(newShard);
                        const shardDefName = SHARD_DEFINITIONS[shardLootItem.definitionId]?.name || 'Unknown Shard';
                        foundShardsDesc.push(`${shardDefName} Lvl ${shardLootItem.level}`);
                    }
                });
                heroToUpdate.ownedShards = heroShards;
                updatedHeroes[heroIndex] = heroToUpdate;
                if (foundShardsDesc.length > 0) {
                     if (foundItemsMessage === "Found nothing of value.") foundItemsMessage = "";
                     else foundItemsMessage += " ";
                    foundItemsMessage += `Also found ${foundShardsDesc.join(', ')}!`;
                    const heroDefinitionForNotification = HERO_DEFINITIONS[heroToUpdate.definitionId];
                    const heroDisplayNameForNotification: string = heroDefinitionForNotification?.name || 'Hero';
                    const shardsDescriptionForNotification: string = foundShardsDesc.join(', ');
                     notifications.push({
                        id: Date.now().toString() + "-shardfound",
                        message: `Found Shard(s): ${shardsDescriptionForNotification} for ${heroDisplayNameForNotification}!`,
                        type: 'success',
                        iconName: ICONS.SHARD_ICON ? 'SHARD_ICON' : undefined,
                        timestamp: Date.now()
                    });
                }
            }
        }
        notifications.push({ id: Date.now().toString(), message: foundItemsMessage, type: 'success', iconName: ICONS.GOLD ? 'GOLD': undefined, timestamp: Date.now()});
        if(nextActiveDungeonGrid){
            const updatedGrid = nextActiveDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
            updatedGrid[newR][newC].type = CellType.EMPTY;
            updatedGrid[newR][newC].lootData = undefined;
            updatedGrid[newR][newC].shardLoot = undefined;
            nextActiveDungeonGrid.grid = updatedGrid;
        }
      } else if (targetCell.type === CellType.TRAP && targetCell.trapId && !targetCell.isTrapTriggered) {
        xpGainedThisMove += XP_PER_EVENT_CELL;
        const trapDef = TRAP_DEFINITIONS[targetCell.trapId];
        if (trapDef && nextActiveDungeonGrid) {
            notifications.push({ id: Date.now().toString(), message: trapDef.descriptionWhenTriggered, type: 'warning', iconName: trapDef.iconNameWhenTriggered, timestamp: Date.now() });
            const tempHeroStates = { ...nextActiveDungeonRun.heroStatesAtFloorStart };
            let anyHeroDied = false;
            if (trapDef.damageToParty) {
                const dungeonTier = DUNGEON_DEFINITIONS[nextActiveDungeonRun.dungeonDefinitionId]?.tier || 1;
                const damage = trapDef.damageToParty.base + ((trapDef.damageToParty.perTier || 0) * (dungeonTier -1));
                Object.keys(tempHeroStates).forEach(heroId => {
                    if (tempHeroStates[heroId].currentHp > 0) {
                        tempHeroStates[heroId].currentHp = Math.max(0, tempHeroStates[heroId].currentHp - damage);
                        if (tempHeroStates[heroId].currentHp === 0) anyHeroDied = true;
                    }
                });
            }
            if (trapDef.resourceLoss) {
                trapDef.resourceLoss.forEach(loss => {
                    nextResources[loss.resource] = Math.max(0, (nextResources[loss.resource] || 0) - loss.amount);
                });
                 notifications.push({ id: Date.now().toString() + "-resLoss", message: `Lost ${trapDef.resourceLoss.map(l => `${l.amount} ${l.resource.replace(/_/g,' ')}`).join(', ')}!`, type: 'error', iconName: ICONS.X_CIRCLE ? 'X_CIRCLE' : undefined, timestamp: Date.now()});
            }
            nextActiveDungeonRun.heroStatesAtFloorStart = tempHeroStates;
            nextActiveDungeonRun.survivingHeroIds = Object.keys(tempHeroStates).filter(id => tempHeroStates[id].currentHp > 0);
            const updatedGridForTrap = nextActiveDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
            updatedGridForTrap[newR][newC].isTrapTriggered = true;
            nextActiveDungeonGrid.grid = updatedGridForTrap;
            if (nextActiveDungeonRun.survivingHeroIds.length === 0) {
                 notifications.push({ id: Date.now().toString(), message: "All heroes defeated by the trap! Run ended.", type: 'error', iconName: ICONS.X_CIRCLE ? 'X_CIRCLE' : undefined, timestamp: Date.now() });
                 nextActiveView = 'TOWN';
                 nextActiveDungeonGrid = null;
                 nextActiveDungeonRun = null;
            } else if (anyHeroDied) {
                 notifications.push({ id: Date.now().toString(), message: "Some heroes were defeated by the trap!", type: 'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp: Date.now() });
            }
        }
      } else if (targetCell.type === CellType.EVENT && targetCell.eventId && !targetCell.isEventTriggered) {
        xpGainedThisMove += XP_PER_EVENT_CELL;
        const eventDef = DUNGEON_EVENT_DEFINITIONS[targetCell.eventId];
        if (eventDef && nextActiveDungeonGrid) {
            notifications.push({ id: Date.now().toString(), message: eventDef.descriptionOnEnter, type: 'info', iconName: eventDef.iconName, timestamp: Date.now() });
            const effect = eventDef.effect;
            let effectOutcomeMsg = "";
            const tempHeroStatesEvents = { ...nextActiveDungeonRun.heroStatesAtFloorStart };
            let anyEventHeroDied = false;
            switch(effect.type) {
                case DungeonEventType.RESOURCE_GAIN:
                    if (effect.resourceType && effect.amount) {
                        nextResources[effect.resourceType] = (nextResources[effect.resourceType] || 0) + effect.amount;
                        effectOutcomeMsg = `Gained ${formatNumber(effect.amount)} ${effect.resourceType.replace(/_/g,' ')}!`;
                    }
                    break;
                case DungeonEventType.RESOURCE_LOSS:
                     if (effect.resourceType && effect.amount) {
                        nextResources[effect.resourceType] = Math.max(0, (nextResources[effect.resourceType] || 0) - effect.amount);
                        effectOutcomeMsg = `Lost ${formatNumber(effect.amount)} ${effect.resourceType.replace(/_/g,' ')}!`;
                    }
                    break;
                case DungeonEventType.HEAL_PARTY:
                    if (effect.amount) {
                        Object.keys(tempHeroStatesEvents).forEach(heroId => {
                           if (tempHeroStatesEvents[heroId].currentHp > 0) {
                                tempHeroStatesEvents[heroId].currentHp = Math.min(tempHeroStatesEvents[heroId].maxHp, tempHeroStatesEvents[heroId].currentHp + effect.amount!);
                           }
                        });
                        effectOutcomeMsg = `Party healed for ${effect.amount} HP!`;
                    } else if (effect.percentage) {
                        Object.keys(tempHeroStatesEvents).forEach(heroId => {
                           if (tempHeroStatesEvents[heroId].currentHp > 0) {
                                tempHeroStatesEvents[heroId].currentHp = Math.min(tempHeroStatesEvents[heroId].maxHp, tempHeroStatesEvents[heroId].currentHp + Math.floor(tempHeroStatesEvents[heroId].maxHp * effect.percentage!));
                           }
                        });
                        effectOutcomeMsg = `Party healed for ${(effect.percentage * 100).toFixed(0)}% of Max HP!`;
                    }
                    if (effect.resourceType === ResourceType.CRYSTALS && effect.percentage) {
                        Object.keys(tempHeroStatesEvents).forEach(heroId => {
                           if (tempHeroStatesEvents[heroId].currentHp > 0) {
                                const maxMana = tempHeroStatesEvents[heroId].maxMana || 0;
                                if (maxMana > 0) {
                                     tempHeroStatesEvents[heroId].currentMana = Math.min(maxMana, tempHeroStatesEvents[heroId].currentMana + Math.floor(maxMana * effect.percentage!));
                                }
                           }
                        });
                        effectOutcomeMsg = (effectOutcomeMsg ? effectOutcomeMsg + " " : "") + `Party's mana restored by ${(effect.percentage * 100).toFixed(0)}%!`;
                    }
                    break;
                case DungeonEventType.DAMAGE_PARTY:
                     if (effect.amount) {
                        Object.keys(tempHeroStatesEvents).forEach(heroId => {
                           if (tempHeroStatesEvents[heroId].currentHp > 0) {
                                tempHeroStatesEvents[heroId].currentHp = Math.max(0, tempHeroStatesEvents[heroId].currentHp - effect.amount!);
                                if (tempHeroStatesEvents[heroId].currentHp === 0) anyEventHeroDied = true;
                           }
                        });
                        effectOutcomeMsg = `Party takes ${effect.amount} damage!`;
                    } else if (effect.percentage) {
                         Object.keys(tempHeroStatesEvents).forEach(heroId => {
                           if (tempHeroStatesEvents[heroId].currentHp > 0) {
                                tempHeroStatesEvents[heroId].currentHp = Math.max(0, tempHeroStatesEvents[heroId].currentHp - Math.floor(tempHeroStatesEvents[heroId].currentHp * effect.percentage!));
                                 if (tempHeroStatesEvents[heroId].currentHp === 0) anyEventHeroDied = true;
                           }
                        });
                        effectOutcomeMsg = `Party takes ${(effect.percentage * 100).toFixed(0)}% of current HP as damage!`;
                    }
                    break;
                 case DungeonEventType.TEXT_ONLY:
                    break;
                case DungeonEventType.OFFER_RUN_BUFF_CHOICE:
                    const numChoices = (effect.numChoicesToOffer || 3) + globalBonuses.dungeonBuffChoicesBonus;
                    const rarityFilter = effect.possibleRarities;
                    let availableBuffs = Object.values(RUN_BUFF_DEFINITIONS).filter(buff => state.unlockedRunBuffs.includes(buff.id));
                    if (rarityFilter && rarityFilter.length > 0) {
                        availableBuffs = availableBuffs.filter(b => rarityFilter.includes(b.rarity));
                    }
                    const chosenBuffIds: string[] = [];
                    if(availableBuffs.length > 0){
                        for (let i = 0; i < numChoices && availableBuffs.length > 0; i++) {
                            const randomIndex = Math.floor(Math.random() * availableBuffs.length);
                            chosenBuffIds.push(availableBuffs.splice(randomIndex, 1)[0].id);
                        }
                    }
                    nextActiveDungeonRun.offeredBuffChoices = chosenBuffIds.length > 0 ? chosenBuffIds : null;
                    effectOutcomeMsg = "You feel a surge of power and a choice presents itself!";
                    break;
            }
             if (effectOutcomeMsg) {
                 notifications.push({ id: Date.now().toString() + "-eventOutcome", message: effectOutcomeMsg, type: effect.type === DungeonEventType.DAMAGE_PARTY || effect.type === DungeonEventType.RESOURCE_LOSS ? 'warning' : 'info', iconName: eventDef.iconName, timestamp: Date.now() });
            }
            nextActiveDungeonRun.heroStatesAtFloorStart = tempHeroStatesEvents;
            nextActiveDungeonRun.survivingHeroIds = Object.keys(tempHeroStatesEvents).filter(id => tempHeroStatesEvents[id].currentHp > 0);
            const updatedGridForEvent = nextActiveDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
            updatedGridForEvent[newR][newC].isEventTriggered = true;
            if (eventDef.removeAfterTrigger) {
                updatedGridForEvent[newR][newC].type = CellType.EMPTY;
            }
            nextActiveDungeonGrid.grid = updatedGridForEvent;
             if (nextActiveDungeonRun.survivingHeroIds.length === 0) {
                 notifications.push({ id: Date.now().toString(), message: "All heroes defeated by the event! Run ended.", type: 'error', iconName: ICONS.X_CIRCLE ? 'X_CIRCLE' : undefined, timestamp: Date.now() });
                 nextActiveView = 'TOWN';
                 nextActiveDungeonGrid = null;
                 nextActiveDungeonRun = null;
            } else if (anyEventHeroDied) {
                 notifications.push({ id: Date.now().toString(), message: "Some heroes were defeated by the event!", type: 'warning', iconName: ICONS.WARNING ? 'WARNING' : undefined, timestamp: Date.now() });
            }
        }
      } else if (targetCell.type === CellType.EXIT) {
        const dungeonDef = DUNGEON_DEFINITIONS[nextActiveDungeonRun.dungeonDefinitionId];
        const currentFloorDisplay = nextActiveDungeonRun.currentFloorIndex + 1;
        const finalHeroStatesForFloor: DungeonRunState['heroStatesAtFloorStart'] = { ...nextActiveDungeonRun.heroStatesAtFloorStart };
        state.heroes.forEach(h => {
            if (finalHeroStatesForFloor[h.definitionId]) {
                const currentBattleHeroData = state.battleState?.heroes.find(bh => bh.definitionId === h.definitionId);
                const runHeroData = nextActiveDungeonRun.heroStatesAtFloorStart[h.definitionId];
                finalHeroStatesForFloor[h.definitionId] = {
                    currentHp: currentBattleHeroData ? currentBattleHeroData.currentHp : runHeroData.currentHp,
                    currentMana: currentBattleHeroData ? currentBattleHeroData.currentMana : runHeroData.currentMana,
                    maxHp: runHeroData.maxHp,
                    maxMana: runHeroData.maxMana,
                    specialAttackCooldownsRemaining: currentBattleHeroData ? currentBattleHeroData.specialAttackCooldownsRemaining : runHeroData.specialAttackCooldownsRemaining,
                };
            }
        });
        nextActiveDungeonRun.heroStatesAtFloorStart = finalHeroStatesForFloor;
        nextActiveDungeonRun.survivingHeroIds = Object.keys(finalHeroStatesForFloor).filter(id => finalHeroStatesForFloor[id].currentHp > 0);
        nextActiveDungeonRun.currentFloorIndex++;
        nextActiveDungeonGrid = null;
        if (nextActiveDungeonRun.currentFloorIndex < dungeonDef.floors.length) {
             notifications.push({ id: Date.now().toString(), message: `Floor ${currentFloorDisplay} cleared! Preparing Floor ${nextActiveDungeonRun.currentFloorIndex + 1}...`, type: 'success', iconName: ICONS.ARROW_UP ? 'ARROW_UP' : undefined, timestamp: Date.now()});
             nextActiveView = 'DUNGEON_EXPLORE';
        } else {
            notifications.push({ id: Date.now().toString(), message: `${dungeonDef.name} cleared! Claim your reward.`, type: 'success', iconName: ICONS.CHECK_CIRCLE ? 'CHECK_CIRCLE' : undefined, timestamp: Date.now()});
            nextActiveView = 'DUNGEON_REWARD';
        }
      }

      if (xpGainedThisMove > 0 && nextActiveDungeonRun) {
        nextActiveDungeonRun.runXP += xpGainedThisMove;
        if (xpGainedThisMove !== (newlyRevealedCount * XP_PER_REVEALED_CELL)) {
            notifications.push({ id: Date.now().toString() + "-runXPGainMoveDetailed", message: `Gained ${xpGainedThisMove} Run XP.`, type: 'info', iconName: ICONS.XP_ICON ? 'XP_ICON' : undefined, timestamp: Date.now() });
        } else if (newlyRevealedCount > 0) {
             notifications.push({ id: Date.now().toString() + "-runXPGainMoveRevealOnly", message: `Gained ${xpGainedThisMove} Run XP from revealing cells.`, type: 'info', iconName: ICONS.XP_ICON ? 'XP_ICON' : undefined, timestamp: Date.now() });
        }

        while (nextActiveDungeonRun.runXP >= nextActiveDungeonRun.expToNextRunLevel) {
            nextActiveDungeonRun.runLevel++;
            nextActiveDungeonRun.runXP -= nextActiveDungeonRun.expToNextRunLevel;
            nextActiveDungeonRun.expToNextRunLevel = calculateRunExpToNextLevel(nextActiveDungeonRun.runLevel);
            notifications.push({ id: Date.now().toString() + "-runLevelUpMove", message: `Run Level Up! Reached Level ${nextActiveDungeonRun.runLevel}. Choose a buff!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });

            const numChoices = (DUNGEON_DEFINITIONS[nextActiveDungeonRun.dungeonDefinitionId]?.finalReward.permanentBuffChoices || 3) + globalBonuses.dungeonBuffChoicesBonus;
            const availableBuffs = Object.values(RUN_BUFF_DEFINITIONS).filter(buff => state.unlockedRunBuffs.includes(buff.id));
            const chosenBuffIds: string[] = [];
            if (availableBuffs.length > 0) {
                for (let i = 0; i < numChoices && availableBuffs.length > 0; i++) {
                    const randomIndex = Math.floor(Math.random() * availableBuffs.length);
                    chosenBuffIds.push(availableBuffs.splice(randomIndex, 1)[0].id);
                }
            }
            nextActiveDungeonRun.offeredBuffChoices = chosenBuffIds.length > 0 ? chosenBuffIds : null;
        }
      }
      return { ...state, heroes: updatedHeroes, activeDungeonGrid: nextActiveDungeonGrid, activeDungeonRun: nextActiveDungeonRun, activeView: nextActiveView, battleState: nextBattleState, resources: nextResources, notifications };
    }
    case 'UPDATE_GRID_CELL': {
        if (!state.activeDungeonGrid) return state;
        const { r, c, newCellType, lootCollected } = action.payload;
        const newGrid = state.activeDungeonGrid.grid.map(row => row.map(cell => ({...cell})));
        if (newGrid[r] && newGrid[r][c]) {
            newGrid[r][c].type = newCellType;
            if (newCellType === CellType.EMPTY) {
                 newGrid[r][c].enemyEncounterId = undefined;
                 newGrid[r][c].lootData = undefined;
                 newGrid[r][c].shardLoot = undefined;
                 newGrid[r][c].trapId = undefined;
                 newGrid[r][c].eventId = undefined;
            }
            if (lootCollected) {
                newGrid[r][c].lootData = undefined;
                newGrid[r][c].shardLoot = undefined;
            }
        }
        return { ...state, activeDungeonGrid: { ...state.activeDungeonGrid, grid: newGrid }};
    }
    default:
      return state;
  }
};