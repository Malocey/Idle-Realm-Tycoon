
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import BuildingSpecificUpgradeCard from './BuildingSpecificUpgradeCard'; // New Card component
// FIX: Corrected import path for BUILDING_DEFINITIONS
import { BUILDING_DEFINITIONS } from '../gameData/index';

interface BuildingSpecificUpgradeModalProps extends Omit<ModalProps, 'title' | 'children'> {
  buildingId: string;
}

const BuildingSpecificUpgradeModal: React.FC<BuildingSpecificUpgradeModalProps> = ({ isOpen, onClose, buildingId }) => {
  const { staticData } = useGameContext();
  
  const buildingDef = BUILDING_DEFINITIONS[buildingId];
  const upgradesForBuilding = staticData.buildingSpecificUpgradeDefinitions[buildingId] || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${buildingDef?.name || 'Building'} - Specific Upgrades`} size="lg">
      <div className="space-y-3 max-h-[70vh] overflow-y-auto fancy-scrollbar pr-2">
        {upgradesForBuilding.length > 0 ? (
          upgradesForBuilding.map(upgradeDef => (
            <BuildingSpecificUpgradeCard 
              key={upgradeDef.id} 
              upgradeDef={upgradeDef} 
            />
          ))
        ) : (
          <p className="text-slate-400">No specific upgrades defined for this building.</p>
        )}
      </div>
    </Modal>
  );
};

export default BuildingSpecificUpgradeModal;