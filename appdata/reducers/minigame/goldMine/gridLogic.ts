import { GoldMineMinigameGridCell, ResourceType } from '../../../types';
import {
  BASE_GOLD_MINE_GRID_ROWS,
  BASE_GOLD_MINE_GRID_COLS,
  ROW_INCREASE_PER_DEPTH,
  COL_INCREASE_PER_DEPTH,
  BASE_GOLD_ORE_CHANCE,
  BASE_DIAMOND_ORE_CHANCE,
  BASE_OBSTACLE_CHANCE,
  BASE_STONE_PATCH_CHANCE,
  GOLD_ORE_CHANCE_PER_DEPTH_INCREASE,
  DIAMOND_ORE_CHANCE_PER_DEPTH_INCREASE,
  OBSTACLE_CHANCE_PER_DEPTH_INCREASE,
  MIN_DEPTH_FOR_GOLD_ORE_INCREASE,
  MIN_DEPTH_FOR_DIAMOND_ORE,
  HARDNESS_DIRT_BASE,
  HARDNESS_DIRT_PER_DEPTH,
  HARDNESS_STONE_BASE,
  HARDNESS_STONE_PER_DEPTH,
  HARDNESS_GOLD_ORE_BASE,
  HARDNESS_GOLD_ORE_PER_DEPTH,
  HARDNESS_DIAMOND_ORE_BASE,
  HARDNESS_DIAMOND_ORE_PER_DEPTH,
} from '../../../constants/goldMine';

