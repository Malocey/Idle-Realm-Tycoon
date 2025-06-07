
import React from 'react';
import { PlayerBuildingState } from '../../types';
import BuildingCard from '../../components/BuildingCard';
import { useGameContext } from '../../context'; // Needed for BuildingCard internals

interface MyBuildingsTabProps {
  buildings: PlayerBuildingState[];
  onOpenTownHallUpgrades: () => void;
  onOpenGuildHallUpgrades: () => void;
  onOpenAlchemistLab: () => void;
  onOpenForgeUpgrades: () => void;
  onOpenDungeonSelection: () => void;
  onOpenBuildingSpecificUpgrades: (buildingId: string) => void;
  onOpenLibrary: () => void;
  onOpenStoneQuarryMinigame: () => void;
  onEnterColosseum: () => void;
  onOpenGoldMineMinigame: () => void; 
  onOpenDemoniconPortal: () => void; // New prop
}

const MyBuildingsTab: React.FC<MyBuildingsTabProps> = ({
  buildings,
  onOpenTownHallUpgrades,
  onOpenGuildHallUpgrades,
  onOpenAlchemistLab,
  onOpenForgeUpgrades,
  onOpenDungeonSelection,
  onOpenBuildingSpecificUpgrades,
  onOpenLibrary,
  onOpenStoneQuarryMinigame,
  onEnterColosseum,
  onOpenGoldMineMinigame, 
  onOpenDemoniconPortal, // New
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
            onOpenAlchemistLab={b.id === 'ALCHEMISTS_LAB' ? onOpenAlchemistLab : undefined}
            onOpenForgeUpgrades={b.id === 'FORGE' ? onOpenForgeUpgrades : undefined}
            onOpenDungeonSelection={b.id === 'EXPLORERS_GUILD' ? onOpenDungeonSelection : undefined}
            onOpenBuildingSpecificUpgrades={
              (b.id === 'MAGE_TOWER' || b.id === 'FARM' || b.id === 'ALCHEMISTS_LAB')
              ? onOpenBuildingSpecificUpgrades
              : undefined
            }
            onOpenLibrary={b.id === 'LIBRARY' ? onOpenLibrary : undefined}
            onOpenStoneQuarryMinigame={b.id === 'STONE_QUARRY' ? onOpenStoneQuarryMinigame : undefined}
            onOpenGoldMineMinigame={b.id === 'GOLD_MINE' ? onOpenGoldMineMinigame : undefined}
            onEnterColosseum={b.id === 'COLOSSEUM' ? onEnterColosseum : undefined}
            onOpenDemoniconPortal={b.id === 'DEMONICON_GATE' ? onOpenDemoniconPortal : undefined} // Pass to card
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
