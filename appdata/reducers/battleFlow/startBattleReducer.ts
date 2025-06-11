
import { GameState, GameAction, GlobalBonuses, BattleHero, BattleEnemy, Cost, ResourceType, GameNotification, BattleState, BuildingLevelUpEventInBattle, WaveDefinition, EnemyChannelingAbilityDefinition } from '../../types';
import { HERO_DEFINITIONS, SKILL_TREES, WAVE_DEFINITIONS, ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, worldMapDefinitions } from '../../gameData/index';
import { calculateHeroStats, calculateWaveEnemyStats, getExpToNextHeroLevel, formatNumber } from '../../utils';
import { MAX_WAVE_NUMBER, NOTIFICATION_ICONS } from '../../constants';
import { ICONS } from '../../components/Icons';
import { waveBattleFlowReducer } from './waveBattleFlowReducer'; // Ensure this is imported

type StartWaveBattlePreparationPayload = Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>['payload'];

interface StartBattleReducerResult {
  updatedState: GameState;
  deferredActions: GameAction[];
}

export const startBattleReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'START_WAVE_BATTLE_PREPARATION' }>,
  globalBonuses: GlobalBonuses
): StartBattleReducerResult => {
  if (action.type !== 'START_WAVE_BATTLE_PREPARATION') {
    return { updatedState: state, deferredActions: [] };
  }
  
  // Call waveBattleFlowReducer for the preparation logic
  const waveBattleResult = waveBattleFlowReducer(state, action, globalBonuses);
  let nextState = waveBattleResult.updatedState;
  const deferredFromWaveBattle = waveBattleResult.deferredActions;

  // Additional logic from the original startBattleReducer related to Account XP can remain here if needed,
  // or ensure it's fully consolidated into waveBattleFlowReducer if that's cleaner.
  // For now, assuming waveBattleFlowReducer handles all deferred action generation for this step.
  
  // If startBattleReducer itself generates more deferred actions, they would be added here:
  const deferredFromStartBattleItself: GameAction[] = [];
  // Example:
  // if (some_condition_in_startBattleReducer) {
  //   deferredFromStartBattleItself.push({ type: 'SOME_OTHER_ACTION', payload: {} });
  // }

  return {
    updatedState: nextState,
    deferredActions: [...deferredFromWaveBattle, ...deferredFromStartBattleItself]
  };
};