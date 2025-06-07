
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import GuildHallUpgradeCard from './GuildHallUpgradeCard'; // New Card component

interface GuildHallUpgradeModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const GuildHallUpgradeModal: React.FC<GuildHallUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { staticData } = useGameContext();
  const guildHallUpgrades = Object.values(staticData.guildHallUpgradeDefinitions);

  const guildHallBuilding = useGameContext().gameState.buildings.find(b => b.id === 'GUILD_HALL');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Guild Hall Upgrades (Lvl ${guildHallBuilding?.level || 0})`} size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto fancy-scrollbar pr-2">
        {guildHallUpgrades.length > 0 ? (
          guildHallUpgrades.map(upgradeDef => (
            <GuildHallUpgradeCard key={upgradeDef.id} upgradeDef={upgradeDef} />
          ))
        ) : (
          <p className="text-slate-400">No upgrades defined for the Guild Hall yet.</p>
        )}
      </div>
    </Modal>
  );
};

export default GuildHallUpgradeModal;
