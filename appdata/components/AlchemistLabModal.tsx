
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import { PotionCraftingCard } from './PotionCraftingCard';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';
import { GAME_TICK_MS } from '../constants';


interface AlchemistLabModalProps extends Omit<ModalProps, 'title' | 'children'> {}

export const AlchemistLabModal: React.FC<AlchemistLabModalProps> = ({ isOpen, onClose }) => {
  const { gameState, staticData } = useGameContext();
  const { craftingQueue, gameSpeed } = gameState;
  const { potionDefinitions } = staticData;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alchemist's Lab - Potion Brewing" size="xl">
      <div className="space-y-6">
        {/* Crafting Queue Section */}
        <div>
          <h3 className="text-lg font-semibold text-amber-300 mb-2">Brewing Queue</h3>
          {craftingQueue.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto fancy-scrollbar pr-2">
              {craftingQueue.map((item, index) => {
                const def = potionDefinitions[item.potionId];
                const Icon = ICONS[def?.iconName || 'STAFF_ICON'];
                const progressPercentage = item.totalCraftTimeMs > 0 
                  ? ((item.totalCraftTimeMs - item.remainingCraftTimeMs) / item.totalCraftTimeMs) * 100 
                  : 0;
                
                const estimatedTimeRemaining = item.remainingCraftTimeMs / 1000;


                return (
                  <div key={item.id} className="p-3 bg-slate-700/70 rounded-md border border-slate-600">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {Icon && <Icon className="w-6 h-6 mr-2 text-sky-400" />}
                        <span className="text-slate-200 font-medium">{def?.name || 'Unknown Potion'} x {item.quantity}</span>
                      </div>
                      {index === 0 && item.remainingCraftTimeMs > 0 && (
                        <span className="text-xs text-amber-400">
                          {formatNumber(Math.ceil(estimatedTimeRemaining))}s left
                        </span>
                      )}
                       {index > 0 && (
                        <span className="text-xs text-slate-500">Queued</span>
                      )}
                    </div>
                    {index === 0 && item.remainingCraftTimeMs > 0 && (
                      <div className="mt-1.5 w-full bg-slate-600 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-150 ease-linear"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 italic">The alchemy queue is empty. Add potions below.</p>
          )}
        </div>

        {/* Available Potions Section */}
        <div>
          <h3 className="text-lg font-semibold text-sky-300 mb-3 pt-4 border-t border-slate-700">Available Potions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[calc(70vh-200px-60px)] overflow-y-auto fancy-scrollbar pr-2"> {/* Adjusted max-h */}
            {Object.values(potionDefinitions).map(potionDef => (
              <PotionCraftingCard key={potionDef.id} potionDef={potionDef} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AlchemistLabModal;
