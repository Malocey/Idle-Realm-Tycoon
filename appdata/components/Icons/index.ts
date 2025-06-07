import { IconComponent } from '../../types';
import { RESOURCE_ICONS } from './resourceIcons';
import { MINIGAME_RESOURCE_ICONS } from './minigameResourceIcons';
import { UI_ELEMENT_ICONS } from './uiElementIcons';
import { COMBAT_ABILITY_ICONS } from './combatAndAbilityIcons';
import { EQUIPMENT_CRAFTING_ICONS } from './equipmentAndCraftingIcons';
import { STATUS_BUFF_ICONS } from './statusAndBuffIcons';
import { SHARD_FUSION_ICONS } from './shardAndFusionIcons';
import { DUNGEON_EVENT_ICONS } from './dungeonAndEventIcons';

export const ICONS: Record<string, IconComponent> = {
  ...RESOURCE_ICONS,
  ...MINIGAME_RESOURCE_ICONS,
  ...UI_ELEMENT_ICONS,
  ...COMBAT_ABILITY_ICONS,
  ...EQUIPMENT_CRAFTING_ICONS,
  ...STATUS_BUFF_ICONS,
  ...SHARD_FUSION_ICONS,
  ...DUNGEON_EVENT_ICONS,
};