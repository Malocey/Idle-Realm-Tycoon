
import { TrapDefinition, ResourceType } from '../../types';

export const ALARM_TRAP_TIER1_DEFINITION: TrapDefinition = {
  id: 'ALARM_TRAP_TIER1',
  name: 'Alarm Trap',
  descriptionWhenTriggered: 'A loud alarm sounds, possibly attracting more foes!',
  effectDescription: 'May trigger an additional encounter (currently flavor text).',
  visibility: 'HIDDEN_UNTIL_TRIGGERED',
  iconNameWhenVisible: 'TRAP_ICON',
  iconNameWhenTriggered: 'TRAP_TRIGGERED_ICON',
};
