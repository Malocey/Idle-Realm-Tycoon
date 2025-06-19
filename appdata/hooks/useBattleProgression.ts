
import { useEffect } from 'react';
import { GameState, GameAction, Cost, BattleState, BattleHero } from '../types';
import { WAVE_DEFINITIONS }  from '../gameData/index';
import { MAX_WAVE_NUMBER, NOTIFICATION_ICONS } from '../constants';
import { ICONS } from '../components/Icons'; // Import ICONS

export const useBattleProgression = (
  dispatch: React.Dispatch<GameAction>,
  battleState: GameState['battleState']
) => {
  useEffect(() => {
    let autoProgressionTimerId: number | undefined;

    if (battleState && (battleState.status === 'VICTORY' || battleState.status === 'DEFEAT')) {
      const currentBattleState = battleState; // Capture the state at this point

      if (currentBattleState.isDungeonGridBattle) {
        // Dungeon grid battles are handled by their own flow after END_BATTLE
        return;
      }
      
      if (currentBattleState.isDemoniconBattle) {
        const demoniconOutcome = currentBattleState.status as 'VICTORY' | 'DEFEAT';
        // Demonicon progression is handled within its own reducer via END_BATTLE
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
      } else { // Normal Wave Battles or Custom Map Sequence Battles
        const {
          waveNumber, 
          heroes: heroesInCompletedBattle,
          status: outcome,
          buildingLevelUpEventsInBattle,
          defeatedEnemiesWithLoot,
          customWaveSequence, 
          currentCustomWaveIndex, 
          sourceMapNodeId,
          sessionTotalLoot, // Added
          sessionTotalExp   // Added
        } = currentBattleState;

        if (waveNumber === undefined && !(customWaveSequence && currentCustomWaveIndex !== undefined)) return;


        const isCustomMapSequence = !!(customWaveSequence && currentCustomWaveIndex !== undefined && sourceMapNodeId);
        
        const waveDef = isCustomMapSequence 
          ? WAVE_DEFINITIONS.find(w => w.id === customWaveSequence[currentCustomWaveIndex!])
          : WAVE_DEFINITIONS.find(w => w.waveNumber === waveNumber);
        
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
          
          const defeatedEnemyOriginalIdsForQuestProcessing = Object.values(defeatedEnemiesWithLoot || {})
              .map((data: { loot: Cost[], originalIconName: string, originalEnemyId: string }) => data.originalEnemyId)
              .filter(id => !!id);
          
          const previousBattleOutcomeForQuestProcessing = {
              lootCollected: [...lootForDistribution],
              defeatedEnemyOriginalIds: defeatedEnemyOriginalIdsForQuestProcessing,
              waveNumberReached: isCustomMapSequence ? (currentCustomWaveIndex! + 1) : (waveNumber || 0),
          };

          if (survivingHeroes.length > 0) {
            const persistedHp: Record<string, number> = {};
            const persistedMana: Record<string, number> = {};
            const persistedCooldowns: Record<string, Record<string, number>> = {};
            const persistedFullHeroStatesFromPreviousWave: Record<string, BattleHero> = {};


            survivingHeroes.forEach(h => {
              persistedHp[h.definitionId] = h.currentHp;
              persistedMana[h.definitionId] = h.currentMana;
              persistedCooldowns[h.definitionId] = { ...h.specialAttackCooldownsRemaining };
              persistedFullHeroStatesFromPreviousWave[h.definitionId] = { ...h }; // Persist full state
            });

            if (isCustomMapSequence) {
              const nextCustomWaveIndex = currentCustomWaveIndex! + 1;
              if (nextCustomWaveIndex < customWaveSequence.length) {
                dispatch({
                  type: 'ADD_NOTIFICATION',
                  payload: {
                    message: `Wave ${currentCustomWaveIndex! + 1} of ${customWaveSequence.length} cleared! Proceeding...`,
                    type: 'info',
                    iconName: ICONS.ARROW_UP ? 'ARROW_UP' : undefined,
                  }
                });
                autoProgressionTimerId = window.setTimeout(() => {
                  dispatch({
                    type: 'START_BATTLE_PREPARATION',
                    payload: {
                      waveNumber: 0, 
                      isAutoProgression: true,
                      persistedHeroHp: persistedHp,
                      persistedHeroMana: persistedMana,
                      persistedHeroSpecialCooldowns: persistedCooldowns,
                      persistedFullHeroStatesFromPreviousWave, 
                      rewardsForPreviousWave: lootForDistribution,
                      expFromPreviousWave: expFromThisWaveEnemies,
                      previousWaveNumberCleared: currentCustomWaveIndex, 
                      buildingLevelUpEventsFromPreviousWave: buildingLevelUpEventsInBattle,
                      previousBattleOutcomeForQuestProcessing,
                      sourceMapNodeId: sourceMapNodeId, 
                      customWaveSequence: customWaveSequence, 
                      currentCustomWaveIndex: nextCustomWaveIndex,
                      persistedSessionTotalLoot: sessionTotalLoot || [], // Pass session totals
                      persistedSessionTotalExp: sessionTotalExp || 0    // Pass session totals
                    }
                  });
                }, 1200);
              } else {
                dispatch({ type: 'END_BATTLE', payload: { outcome: 'VICTORY', collectedLoot: lootForDistribution, expRewardToHeroes: expFromThisWaveEnemies } });
              }
            } else if (waveNumber) { // Normal wave progression
              if (waveNumber < MAX_WAVE_NUMBER) {
                const nextWaveNumber = waveNumber + 1;
                dispatch({
                  type: 'ADD_NOTIFICATION',
                  payload: {
                    message: `Wave ${waveNumber} cleared! Proceeding to Wave ${nextWaveNumber}...`,
                    type: 'info',
                    iconName: NOTIFICATION_ICONS.info,
                  }
                });
                autoProgressionTimerId = window.setTimeout(() => {
                  dispatch({
                    type: 'START_BATTLE_PREPARATION',
                    payload: {
                      waveNumber: nextWaveNumber,
                      isAutoProgression: true,
                      persistedHeroHp: persistedHp,
                      persistedHeroMana: persistedMana,
                      persistedHeroSpecialCooldowns: persistedCooldowns,
                      persistedFullHeroStatesFromPreviousWave, 
                      rewardsForPreviousWave: lootForDistribution,
                      expFromPreviousWave: expFromThisWaveEnemies,
                      previousWaveNumberCleared: waveNumber,
                      buildingLevelUpEventsFromPreviousWave: buildingLevelUpEventsInBattle,
                      previousBattleOutcomeForQuestProcessing,
                      persistedSessionTotalLoot: sessionTotalLoot || [], // Pass session totals
                      persistedSessionTotalExp: sessionTotalExp || 0    // Pass session totals
                    }
                  });
                }, 1200);
              } else {
                dispatch({ type: 'END_BATTLE', payload: { outcome: 'VICTORY', waveClearBonus: waveDef?.reward, collectedLoot: lootForDistribution, expRewardToHeroes: expFromThisWaveEnemies } });
              }
            }
          } else { 
             dispatch({ type: 'END_BATTLE', payload: { outcome: 'DEFEAT', collectedLoot: lootForDistribution, expRewardToHeroes: expFromThisWaveEnemies } });
          }
        } else { // DEFEAT
          autoProgressionTimerId = window.setTimeout(() => {
            dispatch({ type: 'END_BATTLE', payload: { outcome: 'DEFEAT', collectedLoot: lootForDistribution, expRewardToHeroes: expFromThisWaveEnemies } });
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
}