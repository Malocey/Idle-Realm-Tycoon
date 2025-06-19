
// Animation Durations (in seconds)
export const ANIMATION_DURATION_STANDARD = 0.3; // s
export const ANIMATION_DURATION_FAST = 0.15; // s
export const ANIMATION_DURATION_SLOW = 0.5; // s

// Modal / Tab Transitions
export const MODAL_CONTENT_ENTER_DURATION = 0.35; // s
export const TAB_SLIDE_DURATION = 0.3; // s
export const VIEW_TRANSITION_DURATION = 0.4; // s (Ensure this matches App.tsx)

// OLD Damage Popups (Still used for non-HP popups like heal/shield if not handled by new system)
export const DAMAGE_POPUP_ANIMATION_DURATION_MS = 1500; // ms
export const DAMAGE_POPUP_TRAVEL_DISTANCE_PX = 45; // px
export const DAMAGE_POPUP_FONT_SIZE_PX = 16; 
export const DAMAGE_POPUP_CRIT_FONT_SIZE_PX = 20;
export const DAMAGE_POPUP_HEAL_FONT_SIZE_PX = 17;
export const MAX_DAMAGE_POPUPS_IN_STATE = 30; 
export const DAMAGE_POPUP_LIFESPAN_BUFFER_MS = 200; 

// --- Fusion Anchor & Feeder Particle System Constants ---

// Feeder Particle (Flying numbers)
export const FEEDER_PARTICLE_DURATION_MS = 600; // Duration of the arc animation
export const FEEDER_GRAVITY = 980; // Gravity affecting the arc
export const FEEDER_SPAWN_INTERVAL_MS = 75; // Interval between spawning feeders from the same anchor
// Initial Y velocity will be calculated to make the arc peak nicely
// Initial X velocity will be calculated to reach the target anchor point horizontally

// Fusion Anchor (Stationary aggregated number)
export const FUSION_ANCHOR_FADE_OUT_DURATION_MS = 5000; // How long an anchor stays visible after last update
export const FUSION_COUNT_UP_DURATION_MS = 250;      // Duration for the number to count up
export const FUSION_CRIT_SHAKE_DURATION_MS = 300;    // Duration of the shake animation on critical
export const FUSION_CRIT_SHAKE_MAGNITUDE_PX = 3;   // Max pixel offset for shake
export const CRIT_EFFECT_DURATION_MS = 2000; // Duration for the critical visual effect on the anchor

// Font Sizes for Fusion Anchor Text (based on totalAmount)
export const FUSION_FONT_SIZE_BASE_PX = 16;
export const FUSION_FONT_SIZE_TIER_1_THRESHOLD = 10; // Up to this value (exclusive), use base
export const FUSION_FONT_SIZE_TIER_1_PX = 18;
export const FUSION_FONT_SIZE_TIER_2_THRESHOLD = 25;
export const FUSION_FONT_SIZE_TIER_2_PX = 20;
export const FUSION_FONT_SIZE_TIER_3_THRESHOLD = 50;
export const FUSION_FONT_SIZE_TIER_3_PX = 24;
export const FUSION_FONT_SIZE_TIER_4_THRESHOLD = 100;
export const FUSION_FONT_SIZE_TIER_4_PX = 28;
export const FUSION_FONT_SIZE_MAX_THRESHOLD = 250; // For very large numbers
export const FUSION_FONT_SIZE_MAX_PX = 32;

// Colors for Fusion Anchor Text
export const FUSION_NORMAL_COLOR = '#f8fafc'; // slate-50
export const FUSION_NORMAL_STROKE_COLOR = 'rgba(30, 41, 59, 0.8)'; // slate-800 with opacity
export const FUSION_CRITICAL_COLOR = '#f59e0b'; // amber-500
export const FUSION_CRITICAL_STROKE_COLOR = '#78350f'; // amber-800 (darker for stroke)
export const FUSION_HEAL_COLOR = '#22c55e'; // green-500
export const FUSION_HEAL_STROKE_COLOR = '#14532d'; // green-800
export const FUSION_SHIELD_COLOR = '#0ea5e9'; // sky-500
export const FUSION_SHIELD_STROKE_COLOR = '#0369a1'; // sky-700

// Feeder Particle Text (Individual flying numbers)
export const FEEDER_FONT_SIZE_PX = 13;
export const FEEDER_NORMAL_COLOR = 'rgba(241, 245, 249, 0.9)'; // slate-100 with slight transparency
export const FEEDER_NORMAL_STROKE_COLOR = 'rgba(15, 23, 42, 0.6)';
export const FEEDER_CRITICAL_COLOR = 'rgba(251, 191, 36, 0.95)'; // amber-400
export const FEEDER_CRITICAL_STROKE_COLOR = 'rgba(120, 53, 15, 0.7)';
export const FEEDER_HEAL_COLOR = 'rgba(74, 222, 128, 0.9)'; // green-400
export const FEEDER_HEAL_STROKE_COLOR = 'rgba(21, 128, 61, 0.7)';
export const FEEDER_SHIELD_COLOR = 'rgba(56, 189, 248, 0.9)'; // sky-400
export const FEEDER_SHIELD_STROKE_COLOR = 'rgba(7, 89, 133, 0.7)';


export const FUSION_FEEDER_ANIMATION_DURATION_MS = 1000; // Old constant, can be deprecated if FEEDER_PARTICLE_DURATION_MS is used

// Battle Spoils Panel Animation
export const BATTLE_SPOILS_ANIMATION_DURATION_MS = 400; // ms

// Other UI Element Timings
export const BUILDING_LEVEL_UP_INDICATOR_DURATION_MS = 10000; // ms
export const RIPPLE_ANIMATION_DURATION = 0.6; // s

// Minigame Specific
export const RESOURCE_POPUP_ARC_DURATION = 1.5; // s (for StoneQuarry and GoldMine)
export const CELL_TRANSFORM_PULSE_DURATION = 1.0; // s