export const generateGoldMineGrid = (initialRows: number, initialCols: number, depth: number): GoldMineMinigameGridCell[][] => {
  const rows = BASE_GOLD_MINE_GRID_ROWS + (depth - 1) * ROW_INCREASE_PER_DEPTH;
  const cols = BASE_GOLD_MINE_GRID_COLS + (depth - 1) * COL_INCREASE_PER_DEPTH;

  const grid: GoldMineMinigameGridCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      type: ResourceType.STONE,
      isRevealed: false,
      hardness: HARDNESS_STONE_BASE + (depth - 1) * HARDNESS_STONE_PER_DEPTH,
      currentHp: HARDNESS_STONE_BASE + (depth - 1) * HARDNESS_STONE_PER_DEPTH,
    }))
  );

  const carve = (r: number, c: number) => {
    const hardnessDirt = Math.max(1, HARDNESS_DIRT_BASE + (depth - 1) * HARDNESS_DIRT_PER_DEPTH);
    grid[r][c].type = ResourceType.DIRT;
    grid[r][c].hardness = hardnessDirt;
    grid[r][c].currentHp = hardnessDirt;

    const directions = [
      { dr: -2, dc: 0, wallDr: -1, wallDc: 0 }, { dr: 2, dc: 0, wallDr: 1, wallDc: 0 },
      { dr: 0, dc: -2, wallDr: 0, wallDc: -1 }, { dr: 0, dc: 2, wallDr: 0, wallDc: 1 },
    ].sort(() => Math.random() - 0.5);

    for (const dir of directions) {
      const nr = r + dir.dr; const nc = c + dir.dc;
      const wr = r + dir.wallDr; const wc = c + dir.wallDc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc].type === ResourceType.STONE) {
        const wallHardness = Math.max(1, HARDNESS_DIRT_BASE + (depth - 1) * HARDNESS_DIRT_PER_DEPTH);
        grid[wr][wc].type = ResourceType.DIRT;
        grid[wr][wc].hardness = wallHardness;
        grid[wr][wc].currentHp = wallHardness;
        carve(nr, nc);
      }
    }
  };

  const startR = Math.floor(Math.random() * (rows - 2)) + 1;
  const startC = Math.floor(Math.random() * (cols - 2)) + 1;
  carve(startR, startC);

  grid[startR][startC].type = 'EXIT_SHAFT';
  grid[startR][startC].hardness = 0;
  grid[startR][startC].currentHp = 0;

  let goldOreChance = BASE_GOLD_ORE_CHANCE;
  if (depth >= MIN_DEPTH_FOR_GOLD_ORE_INCREASE) {
    goldOreChance += (depth - (MIN_DEPTH_FOR_GOLD_ORE_INCREASE - 1)) * GOLD_ORE_CHANCE_PER_DEPTH_INCREASE;
  }
  let diamondOreChance = 0;
  if (depth >= MIN_DEPTH_FOR_DIAMOND_ORE) {
    diamondOreChance = BASE_DIAMOND_ORE_CHANCE + (depth - (MIN_DEPTH_FOR_DIAMOND_ORE -1)) * DIAMOND_ORE_CHANCE_PER_DEPTH_INCREASE;
  }
  const obstacleChance = BASE_OBSTACLE_CHANCE + (depth - 1) * OBSTACLE_CHANCE_PER_DEPTH_INCREASE;
  const stonePatchChance = BASE_STONE_PATCH_CHANCE; // Keep stone patch chance constant for now

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === ResourceType.DIRT) {
        const rand = Math.random();
        if (rand < goldOreChance) {
          const hardness = Math.max(1, HARDNESS_GOLD_ORE_BASE + (depth - 1) * HARDNESS_GOLD_ORE_PER_DEPTH);
          grid[r][c] = { type: ResourceType.GOLD_ORE, isRevealed: false, hardness, currentHp: hardness };
        } else if (rand < goldOreChance + diamondOreChance) {
          const hardness = Math.max(1, HARDNESS_DIAMOND_ORE_BASE + (depth - 1) * HARDNESS_DIAMOND_ORE_PER_DEPTH);
          grid[r][c] = { type: ResourceType.DIAMOND_ORE, isRevealed: false, hardness, currentHp: hardness };
        } else if (rand < goldOreChance + diamondOreChance + obstacleChance) {
          grid[r][c] = { type: ResourceType.OBSTACLE, isRevealed: false, hardness: Infinity, currentHp: Infinity };
        } else if (rand < goldOreChance + diamondOreChance + obstacleChance + stonePatchChance) {
          const hardness = Math.max(1, HARDNESS_STONE_BASE + (depth - 1) * HARDNESS_STONE_PER_DEPTH);
          grid[r][c] = { type: ResourceType.STONE, isRevealed: false, hardness, currentHp: hardness };
        }
      }
    }
  }

  for(let r=0; r<rows; ++r) {
    grid[r][0] = { type: ResourceType.OBSTACLE, isRevealed: false, hardness: Infinity, currentHp: Infinity };
    grid[r][cols-1] = { type: ResourceType.OBSTACLE, isRevealed: false, hardness: Infinity, currentHp: Infinity };
  }
  for(let c=0; c<cols; ++c) {
    grid[0][c] = { type: ResourceType.OBSTACLE, isRevealed: false, hardness: Infinity, currentHp: Infinity };
    grid[rows-1][c] = { type: ResourceType.OBSTACLE, isRevealed: false, hardness: Infinity, currentHp: Infinity };
  }

  return grid;
};

export const revealCellsAroundPlayer = (
  currentGrid: GoldMineMinigameGridCell[][],
  playerPos: { r: number; c: number },
  sightRadius: number
): { newGrid: GoldMineMinigameGridCell[][]; newlyRevealedCount: number } => {
  const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
  let newlyRevealedCount = 0;
  const rows = newGrid.length;
  const cols = newGrid[0]?.length || 0;

  for (let r = Math.max(0, playerPos.r - sightRadius); r <= Math.min(rows - 1, playerPos.r + sightRadius); r++) {
    for (let c = Math.max(0, playerPos.c - sightRadius); c <= Math.min(cols - 1, playerPos.c + sightRadius); c++) {
      if (Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c) <= sightRadius) {
        if (!newGrid[r][c].isRevealed) {
          newGrid[r][c].isRevealed = true;
          if (newGrid[r][c].type !== ResourceType.OBSTACLE) {
            newlyRevealedCount++;
          }
        }
      }
    }
  }
  return { newGrid, newlyRevealedCount };
};
