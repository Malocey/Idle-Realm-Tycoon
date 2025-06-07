
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import TownHallUpgradeCard from './TownHallUpgradeCard';

interface TownHallUpgradeModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const TownHallUpgradeModal: React.FC<TownHallUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { staticData } = useGameContext();
  const townHallUpgrades = Object.values(staticData.townHallUpgradeDefinitions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Town Hall - Global Upgrades" size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto fancy-scrollbar pr-2">
        {townHallUpgrades.length > 0 ? (
          townHallUpgrades.map(upgradeDef => (
            <TownHallUpgradeCard key={upgradeDef.id} upgradeDef={upgradeDef} />
          ))
        ) : (
          <p className="text-slate-400">No global upgrades defined for the Town Hall.</p>
        )}
      </div>
    </Modal>
  );
};

export default TownHallUpgradeModal;
