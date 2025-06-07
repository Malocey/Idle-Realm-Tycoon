
import { RunBuffDefinition } from '../../types';
import { COMMON_RUN_BUFFS } from './runBuffs/common';
import { UNCOMMON_RUN_BUFFS } from './runBuffs/uncommon';
import { RARE_RUN_BUFFS } from './runBuffs/rare';
import { EPIC_RUN_BUFFS } from './runBuffs/epic';
import { LEGENDARY_RUN_BUFFS } from './runBuffs/legendary';
import { MYTHIC_RUN_BUFFS } from './runBuffs/mythic';

export const RUN_BUFF_DEFINITIONS: Record<string, RunBuffDefinition> = {
  ...COMMON_RUN_BUFFS,
  ...UNCOMMON_RUN_BUFFS,
  ...RARE_RUN_BUFFS,
  ...EPIC_RUN_BUFFS,
  ...LEGENDARY_RUN_BUFFS,
  ...MYTHIC_RUN_BUFFS,
};
