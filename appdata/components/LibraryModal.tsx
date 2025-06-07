
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import LibraryRunBuffCard from './LibraryRunBuffCard'; 

interface LibraryModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose }) => {
  const { gameState, staticData } = useGameContext();
  const { runBuffDefinitions } = staticData;
  const { unlockedRunBuffs, runBuffLibraryLevels } = gameState;

  const allBuffs = Object.values(runBuffDefinitions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Library - Buff Compendium" size="xl">
      <p className="text-slate-400 mb-4 text-sm">
        Browse available dungeon run enhancements. Unlock new buffs and upgrade existing ones to bolster your dungeon expeditions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto fancy-scrollbar pr-2">
        {allBuffs.length > 0 ? (
          allBuffs.map(buffDef => (
            <LibraryRunBuffCard 
              key={buffDef.id} 
              buffDef={buffDef}
              // Props below are now read from gameState within LibraryRunBuffCard or passed implicitly
              // currentLibraryLevel={runBuffLibraryLevels[buffDef.id] || 0} 
              // isUnlocked={unlockedRunBuffs.includes(buffDef.id)} 
            />
          ))
        ) : (
          <p className="text-slate-400 col-span-full text-center py-4">No run buffs defined yet.</p>
        )}
      </div>
    </Modal>
  );
};

export default LibraryModal;
