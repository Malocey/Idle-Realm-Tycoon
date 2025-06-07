

import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { ICONS } from './Icons';
import { RESOURCE_COLORS } from '../constants';
import { formatNumber, canAfford } from '../utils';
import { ResourceType } from '../types';

interface DungeonSelectionModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const DungeonSelectionModal: React.FC<DungeonSelectionModalProps> = ({ isOpen, onClose }) => {
  const { gameState, dispatch, staticData } = useGameContext();

  const explorerGuild = gameState.buildings.find(b => b.id === 'EXPLORERS_GUILD');

  const availableDungeons = Object.values(staticData.dungeonDefinitions).filter(dungeonDef => {
    return explorerGuild && explorerGuild.level >= dungeonDef.minExplorerGuildLevel;
  });

  const handleEnterDungeon = (dungeonId: string, floorIndex: number = 0) => {
    // The reducer will handle resuming vs. starting new logic.
    dispatch({ type: 'START_DUNGEON_EXPLORATION', payload: { dungeonId, floorIndex } });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Dungeon" size="lg">
      <div className="space-y-3 max-h-[70vh] overflow-y-auto fancy-scrollbar pr-2">
        {availableDungeons.length > 0 ? (
          availableDungeons.map(dungeonDef => {
            const isCurrentDungeonRunActive = gameState.activeDungeonRun?.dungeonDefinitionId === dungeonDef.id;
            const playerCanAffordInitialEntry = canAfford(gameState.resources, dungeonDef.entryCost);
            
            let buttonText = "Enter Dungeon";
            let cannotStartReason: string | null = null;
            let isDisabled = false;

            if (isCurrentDungeonRunActive) {
                buttonText = "Resume Dungeon";
            } else if (gameState.activeDungeonRun && gameState.activeDungeonRun.dungeonDefinitionId !== dungeonDef.id) {
                // Button text remains "Enter Dungeon", but implies abandoning the current one.
                // The reducer will handle abandoning the old run.
            }

            if (gameState.battleState && gameState.battleState.status === 'FIGHTING') {
                cannotStartReason = "Cannot start while a battle is active.";
                isDisabled = true;
            } else if (!isCurrentDungeonRunActive && !playerCanAffordInitialEntry) {
                cannotStartReason = "Not enough resources for initial entry.";
                isDisabled = true;
            }


            return (
              <div key={dungeonDef.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-xl font-semibold text-amber-300 mb-1">{dungeonDef.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{dungeonDef.description}</p>
                <p className="text-xs text-slate-400 mb-1">Floors: {dungeonDef.floors.length}</p>
                <div className="text-xs text-slate-400 mb-2">
                  Entry Cost: {dungeonDef.entryCost.map((cost, idx) => (
                    <span key={idx} className={`ml-1 ${RESOURCE_COLORS[cost.resource] || 'text-slate-300'} ${gameState.resources[cost.resource] < cost.amount && !isCurrentDungeonRunActive ? 'text-red-400' : ''}`}>
                      {ICONS[cost.resource] && React.createElement(ICONS[cost.resource], { className: "inline w-3 h-3 mr-0.5" })}
                      {formatNumber(cost.amount)} {cost.resource.replace(/_/g, ' ')}
                      {!isCurrentDungeonRunActive && ` / ${formatNumber(gameState.resources[cost.resource] || 0)}`}
                    </span>
                  ))}
                </div>
                {dungeonDef.finalReward.resourceCache && dungeonDef.finalReward.resourceCache.length > 0 && (
                    <p className="text-xs text-green-400 mb-1">Potential Cache: {dungeonDef.finalReward.resourceCache.map(c => `${formatNumber(c.amount)} ${c.resource.replace(/_/g, ' ')}`).join(', ')}</p>
                )}
                <p className="text-xs text-sky-400 mb-2">Reward: Choice of 1 permanent hero buff from {dungeonDef.finalReward.permanentBuffChoices + (gameState.townHallUpgradeLevels['THU_DungeonPathfinding'] || 0)} options.</p>
                
                <Button
                  onClick={() => handleEnterDungeon(dungeonDef.id, isCurrentDungeonRunActive ? gameState.activeDungeonRun!.currentFloorIndex : 0)}
                  disabled={isDisabled}
                  className="w-full mt-2"
                  variant={isCurrentDungeonRunActive ? "success" : "primary"}
                  icon={ICONS.COMPASS && <ICONS.COMPASS className="w-4 h-4"/>}
                  title={cannotStartReason || `${buttonText} ${dungeonDef.name}`}
                >
                  {buttonText}
                </Button>
                { cannotStartReason && <p className="text-xs text-amber-400 mt-1">{cannotStartReason}</p>}
              </div>
            );
          })
        ) : (
          <p className="text-slate-400">No dungeons available. Upgrade your Explorer's Guild or check definitions.</p>
        )}
      </div>
    </Modal>
  );
};

export default DungeonSelectionModal;
