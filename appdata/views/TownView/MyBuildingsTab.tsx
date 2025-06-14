
import React from 'react';
import { PlayerBuildingState, ActiveView } from '../../types'; // Added ActiveView
import BuildingCard from '../../components/BuildingCard';
import { useGameContext } from '../../context'; 

interface MyBuildingsTabProps {
  buildings: PlayerBuildingState[];
  onOpenTownHallUpgrades: () => void;
  onOpenGuildHallUpgrades: () => void;
  onOpenDungeonSelection: () => void;
  onOpenBuildingSpecificUpgrades: (buildingId: string) => void;
  onEnterColosseum: () => void;
  onOpenDemoniconPortal: () => void;
  onOpenAcademy?: () => void; 
  onEnterAutoBattler?: () => void; // New prop
}

const MyBuildingsTab: React.FC<MyBuildingsTabProps> = ({
  buildings,
  onOpenTownHallUpgrades,
  onOpenGuildHallUpgrades,
  onOpenDungeonSelection,
  onOpenBuildingSpecificUpgrades,
  onEnterColosseum,
  onOpenDemoniconPortal,
  onOpenAcademy,
  onEnterAutoBattler, // New prop
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-400 mb-3">My Buildings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map(b => (
          <BuildingCard
            key={b.id}
            buildingState={b}
            onOpenTownHallUpgrades={b.id === 'TOWN_HALL' ? onOpenTownHallUpgrades : undefined}
            onOpenGuildHallUpgrades={b.id === 'GUILD_HALL' ? onOpenGuildHallUpgrades : undefined}
            onOpenDungeonSelection={b.id === 'EXPLORERS_GUILD' ? onOpenDungeonSelection : undefined}
            onOpenBuildingSpecificUpgrades={
              (b.id === 'MAGE_TOWER' || b.id === 'FARM' || b.id === 'ALCHEMISTS_LAB') 
              ? onOpenBuildingSpecificUpgrades
              : undefined
            }
            onEnterColosseum={b.id === 'COLOSSEUM' ? onEnterColosseum : undefined}
            onOpenDemoniconPortal={b.id === 'DEMONICON_GATE' ? onOpenDemoniconPortal : undefined}
            onOpenAcademy={b.id === 'ACADEMY_OF_SCHOLARS' ? onOpenAcademy : undefined}
            onEnterAutoBattler={b.id === 'KRIEGSAKADEMIE' ? onEnterAutoBattler : undefined} // Pass to BuildingCard
          />
        ))}
        {buildings.length === 0 && (
          <p className="text-slate-400 italic col-span-full text-center py-4">No buildings constructed yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyBuildingsTab;
