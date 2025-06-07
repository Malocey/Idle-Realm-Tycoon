import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { ICONS } from './Icons';
import { RunBuffDefinition, RunBuffRarity } from '../types';
import { getRarityTextClass } from '../utils/uiHelpers'; // Updated import

interface RunBuffSelectionModalProps extends Omit<ModalProps, 'title' | 'children' | 'onClose'> {
  isOpen: boolean;
  offeredBuffIds: string[];
  onSelectBuff: (buffId: string) => void;
}

const RunBuffSelectionModal: React.FC<RunBuffSelectionModalProps> = ({ isOpen, offeredBuffIds, onSelectBuff }) => {
  const { staticData } = useGameContext();
  const { runBuffDefinitions } = staticData;

  if (!isOpen || !offeredBuffIds || offeredBuffIds.length === 0) {
    return null;
  }

  // Removed local getRarityColor function

  return (
    <Modal isOpen={isOpen} onClose={() => { /* Modal closes by selecting a buff */ }} title="Choose a Run Buff!" size="lg">
      <div className="space-y-3">
        {offeredBuffIds.map(buffId => {
          const buffDef = runBuffDefinitions[buffId];
          if (!buffDef) return null;
          const BuffIcon = ICONS[buffDef.iconName] || ICONS.UPGRADE; // Fallback icon
          const rarityColorClass = getRarityTextClass(buffDef.rarity); // Use imported helper

          return (
            <Button
              key={buffDef.id}
              onClick={() => onSelectBuff(buffDef.id)}
              variant="secondary"
              className="w-full p-4 text-left hover:bg-slate-600 transition-all duration-150 border border-slate-600 hover:border-sky-500"
            >
              <div className="flex items-start space-x-3">
                {BuffIcon && <BuffIcon className={`w-8 h-8 flex-shrink-0 mt-1 ${rarityColorClass}`} />}
                <div>
                  <h4 className={`text-md font-semibold ${rarityColorClass}`}>{buffDef.name}</h4>
                  <p className="text-xs text-slate-400">{buffDef.description}</p>
                  <p className={`text-xs font-bold mt-1 ${rarityColorClass}`}>{buffDef.rarity}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Modal>
  );
};

export default RunBuffSelectionModal;