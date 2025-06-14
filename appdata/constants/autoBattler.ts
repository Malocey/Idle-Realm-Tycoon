
export const AUTOBATTLER_TICK_INTERVAL_MS = 20; // Changed from 100ms to 20ms for 50 FPS logic
export const FARM_SUPPLY_PER_TICK = 1.0; // Interpreted as supply PER SECOND. The reducer will scale it per tick.
export const AUTOBATTLER_FUSION_RADIUS = 15; // Pixels within which units of the same type will fuse

// Rendering Constants
export const AUTOBATTLER_BATTLE_PATH_WIDTH = 700;
export const AUTOBATTLER_BATTLE_PATH_HEIGHT = 300; // Fixed height for the canvas battle area
export const AUTOBATTLER_UNIT_VISUAL_SIZE = 16; // Smaller unit visual
export const AUTOBATTLER_UNIT_VISUAL_HEIGHT = 16;
export const AUTOBATTLER_HP_BAR_WIDTH = 20;
export const AUTOBATTLER_HP_BAR_HEIGHT = 3;
export const AUTOBATTLER_STACK_COUNTER_FONT_SIZE = 9;
export const AUTOBATTLER_PLAYER_UNIT_COLOR = 'rgba(59, 130, 246, 0.9)'; // Tailwind blue-500
export const AUTOBATTLER_ENEMY_UNIT_COLOR = 'rgba(239, 68, 68, 0.9)'; // Tailwind red-500
export const AUTOBATTLER_PLAYER_HQ_COLOR = 'rgba(37, 99, 235, 1)'; // Tailwind blue-700
export const AUTOBATTLER_ENEMY_BUILDING_COLOR = 'rgba(185, 28, 28, 1)'; // Tailwind red-700
export const AUTOBATTLER_STACK_COUNTER_COLOR = 'rgba(255, 255, 255, 0.9)';
export const AUTOBATTLER_STACK_COUNTER_FONT = `bold ${AUTOBATTLER_STACK_COUNTER_FONT_SIZE}px Arial`;
export const AUTOBATTLER_HP_BAR_BG_COLOR = 'rgba(50, 50, 50, 0.7)';
export const AUTOBATTLER_HP_BAR_PLAYER_COLOR = 'rgba(34, 197, 94, 0.9)'; // Tailwind green-500
export const AUTOBATTLER_HP_BAR_ENEMY_COLOR = 'rgba(245, 158, 11, 0.9)'; // Tailwind amber-500 for enemy HP

export const PLAYER_HQ_X = 10;
export const PLAYER_HQ_Y = AUTOBATTLER_BATTLE_PATH_HEIGHT / 2;
export const PLAYER_HQ_WIDTH = 40;
export const PLAYER_HQ_HEIGHT = 60;

export const ENEMY_BASE_X = AUTOBATTLER_BATTLE_PATH_WIDTH - 30 - 40; // x is left edge, 40 is width
export const ENEMY_BASE_Y = AUTOBATTLER_BATTLE_PATH_HEIGHT / 2;
export const ENEMY_BASE_WIDTH = 40;
export const ENEMY_BASE_HEIGHT = 60;

export const ENEMY_TOWER_WIDTH = 20;
export const ENEMY_TOWER_HEIGHT = 40;
