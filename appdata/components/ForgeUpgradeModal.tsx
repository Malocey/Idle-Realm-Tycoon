
import React, { useState } from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import EquipmentUpgradeCard from './EquipmentUpgradeCard';
import { HeroDefinition } from '../types';

interface ForgeUpgradeModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const ForgeUpgradeModal: React.FC<ForgeUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { gameState, staticData } = useGameContext();
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(
    gameState.heroes.length > 0 ? gameState.heroes[0].definitionId : null
  );

  const recruitedHeroDefinitions = gameState.heroes.map(h => staticData.heroDefinitions[h.definitionId]).filter(Boolean) as HeroDefinition[];

  const heroEquipment = selectedHeroId 
    ? Object.values(staticData.equipmentDefinitions).filter(eq => eq.heroDefinitionId === selectedHeroId)
    : [];

  const forgeBuilding = gameState.buildings.find(b => b.id === 'FORGE');
  const currentForgeLevel = forgeBuilding ? forgeBuilding.level : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forge - Upgrade Equipment" size="xl">
      {recruitedHeroDefinitions.length === 0 ? (
        <p className="text-slate-400">Recruit heroes to upgrade their equipment.</p>
      ) : (
        <>
          <div className="mb-4 flex space-x-2 border-b border-slate-700 pb-2">
            {recruitedHeroDefinitions.map(heroDef => (
              <button
                key={heroDef.id}
                onClick={() => setSelectedHeroId(heroDef.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors
                  ${selectedHeroId === heroDef.id 
                    ? 'bg-sky-600 text-white font-semibold' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
              >
                {heroDef.name}
              </button>
            ))}
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto fancy-scrollbar pr-2">
            {selectedHeroId && heroEquipment.length > 0 ? (
              heroEquipment.map(equipDef => {
                const heroState = gameState.heroes.find(h => h.definitionId === selectedHeroId);
                if (!heroState) return null;
                return (
                  <EquipmentUpgradeCard 
                    key={equipDef.id} 
                    heroState={heroState} 
                    equipmentDef={equipDef} 
                    forgeLevel={currentForgeLevel} // Pass forge level
                  />
                );
              })
            ) : selectedHeroId ? (
              <p className="text-slate-400">No equipment defined for {staticData.heroDefinitions[selectedHeroId]?.name || 'this hero'}.</p>
            ) : (
               <p className="text-slate-400">Select a hero to see their equipment.</p>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

export default ForgeUpgradeModal;