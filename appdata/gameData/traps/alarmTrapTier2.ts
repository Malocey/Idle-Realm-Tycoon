
import { TrapDefinition, ResourceType } from '../../types';

export const ALARM_TRAP_TIER2_DEFINITION: TrapDefinition = {
  id: 'ALARM_TRAP_TIER2',
  name: 'Piercing Alarm Trap',
  descriptionWhenTriggered: 'An ear-splitting alarm echoes, surely alerting nearby dangers!',
  effectDescription: 'High chance of triggering an additional elite encounter (currently flavor text).',
  visibility: 'HIDDEN_UNTIL_TRIGGERED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
