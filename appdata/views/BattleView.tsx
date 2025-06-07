
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context';
import { ICONS } from '../components/Icons';
import { NOTIFICATION_ICONS, MAX_WAVE_NUMBER, RESOURCE_COLORS } from '../constants';
// FIX: Korrigierter Importpfad für Spieldatendefinitionen
import { WAVE_DEFINITIONS, ENEMY_DEFINITIONS } from '../gameData/index';
import BattleParticipantCard from '../components/BattleParticipantCard';
import Button from '../components/Button';
// Modal-Import entfernt, da es hier nicht mehr für die Wellenauswahl verwendet wird.
import { GameNotification, ResourceType, Cost, PotionDefinition } from '../types';
import { formatNumber } from '../utils';
import BattleSpoilsPanel from '../components/BattleSpoilsPanel';
// DemoniconContinueModal-Import wurde entfernt, da die Progression automatisch erfolgt

const RESOURCE_PILL_COLORS: Record<ResourceType, { bg: string; border: string }> = {
  [ResourceType.GOLD]: { bg: 'bg-yellow-400', border: 'border-yellow-500' },
  [ResourceType.WOOD]: { bg: 'bg-amber-600', border: 'border-amber-700' },
  [ResourceType.STONE]: { bg: 'bg-gray-400', border: 'border-gray-500' },
  [ResourceType.FOOD]: { bg: 'bg-lime-500', border: 'border-lime-600' },
  [ResourceType.IRON]: { bg: 'bg-slate-400', border: 'border-slate-500' },
  [ResourceType.CRYSTALS]: { bg: 'bg-cyan-400', border: 'border-cyan-500' },
  [ResourceType.LEATHER]: { bg: 'bg-orange-400', border: 'border-orange-500' },
  [ResourceType.TOWN_XP]: { bg: 'bg-sky-400', border: 'border-sky-500' },
  [ResourceType.HEROIC_POINTS]: { bg: 'bg-violet-400', border: 'border-violet-500' },
  [ResourceType.META_CURRENCY]: { bg: 'bg-pink-500', border: 'border-pink-600' },
  [ResourceType.GUILD_HALL_TOKEN]: { bg: 'bg-indigo-400', border: 'border-indigo-500' },
  [ResourceType.CATACOMB_KEY]: { bg: 'bg-purple-400', border: 'border-purple-500' },
  [ResourceType.CATACOMB_BLUEPRINT]: { bg: 'bg-blue-300', border: 'border-blue-400' },
  [ResourceType.AETHERIUM]: { bg: 'bg-fuchsia-400', border: 'border-fuchsia-500' },
  [ResourceType.HERB_BLOODTHISTLE]: { bg: 'bg-red-400', border: 'border-red-500' },
  [ResourceType.HERB_IRONWOOD_LEAF]: { bg: 'bg-teal-400', border: 'border-teal-500' },
  [ResourceType.MINIGAME_DIRT]: { bg: 'bg-amber-500', border: 'border-amber-600' },
  [ResourceType.MINIGAME_CLAY]: { bg: 'bg-stone-500', border: 'border-stone-600' },
  [ResourceType.MINIGAME_SAND]: { bg: 'bg-yellow-300', border: 'border-yellow-400' },
  [ResourceType.MINIGAME_ESSENCE]: { bg: 'bg-purple-300', border: 'border-purple-400' },
  [ResourceType.MINIGAME_CRYSTAL]: { bg: 'bg-sky-300', border: 'border-sky-400' },
  [ResourceType.MINIGAME_EMERALD]: { bg: 'bg-green-400', border: 'border-green-500' },
  [ResourceType.MINIGAME_RUBY]: { bg: 'bg-red-400', border: 'border-red-500' },
  [ResourceType.MINIGAME_SAPPHIRE]: { bg: 'bg-blue-400', border: 'border-blue-500' },
  [ResourceType.GOLD_ORE]: { bg: 'bg-yellow-600', border: 'border-yellow-700' },
  [ResourceType.DIAMOND_ORE]: { bg: 'bg-sky-200', border: 'border-sky-300' },
  [ResourceType.EMPTY]: { bg: 'bg-slate-700', border: 'border-slate-600' },
  [ResourceType.DIRT]: { bg: 'bg-orange-700', border: 'border-orange-800' },
  [ResourceType.OBSTACLE]: { bg: 'bg-gray-800', border: 'border-gray-900' },
  [ResourceType.SKILL_POINTS_TEMP]: { bg: 'bg-orange-300', border: 'border-orange-400' },
  [ResourceType.DEMONIC_COIN]: { bg: 'bg-rose-500', border: 'border-rose-600' },
};


