
import { IconComponent } from '../../types';
import { RESOURCE_ICONS } from './resourceIcons';
import { MINIGAME_RESOURCE_ICONS } from './minigameResourceIcons';
import { UI_ELEMENT_ICONS } from './uiElementIcons';
import { COMBAT_ABILITY_ICONS } from './combatAndAbilityIcons';
import { EQUIPMENT_CRAFTING_ICONS } from './equipmentAndCraftingIcons';
import { STATUS_BUFF_ICONS } from './statusAndBuffIcons';
import { SHARD_FUSION_ICONS } from './shardAndFusionIcons';
import { DUNGEON_EVENT_ICONS } from './dungeonAndEventIcons';
import { createIcon } from './helpers'; // Added import for createIcon

export const ICONS: Record<string, IconComponent> = {
  ...RESOURCE_ICONS,
  ...MINIGAME_RESOURCE_ICONS,
  ...UI_ELEMENT_ICONS, // MAP_ICON will be available here
  ...COMBAT_ABILITY_ICONS,
  ...EQUIPMENT_CRAFTING_ICONS,
  ...STATUS_BUFF_ICONS,
  ...SHARD_FUSION_ICONS,
  ...DUNGEON_EVENT_ICONS,
  PORTAL: createIcon("M11 2a1 1 0 00-1 1v2H6a1 1 0 000 2h4v2a1 1 0 002 0V7h4a1 1 0 000-2h-4V3a1 1 0 00-1-1zm-2 7a4 4 0 118 0 4 4 0 01-8 0zm4-3a1 1 0 100 2 1 1 0 000-2zm-7 5a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1zm10 0a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z"), // Example Portal Icon
};
