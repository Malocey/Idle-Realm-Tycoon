
import React from 'react';
import Modal, { ModalProps } from './Modal';
import { PlayerActiveRunBuff, RunBuffDefinition, RunBuffRarity } from '../types';
import { ICONS } from './Icons';
import { getRarityTextClass } from '../utils/uiHelpers'; // Updated import

interface ActiveRunBuffsInfoModalProps extends Omit<ModalProps, 'title' | 'children'> {
  activeBuffs: PlayerActiveRunBuff[];
  buffDefinitions: Record<string, RunBuffDefinition>;
}

const ActiveRunBuffsInfoModal: React.FC<ActiveRunBuffsInfoModalProps> = ({ isOpen, onClose, activeBuffs, buffDefinitions }) => {

  // Removed local getRarityColor function

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Run Buffs" size="md">
      {activeBuffs.length === 0 ? (
        <p className="text-slate-400 text-center">No active run buffs.</p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto fancy-scrollbar pr-1">
          {activeBuffs.map(activeBuff => {
            const buffDef = buffDefinitions[activeBuff.definitionId];
            if (!buffDef) return null;
            const BuffIcon = ICONS[buffDef.iconName] || ICONS.UPGRADE;
            const rarityColorClass = getRarityTextClass(buffDef.rarity); // Use imported helper

            return (
              <div key={buffDef.id + activeBuff.stacks} className="p-3 bg-slate-700/50 rounded-md border border-slate-600">
                <div className="flex items-start space-x-3">
                  {BuffIcon && <BuffIcon className={`w-7 h-7 flex-shrink-0 mt-0.5 ${rarityColorClass}`} />}
                  <div>
                    <h4 className={`text-md font-semibold ${rarityColorClass}`}>
                      {buffDef.name} {activeBuff.stacks > 1 && `(x${activeBuff.stacks})`}
                    </h4>
                    <p className="text-xs text-slate-300">{buffDef.description}</p>
                    <p className={`text-xs font-medium mt-0.5 ${rarityColorClass}`}>{buffDef.rarity}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ActiveRunBuffsInfoModal;
