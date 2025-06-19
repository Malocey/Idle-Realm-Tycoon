// /appdata/constants/autoBattler.ts
export const AUTOBATTLER_TICK_INTERVAL_MS = 20; 
export const FARM_SUPPLY_PER_SECOND = 1.0; 
export const AUTOBATTLER_WINDMILL_FARM_BUFF_PERCENTAGE = 0.25; 
export const AUTOBATTLER_FUSION_RADIUS = 15; 

// --- Core Dimensions ---
// Player Grid (logical)
export const PLAYER_BUILDING_GRID_COLS = 4;
export const PLAYER_BUILDING_GRID_ROWS = 12;

// Display and Path Dimensions (VIEWPORT_WIDTH/HEIGHT are default canvas sizes, WORLD_WIDTH/HEIGHT are the scrollable area)
export const PLAYER_GRID_DISPLAY_WIDTH = 160; 
export const AUTOBATTLER_BATTLE_PATH_HEIGHT = 420; // This remains the logical height of the battle path area

export const AUTOBATTLER_VIEWPORT_WIDTH = PLAYER_GRID_DISPLAY_WIDTH + 700; // Default/initial viewport width (160 + 700 = 860)
export const AUTOBATTLER_VIEWPORT_HEIGHT = AUTOBATTLER_BATTLE_PATH_HEIGHT; // Default/initial viewport height (420)

// New World Dimensions (larger than viewport)
export const AUTOBATTLER_WORLD_WIDTH = 3000; // Increased world width
// Corrected: World height should match the battle path height to avoid empty space.
export const AUTOBATTLER_WORLD_HEIGHT = AUTOBATTLER_BATTLE_PATH_HEIGHT; 

// Cell Dimensions for Player Grid
export const PLAYER_GRID_CELL_WIDTH_PX = PLAYER_GRID_DISPLAY_WIDTH / PLAYER_BUILDING_GRID_COLS; // 160 / 4 = 40
export const PLAYER_GRID_CELL_HEIGHT_PX = AUTOBATTLER_BATTLE_PATH_HEIGHT / PLAYER_BUILDING_GRID_ROWS; // 420 / 12 = 35 // Use BATTLE_PATH_HEIGHT

// Rendering Constants
export const AUTOBATTLER_UNIT_VISUAL_SIZE = 16; 
export const AUTOBATTLER_UNIT_VISUAL_HEIGHT = 16; 
export const AUTOBATTLER_HP_BAR_WIDTH = 20;
export const AUTOBATTLER_HP_BAR_HEIGHT = 3;
export const AUTOBATTLER_STACK_COUNTER_FONT_SIZE = 9;
export const AUTOBATTLER_PLAYER_UNIT_COLOR = 'rgba(59, 130, 246, 0.9)'; 
export const AUTOBATTLER_ENEMY_UNIT_COLOR = 'rgba(239, 68, 68, 0.9)'; 
export const AUTOBATTLER_PLAYER_HQ_COLOR = 'rgba(37, 99, 235, 1)'; 
export const AUTOBATTLER_ENEMY_BUILDING_COLOR = 'rgba(185, 28, 28, 1)'; 
export const AUTOBATTLER_STACK_COUNTER_COLOR = 'rgba(255, 255, 255, 0.9)';
export const AUTOBATTLER_STACK_COUNTER_FONT = `bold ${AUTOBATTLER_STACK_COUNTER_FONT_SIZE}px Arial`;
export const AUTOBATTLER_HP_BAR_BG_COLOR = 'rgba(50, 50, 50, 0.7)';
export const AUTOBATTLER_HP_BAR_PLAYER_COLOR = 'rgba(34, 197, 94, 0.9)'; 
export const AUTOBATTLER_HP_BAR_ENEMY_COLOR = 'rgba(245, 158, 11, 0.9)'; 

// Unit Spawning
export const PLAYER_UNIT_SPAWN_X_OFFSET = 20; 
// ENEMY_UNIT_SPAWN_X_LINE will be dynamic based on enemy base position

// Structures
export const PLAYER_HQ_WIDTH = 40;
export const PLAYER_HQ_HEIGHT = 60;

export const ENEMY_BASE_WIDTH = 40;
export const ENEMY_BASE_HEIGHT = 60;
// World X Coordinate for Enemy Base (right side of the battle path area)
export const ENEMY_BASE_X = AUTOBATTLER_WORLD_WIDTH - (ENEMY_BASE_WIDTH / 2) - 30; // Adjusted for new world width
export const ENEMY_BASE_Y = AUTOBATTLER_BATTLE_PATH_HEIGHT / 2;

export const ENEMY_TOWER_WIDTH = 20;
export const ENEMY_TOWER_HEIGHT = 40;

// Damage Popup Constants
export const AUTOBATTLER_POPUP_DURATION_MS = 1200;
export const AUTOBATTLER_POPUP_LIFT_DISTANCE = 25; 
export const AUTOBATTLER_POPUP_FONT_SIZE = 12;
export const AUTOBATTLER_POPUP_COLOR_DAMAGE = 'rgba(255, 255, 255, 1)'; 
export const AUTOBATTLER_POPUP_COLOR_CRIT_DAMAGE = 'rgba(255, 100, 100, 1)'; 
export const AUTOBATTLER_POPUP_FONT = `bold ${AUTOBATTLER_POPUP_FONT_SIZE}px Arial`;

// New Visual Feedback Constants
export const AUTOBATTLER_PROGRESS_BAR_HEIGHT = 5;
export const AUTOBATTLER_PROGRESS_BAR_BG_COLOR = 'rgba(0, 0, 0, 0.3)';
export const AUTOBATTLER_PROGRESS_BAR_FILL_COLOR = 'rgba(75, 181, 67, 0.8)'; 
export const AUTOBATTLER_FARM_BUFF_AURA_COLOR = 'rgba(75, 181, 67, 0.3)'; 

// Minimap Constants
export const AUTOBATTLER_MINIMAP_WIDTH = 180;
export const AUTOBATTLER_MINIMAP_HEIGHT = Math.floor(AUTOBATTLER_MINIMAP_WIDTH * (AUTOBATTLER_WORLD_HEIGHT / AUTOBATTLER_WORLD_WIDTH)); // Maintain aspect ratio
export const AUTOBATTLER_MINIMAP_PLAYER_COLOR = 'rgba(59, 130, 246, 0.9)';
export const AUTOBATTLER_MINIMAP_ENEMY_COLOR = 'rgba(239, 68, 68, 0.9)';
export const AUTOBATTLER_MINIMAP_BUILDING_COLOR = 'rgba(107, 114, 128, 0.9)'; 
export const AUTOBATTLER_MINIMAP_VIEWPORT_BORDER_COLOR = 'rgba(255, 255, 0, 0.9)'; 
export const AUTOBATTLER_MINIMAP_VIEWPORT_FILL_COLOR = 'rgba(255, 255, 0, 0.15)';

// This constant might be better derived dynamically if AUTOBATTLER_WORLD_WIDTH changes,
// or it could define the logical width of the path where units primarily travel.
// For now, let's assume it's the interactive path width, distinct from the overall world width.
export const AUTOBATTLER_BATTLE_PATH_WIDTH = AUTOBATTLER_WORLD_WIDTH - PLAYER_GRID_DISPLAY_WIDTH - 100;