const BattleView: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext();

  useEffect(() => {
    // Existing useEffect logic for wave battles can remain
  }, [gameState.battleState, gameState.activeView, gameState.activeDungeonRun]);


  const handleSelectWave = (waveNumber: number) => {
    const waveDef = WAVE_DEFINITIONS.find(w => w.waveNumber === waveNumber);
    if (waveDef) {
      if (gameState.heroes.length === 0) {
        const notificationPayload: Omit<GameNotification, 'id' | 'timestamp'> = {message: `Recruit at least one hero before starting a battle!`, type: 'warning', iconName: NOTIFICATION_ICONS.warning};
        dispatch({type: 'ADD_NOTIFICATION', payload: notificationPayload});
        return;
      }
      dispatch({ type: 'START_BATTLE_PREPARATION', payload: { waveNumber: waveNumber, isAutoProgression: false } });
    } else {
      const notificationPayload: Omit<GameNotification, 'id' | 'timestamp'> = {message: `Wave ${waveNumber} not found or not yet available.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning};
      dispatch({type: 'ADD_NOTIFICATION', payload: notificationPayload});
    }
  };
  
  const availableWavesForSelection = [];
  for (let i = 1; i <= Math.min(gameState.currentWaveProgress + 1, MAX_WAVE_NUMBER); i++) {
      if (WAVE_DEFINITIONS.find(wd => wd.waveNumber === i)) {
          availableWavesForSelection.push(i);
      }
  }
  if (gameState.currentWaveProgress >= MAX_WAVE_NUMBER && !availableWavesForSelection.includes(MAX_WAVE_NUMBER)) {
    if (WAVE_DEFINITIONS.find(wd => wd.waveNumber === MAX_WAVE_NUMBER)) {
        availableWavesForSelection.push(MAX_WAVE_NUMBER);
    }
  }

  const handlePotionSelect = (potionId: string) => {
    if (gameState.battleState?.activePotionIdForUsage === potionId) {
      dispatch({ type: 'SELECT_POTION_FOR_USAGE', payload: { potionId: null }});
    } else {
      dispatch({ type: 'SELECT_POTION_FOR_USAGE', payload: { potionId }});
    }
  };

  const handleHeroTarget = (heroUniqueBattleId: string) => {
    if (gameState.battleState?.activePotionIdForUsage) {
      dispatch({ type: 'USE_POTION_ON_HERO', payload: { targetHeroUniqueBattleId: heroUniqueBattleId }});
    }
  };

  const handleSetBattleTarget = (targetId: string | null) => {
    dispatch({ type: 'SET_BATTLE_TARGET', payload: { targetId } });
  };


  if (!gameState.battleState || gameState.battleState.status === 'IDLE') {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-3xl font-bold text-sky-400 mb-2 text-center">Battlefield</h2>
        <p className="mb-6 text-slate-300 text-center">Highest Wave Cleared: {gameState.currentWaveProgress}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWavesForSelection.length > 0 ? availableWavesForSelection.map(waveNum => {
                const waveDef = WAVE_DEFINITIONS.find(w => w.waveNumber === waveNum);
                const isNextWave = waveNum > gameState.currentWaveProgress;
                const waveIcon = isNextWave ? (ICONS.FIGHT && <ICONS.FIGHT className="w-6 h-6 mr-3 text-sky-200"/>) : (ICONS.REPLAY && <ICONS.REPLAY className="w-6 h-6 mr-3 text-slate-400"/>);
                
                const cardBaseStyle = "flex flex-col justify-between rounded-lg shadow-lg p-4 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 relative overflow-hidden";
                const nextWaveStyle = "bg-sky-600 hover:bg-sky-500 text-white focus:ring-sky-400";
                const farmWaveStyle = "bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-600 text-slate-300 focus:ring-sky-500";

                return (
                    <button 
                        key={waveNum}
                        onClick={() => handleSelectWave(waveNum)} 
                        className={`${cardBaseStyle} ${isNextWave ? nextWaveStyle : farmWaveStyle}`}
                    >
                        <div>
                            <div className="flex items-center mb-2">
                                {waveIcon}
                                <span className={`text-lg font-semibold ${isNextWave ? 'text-sky-100' : 'text-sky-400'}`}>
                                    {isNextWave ? `Start Wave ${waveNum}` : `Farm Wave ${waveNum}`}
                                    {isNextWave && ' (Next)'}
                                </span>
                            </div>
                            
                            {waveDef?.reward && waveDef.reward.length > 0 && (
                            <div className={`mt-2 pt-2 border-t ${isNextWave ? 'border-sky-500/50' : 'border-slate-700'}`}>
                                <span className={`text-xs font-medium ${isNextWave ? 'text-sky-200' : 'text-slate-400'}`}>Wave Clear Bonus:</span>
                                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                    {waveDef.reward.map((r: Cost, index: number) => {
                                        const IconComponent = ICONS[r.resource];
                                        const resourceName = r.resource.replace(/_/g, ' ');
                                        const formattedAmount = formatNumber(r.amount);
                                        const pillColors = RESOURCE_PILL_COLORS[r.resource] || { bg: 'bg-slate-700', border: 'border-slate-600' };

                                        return (
                                            <span 
                                                key={index} 
                                                className={`flex items-center text-sm font-semibold rounded-full px-2 py-0.5 border text-white
                                                            ${pillColors.bg} ${pillColors.border}`}
                                            >
                                                {IconComponent && <IconComponent className="inline w-3.5 h-3.5 mr-1 text-white" />}
                                                {formattedAmount}
                                                <span className="ml-1 uppercase text-xs">{resourceName}</span>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            )}
                        </div>
                        {isNextWave && <div className="mt-3 text-sm font-bold text-center">Challenge Next Wave!</div>}
                    </button>
                );
            }) : <p className="text-slate-400 text-center col-span-full">No waves currently available. Progress further or check definitions.</p>}
        </div>
      </div>
    );
  }

  const { 
    waveNumber, 
    heroes, 
    enemies, 
    battleLog, 
    status, 
    isDungeonBattle, 
    isDungeonGridBattle, 
    dungeonFloor, 
    dungeonRunId, 
    battleLootCollected, 
    battleExpCollected,   
    buildingLevelUpEventsInBattle, 
    activePotionIdForUsage,
    selectedTargetId,
    isDemoniconBattle,
    demoniconEnemyId,
    demoniconRank
  } = gameState.battleState;

  const dungeonDef = (isDungeonBattle || isDungeonGridBattle) && dungeonRunId ? staticData.dungeonDefinitions[dungeonRunId] : null;
  
  let battleTitle = `Wave ${waveNumber}`;
  if (isDungeonBattle || isDungeonGridBattle) {
    battleTitle = dungeonDef ? `${dungeonDef.name} - Floor ${dungeonFloor! + 1}` : "Dungeon Battle";
  } else if (isDemoniconBattle && demoniconEnemyId && demoniconRank !== undefined) {
    const enemyName = staticData.enemyDefinitions[demoniconEnemyId]?.name || "Unknown Enemy";
    const statusText = status === 'FIGHTING' && gameState.activeDemoniconChallenge ? "IN PROGRESS" : status.toUpperCase();
    battleTitle = `Demonicon: ${enemyName} - Rank ${demoniconRank + 1} - ${statusText}`;
  }


  const ownedPotionsArray = Object.entries(gameState.potions)
    .map(([potionId, quantity]) => ({
        potionId,
        quantity,
        definition: staticData.potionDefinitions[potionId]
    }))
    .filter(p => p.quantity > 0 && p.definition);

  let mainButtonText = "Return to Town";
  let mainButtonAction = () => {
    dispatch({type: 'SET_ACTIVE_VIEW', payload: 'TOWN'});
  };
  let showMainButton = true;

  // Logic for main button based on battle status and type
  if (status === 'VICTORY') {
    if (isDemoniconBattle) {
        // If auto-progression is successful, battleState.status will change to FIGHTING for the next rank.
        // So, if we are still in VICTORY status here, it means auto-progression *didn't* happen (e.g. all heroes died).
        showMainButton = true; 
        mainButtonText = "Return to Portal";
        mainButtonAction = () => dispatch({ type: 'CLEANUP_DEMONICON_STATE' });
    } else if (isDungeonGridBattle) {
      mainButtonText = "Return to Dungeon Map";
      mainButtonAction = () => dispatch({ type: 'END_BATTLE', payload: { outcome: 'VICTORY' } }); 
    } else { // Wave battle victory
      mainButtonText = "Return to Town"; 
      // Action for wave victory (final return) is handled by useBattleProgression if max wave, or auto-starts next wave.
      // This button becomes a manual "Return to Town" if auto-progression is somehow stuck or for the very final wave.
      mainButtonAction = () => dispatch({type: 'END_BATTLE', payload: { outcome: 'VICTORY', collectedLoot: battleLootCollected, expRewardToHeroes: battleExpCollected }});
    }
  } else if (status === 'DEFEAT') {
    mainButtonText = "Return to Town"; 
    if (isDemoniconBattle) {
       mainButtonText = "Return to Portal";
       mainButtonAction = () => dispatch({ type: 'CLEANUP_DEMONICON_STATE' });
    } else if (isDungeonGridBattle) {
        mainButtonAction = () => dispatch({ type: 'END_BATTLE', payload: { outcome: 'DEFEAT' } }); 
    } else if (isDungeonBattle) { 
      mainButtonAction = () => dispatch({ 
        type: 'END_DUNGEON_FLOOR', 
        payload: { 
            outcome: 'DEFEAT', 
            collectedLoot: gameState.battleState.battleLootCollected,
            collectedExp: gameState.battleState.battleExpCollected,
            buildingLevelUps: gameState.battleState.buildingLevelUpEventsInBattle
        } 
      });
    } else { // Wave Battle DEFEAT
        mainButtonAction = () => dispatch({
          type: 'END_BATTLE', 
          payload: { 
              outcome: 'DEFEAT', 
              collectedLoot: gameState.battleState.battleLootCollected,
              expRewardToHeroes: gameState.battleState.battleExpCollected
          }
      });
    }
  } else if (status === 'FIGHTING') { 
    if (isDemoniconBattle) {
        showMainButton = true; // Allow surrendering Demonicon
        mainButtonText = "Abandon Challenge";
        mainButtonAction = () => dispatch({ type: 'CLEANUP_DEMONICON_STATE' });
    } else if (isDungeonGridBattle) {
      mainButtonText = "Abandon Run";
      mainButtonAction = () => dispatch({ type: 'EXIT_DUNGEON_EXPLORATION', payload: { outcome: 'ABANDONED' } });
    } else if (isDungeonBattle) { 
      mainButtonText = "Abandon Run";
      mainButtonAction = () => dispatch({ 
        type: 'END_DUNGEON_FLOOR', 
        payload: { 
            outcome: 'DEFEAT', 
            collectedLoot: gameState.battleState.battleLootCollected,
            collectedExp: gameState.battleState.battleExpCollected,
            buildingLevelUps: gameState.battleState.buildingLevelUpEventsInBattle
        } 
      });
    } else { // Wave Battle
      mainButtonText = "Surrender & Return";
      mainButtonAction = () => dispatch({
          type: 'END_BATTLE', 
          payload: { 
              outcome: 'DEFEAT', 
              collectedLoot: gameState.battleState.battleLootCollected,
              expRewardToHeroes: gameState.battleState.battleExpCollected
          }
      });
    }
  }


  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-sky-400">{battleTitle}</h2>
          { (status === 'FIGHTING' || status === 'VICTORY' || status === 'DEFEAT') && (
            <BattleSpoilsPanel />
          )}
        </div>
        { showMainButton && (
            <Button onClick={mainButtonAction} variant="secondary" size="md">
                {mainButtonText}
            </Button>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-sky-300 mb-2">Your Heroes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {heroes.map(h => (
            <BattleParticipantCard 
              key={h.uniqueBattleId} 
              participant={h} 
              type="hero" 
              onClick={
                activePotionIdForUsage && h.currentHp > 0 
                ? () => handleHeroTarget(h.uniqueBattleId) 
                : undefined
              }
              isTargetable={activePotionIdForUsage && h.currentHp > 0}
            />
          ))}
        </div>
      </div>

      {status === 'FIGHTING' && ownedPotionsArray.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">Potions</h3>
          <div className="flex flex-wrap gap-3 p-2 bg-slate-800/50 rounded-md glass-effect">
            {ownedPotionsArray.map(({ potionId, quantity, definition }) => {
              const PotionIcon = ICONS[definition.iconName] || ICONS.STAFF_ICON;
              const isSelected = activePotionIdForUsage === potionId;
              return (
                <button
                  key={potionId}
                  onClick={() => handlePotionSelect(potionId)}
                  className={`p-2 rounded-lg border-2 transition-all duration-150 transform hover:scale-105
                              ${isSelected ? 'border-sky-400 bg-sky-600/30 ring-2 ring-sky-400' : 'border-slate-600 hover:border-slate-500 bg-slate-700/60'}
                              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75`}
                  title={`${definition.name} (x${quantity})\n${definition.description}`}
                  aria-pressed={isSelected}
                >
                  <div className="flex flex-col items-center w-16">
                    <PotionIcon className="w-8 h-8 mb-1 text-amber-400" />
                    <span className="text-xs text-slate-200">x{quantity}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-red-300 mb-2">Enemies</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {enemies.map(e => 
            <BattleParticipantCard 
              key={e.uniqueBattleId} 
              participant={e} 
              type="enemy" 
              onSetTarget={status === 'FIGHTING' ? handleSetBattleTarget : undefined}
              isSelectedTarget={selectedTargetId === e.uniqueBattleId}
            />
          )}
        </div>
      </div>
      
      <div className="bg-slate-800 p-3 rounded-lg h-32 overflow-y-auto fancy-scrollbar glass-effect">
        <h4 className="text-sm font-semibold text-slate-400 mb-1">Battle Log</h4>
        {battleLog.slice().reverse().map((log, index) => <p key={index} className="text-xs text-slate-300">{log}</p>)}
      </div>
    </div>
  );
};

export default BattleView;
