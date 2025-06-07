
import { useEffect } from 'react';
import { GameState, GameAction, Cost } from '../types';
import { WAVE_DEFINITIONS } from '../gameData/index';
import { MAX_WAVE_NUMBER, NOTIFICATION_ICONS } from '../constants';

export const useBattleProgression = (
  dispatch: React.Dispatch<GameAction>,
  battleState: GameState['battleState']
) => {
  useEffect(() => {
    let autoProgressionTimerId: number | undefined;

    if (battleState && (battleState.status === 'VICTORY' || battleState.status === 'DEFEAT')) {
      const currentBattleState = battleState; // Capture the state at this point

      if (currentBattleState.isDungeonGridBattle) {
        return;
      }

      if (currentBattleState.isDemoniconBattle) {
        const demoniconOutcome = currentBattleState.status as 'VICTORY' | 'DEFEAT'; 
        dispatch({
          type: 'END_BATTLE',
          payload: {
            outcome: demoniconOutcome,
            collectedLoot: currentBattleState.battleLootCollected, 
            expRewardToHeroes: currentBattleState.battleExpCollected, 
          },
        });
        return; 
      }

      if (currentBattleState.isDungeonBattle) {
        const outcomeForDungeon = currentBattleState.status === 'VICTORY' ? 'VICTORY' : 'DEFEAT';
        autoProgressionTimerId = window.setTimeout(() => {
          dispatch({
            type: 'END_DUNGEON_FLOOR',
            payload: {
              outcome: outcomeForDungeon,
              collectedLoot: currentBattleState.battleLootCollected,
              collectedExp: currentBattleState.battleExpCollected,
              buildingLevelUps: currentBattleState.buildingLevelUpEventsInBattle
            }
          });
        }, 100); 
      } else { 
        const {
          waveNumber,
          heroes: heroesInCompletedBattle,
          status: outcome,
          buildingLevelUpEventsInBattle, // This is from the completed wave
          defeatedEnemiesWithLoot
        } = currentBattleState;

        if (!waveNumber) return;

        const waveDef = WAVE_DEFINITIONS.find(w => w.waveNumber === waveNumber);
        let waveClearBonusLoot = outcome === 'VICTORY' ? waveDef?.reward : undefined;

        const expFromThisWaveEnemies = currentBattleState.battleExpCollected;
        
        const lootForDistribution: Cost[] = [...currentBattleState.battleLootCollected];
        if (waveClearBonusLoot) {
          waveClearBonusLoot.forEach(bonusLoot => {
            const existing = lootForDistribution.find(l => l.resource === bonusLoot.resource);
            if (existing) existing.amount += bonusLoot.amount;
            else lootForDistribution.push({ ...bonusLoot });
          });
        }

        if (outcome === 'VICTORY') {
          const survivingHeroes = heroesInCompletedBattle.filter(h => h.currentHp > 0);
          if (waveNumber < MAX_WAVE_NUMBER && survivingHeroes.length > 0) {
            const persistedHp: Record<string, number> = {};
            const persistedMana: Record<string, number> = {};
            const persistedCooldowns: Record<string, Record<string, number>> = {};

            survivingHeroes.forEach(h => {
              persistedHp[h.definitionId] = h.currentHp;
              persistedMana[h.definitionId] = h.currentMana;
              persistedCooldowns[h.definitionId] = { ...h.specialAttackCooldownsRemaining };
            });

            const nextWaveNumber = waveNumber + 1;
            dispatch({
              type: 'ADD_NOTIFICATION',
              payload: {
                message: `Wave ${waveNumber} cleared! Proceeding to Wave ${nextWaveNumber}...`,
                type: 'info',
                iconName: NOTIFICATION_ICONS.info
              }
            });

            const defeatedEnemyOriginalIdsForQuestProcessing = Object.values(defeatedEnemiesWithLoot)
                .map((data: { loot: Cost[], originalIconName: string, originalEnemyId: string }) => data.originalEnemyId)
                .filter(id => !!id);

            const previousBattleOutcomeForQuestProcessing = {
                lootCollected: [...lootForDistribution], 
                defeatedEnemyOriginalIds: defeatedEnemyOriginalIdsForQuestProcessing,
                waveNumberReached: waveNumber,
            };

            autoProgressionTimerId = window.setTimeout(() => {
              dispatch({
                type: 'START_BATTLE_PREPARATION',
                payload: {
                  waveNumber: nextWaveNumber,
                  isAutoProgression: true,
                  persistedHeroHp: persistedHp,
                  persistedHeroMana: persistedMana,
                  persistedHeroSpecialCooldowns: persistedCooldowns,
                  rewardsForPreviousWave: lootForDistribution, 
                  expFromPreviousWave: expFromThisWaveEnemies,
                  previousWaveNumberCleared: waveNumber,
                  buildingLevelUpEventsFromPreviousWave: buildingLevelUpEventsInBattle, // Corrected typo here
                  previousBattleOutcomeForQuestProcessing
                }
              });
            }, 1200); 
          } else { 
            dispatch({
              type: 'END_BATTLE',
              payload: {
                outcome: 'VICTORY',
                waveClearBonus: waveDef?.reward,
                collectedLoot: currentBattleState.battleLootCollected,
                expRewardToHeroes: currentBattleState.battleExpCollected
              }
            });
          }
        } else { 
          autoProgressionTimerId = window.setTimeout(() => {
            dispatch({
              type: 'END_BATTLE',
              payload: {
                outcome: 'DEFEAT',
                collectedLoot: currentBattleState.battleLootCollected, 
                expRewardToHeroes: currentBattleState.battleExpCollected 
              }
            });
          }, 100); 
        }
      }
    }
    return () => {
      if (autoProgressionTimerId) {
        clearTimeout(autoProgressionTimerId);
      }
    };
  }, [battleState?.status, dispatch]); 
};