
import React, { useState } from 'react';
import { useGameContext } from '../../context';
import Button from '../../components/Button';
import { ICONS } from '../../components/Icons';
import ForgeUpgradeModal from '../../components/ForgeUpgradeModal';
import LibraryModal from '../../components/LibraryModal';
import AlchemistLabModal from '../../components/AlchemistLabModal';
import AltarOfConvergenceModal from '../../components/AltarOfConvergenceModal';
import AcademyModal from '../../components/AcademyModal'; // Research Modal
import { ActiveView } from '../../types';

interface FacilityAction {
  id: string;
  name: string;
  description: string;
  iconName: keyof typeof ICONS;
  buildingRequirement?: string; 
  modalType?: 'forge' | 'library' | 'alchemist_lab' | 'altar' | 'research';
  actionType?: 'dispatch';
  dispatchAction?: any; 
}

const FacilitiesTabContent: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext();

  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isAlchemistLabModalOpen, setIsAlchemistLabModalOpen] = useState(false);
  const [isAltarModalOpen, setIsAltarModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  const facilities: FacilityAction[] = [
    {
      id: 'research',
      name: 'Research & Development',
      description: 'Unlock new technologies and improvements for your realm.',
      iconName: 'SETTINGS',
      buildingRequirement: 'ACADEMY_OF_SCHOLARS',
      modalType: 'research',
    },
    {
      id: 'forge',
      name: 'Equipment Forge',
      description: "Upgrade your heroes' equipment to increase their combat power.",
      iconName: 'ANVIL',
      buildingRequirement: 'FORGE',
      modalType: 'forge',
    },
    {
      id: 'library',
      name: 'Library of Runes',
      description: 'Study and upgrade runic buffs for your dungeon expeditions.',
      iconName: 'BOOK_ICON',
      buildingRequirement: 'LIBRARY',
      modalType: 'library',
    },
    {
      id: 'alchemist_lab',
      name: "Alchemist's Lab",
      description: 'Brew powerful potions to support your heroes in battle.',
      iconName: 'STAFF_ICON',
      buildingRequirement: 'ALCHEMISTS_LAB',
      modalType: 'alchemist_lab',
    },
    {
      id: 'altar_of_convergence',
      name: 'Altar of Convergence',
      description: "Use Resonance Motes to permanently enhance your heroes' global attributes.",
      iconName: 'ATOM_ICON',
      buildingRequirement: 'ALTAR_OF_CONVERGENCE',
      modalType: 'altar',
    },
    {
      id: 'stone_quarry_minigame',
      name: 'Stone Quarry Expedition',
      description: 'Embark on an expedition to the Stone Quarry to mine rare minerals.',
      iconName: 'SHOVEL_ICON',
      buildingRequirement: 'STONE_QUARRY',
      actionType: 'dispatch',
      dispatchAction: () => {
        dispatch({ type: 'STONE_QUARRY_MINIGAME_INIT' });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.STONE_QUARRY_MINIGAME });
      },
    },
    {
      id: 'gold_mine_minigame',
      name: 'Gold Mine Adventure',
      description: 'Venture into the depths of the Gold Mine to find valuable ores and gemstones.',
      iconName: 'PICKAXE_ICON',
      buildingRequirement: 'GOLD_MINE',
      actionType: 'dispatch',
      dispatchAction: () => {
        dispatch({ type: 'GOLD_MINE_MINIGAME_INIT' });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.GOLD_MINE_MINIGAME });
      },
    },
  ];

  const handleFacilityClick = (facility: FacilityAction) => {
    if (facility.modalType === 'forge') setIsForgeModalOpen(true);
    else if (facility.modalType === 'library') setIsLibraryModalOpen(true);
    else if (facility.modalType === 'alchemist_lab') setIsAlchemistLabModalOpen(true);
    else if (facility.modalType === 'altar') setIsAltarModalOpen(true);
    else if (facility.modalType === 'research') setIsResearchModalOpen(true);
    else if (facility.actionType === 'dispatch' && facility.dispatchAction) {
      facility.dispatchAction();
    }
  };
  
  const visibleFacilities = facilities.filter(facility => {
    if (!facility.buildingRequirement) return true; // Always show if no building requirement
    return gameState.buildings.some(b => b.id === facility.buildingRequirement && b.level > 0);
  });

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold text-amber-300 mb-4">Town Facilities & Actions</h2>
      {visibleFacilities.length === 0 ? (
        <p className="text-slate-400 italic text-center py-6">
          Construct specific buildings like the Forge, Library, or Academy of Scholars to unlock more actions here.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFacilities.map(facility => {
            const Icon = ICONS[facility.iconName];
            // Building existence is already checked by visibleFacilities filter
            return (
              <div
                key={facility.id}
                className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-150 ease-in-out
                            border-sky-600 bg-sky-700/40 hover:bg-sky-600/50`}
              >
                <div className="flex items-center mb-2">
                  {Icon && <Icon className={`w-8 h-8 mr-3 text-yellow-300`} />}
                  <h3 className={`text-lg font-semibold text-yellow-200`}>{facility.name}</h3>
                </div>
                <p className={`text-sm mb-3 text-slate-300`}>{facility.description}</p>
                <Button
                  onClick={() => handleFacilityClick(facility)}
                  variant={'primary'}
                  size="sm"
                  className="w-full"
                >
                  {facility.modalType ? 'Open' : 'Enter'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ForgeUpgradeModal isOpen={isForgeModalOpen} onClose={() => setIsForgeModalOpen(false)} />
      <LibraryModal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} />
      <AlchemistLabModal isOpen={isAlchemistLabModalOpen} onClose={() => setIsAlchemistLabModalOpen(false)} />
      <AltarOfConvergenceModal isOpen={isAltarModalOpen} onClose={() => setIsAltarModalOpen(false)} />
      <AcademyModal isOpen={isResearchModalOpen} onClose={() => setIsResearchModalOpen(false)} />
    </div>
  );
};

export default FacilitiesTabContent;
