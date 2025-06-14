
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, HeroDefinition, ResourceType, PlayerOwnedShard, GameNotification, PotionDefinition, MAX_POTION_SLOTS_PER_HERO } from '../types';
import { ICONS } from '../components/Icons';
import SkillTreeView from '../components/SkillTreeView';
import Button from '../components/Button';
import HeroStatsPanel from '../components/HeroStatsPanel';
import ShardsTab from '../components/ShardsTab'; 
import { formatNumber } from '../utils'; 
import { RESOURCE_COLORS } from '../constants';

type ActiveHeroAcademyTab = 'SKILL_TREE' | 'STATS' | 'SHARDS' | 'POTIONS'; 

const HeroAcademyView: React.FC = () => {
  const { gameState, staticData, dispatch } = useGameContext();
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveHeroAcademyTab>('SKILL_TREE');
  
  const [selectedPotionFromInventory, setSelectedPotionFromInventory] = useState<string | null>(null);


  useEffect(() => {
    if (gameState.heroes.length === 0) {
        setSelectedHeroId(null);
        if (activeTab !== 'SHARDS' && activeTab !== 'POTIONS') {
            setActiveTab('SHARDS'); 
        }
    } else {
        if (!selectedHeroId || !gameState.heroes.find(h => h.definitionId === selectedHeroId)) {
            setSelectedHeroId(gameState.heroes[0].definitionId);
        }
    }
  }, [gameState.heroes, selectedHeroId, activeTab]);

  useEffect(() => {
    setSelectedPotionFromInventory(null); 
  }, [activeTab, selectedHeroId]);


  const selectedHeroState = selectedHeroId ? gameState.heroes.find(h => h.definitionId === selectedHeroId) : null;
  const selectedHeroDef = selectedHeroId ? staticData.heroDefinitions[selectedHeroId] : null;
  const selectedSkillTree = selectedHeroDef ? staticData.skillTrees[selectedHeroDef.skillTreeId] : null;

  const handleEquipPotion = (slotIndex: number) => {
    if (selectedHeroId && selectedPotionFromInventory) {
        dispatch({ 
            type: 'EQUIP_POTION_TO_SLOT', 
            payload: { 
                heroId: selectedHeroId, 
                potionId: selectedPotionFromInventory, 
                slotIndex 
            } 
        });
        setSelectedPotionFromInventory(null); 
    }
  };

  const handleUnequipPotion = (slotIndex: number) => {
    if (selectedHeroId) {
        dispatch({
            type: 'UNEQUIP_POTION_FROM_SLOT',
            payload: { heroId: selectedHeroId, slotIndex }
        });
    }
  };


  if (gameState.heroes.length === 0 && activeTab !== 'SHARDS' && activeTab !== 'POTIONS') { 
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-sky-400 mb-4">Hero Academy</h2>
        <p className="text-slate-400 mt-4">Recruit heroes to manage their skills and progression.</p>
         <Button
            variant={'primary'}
            size="md"
            onClick={() => setActiveTab('SHARDS')} // Default to SHARDS if no heroes
            className="mt-4"
            icon={ICONS.SHARD_ICON && <ICONS.SHARD_ICON className="w-5 h-5"/>}
          >
            Go to Shards
          </Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
      {gameState.heroes.length > 0 && (
         <div className="w-full md:w-64 bg-slate-800 p-3 fancy-scrollbar overflow-y-auto flex-shrink-0 border-r border-slate-700">
          <h3 className="text-xl font-semibold text-amber-300 mb-3 sticky top-0 bg-slate-800 py-2 z-10">Your Heroes</h3>
          <div className="space-y-1.5">
            {gameState.heroes.map(hero => {
              const heroDef = staticData.heroDefinitions[hero.definitionId];
              const Icon = ICONS[heroDef.iconName];
              const isSelected = selectedHeroId === hero.definitionId;

              return (
                <div key={hero.definitionId} className={`rounded-md transition-all duration-150 ease-in-out ${isSelected ? 'bg-sky-700/70 ring-2 ring-sky-500' : 'bg-slate-700 hover:bg-slate-600/70'}`}>
                  <button
                    onClick={() => {
                      setSelectedHeroId(hero.definitionId);
                    }}
                    className={`w-full flex items-center p-2.5 text-left 
                      ${isSelected ? 'text-white' : 'text-slate-300'}`}
                    aria-current={isSelected ? "page" : undefined}
                  >
                    {Icon && <Icon className="w-7 h-7 mr-3 flex-shrink-0" />}
                    <div className="text-left">
                      <span className="font-semibold block text-base leading-tight">{heroDef.name}</span>
                      <span className="text-xs opacity-80">Lvl {hero.level}</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
     

      <div className="flex-grow flex flex-col bg-slate-800/50 relative overflow-hidden">
         <>
            <div className="flex-shrink-0 p-2 border-b border-slate-700 flex space-x-1 bg-slate-800">
              <Button
                variant={activeTab === 'SKILL_TREE' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('SKILL_TREE')}
                className="flex-1"
                disabled={gameState.heroes.length === 0}
              >
                Skill Tree
              </Button>
              <Button
                variant={activeTab === 'STATS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('STATS')}
                className="flex-1"
                disabled={gameState.heroes.length === 0}
              >
                Stats & Info
              </Button>
              <Button
                variant={activeTab === 'POTIONS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('POTIONS')}
                className="flex-1"
                icon={ICONS.HEALTH_POTION && <ICONS.HEALTH_POTION className="w-4 h-4"/>}
                disabled={gameState.heroes.length === 0} 
              >
                Potions
              </Button>
              <Button
                variant={activeTab === 'SHARDS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('SHARDS')}
                className="flex-1"
                icon={ICONS.SHARD_ICON && <ICONS.SHARD_ICON className="w-4 h-4" />}
              >
                Shards
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto fancy-scrollbar p-1 md:p-2">
              <div key={activeTab + (selectedHeroId || '')} className="animate-tab-content-enter">
                {activeTab === 'SKILL_TREE' && selectedHeroState && selectedHeroDef && selectedSkillTree && (
                  <SkillTreeView
                    heroDefinitionId={selectedHeroDef.id}
                    skillTreeDefinition={selectedSkillTree}
                  />
                )}
                {activeTab === 'STATS' && selectedHeroState && selectedHeroDef && (
                  <HeroStatsPanel 
                    heroState={selectedHeroState}
                    heroDef={selectedHeroDef}
                  />
                )}
                 {activeTab === 'POTIONS' && selectedHeroState && selectedHeroDef && (
                    <div className="p-4">
                        <h3 className="text-xl font-semibold text-amber-300 mb-3">Potion Slots for {selectedHeroDef.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Hero's Potion Slots */}
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                                <h4 className="text-md font-semibold text-sky-300 mb-2">Equipped Potions</h4>
                                <div className="flex space-x-2 mb-3">
                                    {selectedHeroState.potionSlots.map((potionId, index) => {
                                        const potionDef = potionId ? staticData.potionDefinitions[potionId] : null;
                                        const PotionIcon = potionDef ? ICONS[potionDef.iconName] : ICONS.X_CIRCLE;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (potionId) handleUnequipPotion(index);
                                                    else if(selectedPotionFromInventory) handleEquipPotion(index);
                                                }}
                                                className={`w-16 h-20 border-2 rounded-md flex flex-col items-center justify-center p-1
                                                            ${potionDef ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-800 hover:bg-slate-700'}
                                                            ${selectedPotionFromInventory && !potionDef ? 'border-green-500 ring-2 ring-green-400' : 'border-slate-500'}`}
                                                title={potionDef ? `Unequip ${potionDef.name}` : (selectedPotionFromInventory ? `Equip ${staticData.potionDefinitions[selectedPotionFromInventory]?.name} here` : "Empty Slot")}
                                            >
                                                {PotionIcon && <PotionIcon className={`w-8 h-8 mb-1 ${potionDef ? RESOURCE_COLORS.CRYSTALS /* Example color */ : 'text-slate-500'}`} />}
                                                <span className="text-xs text-slate-300 truncate w-full text-center">
                                                    {potionDef ? potionDef.name.substring(0,10) : 'Empty'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Player's Potion Inventory */}
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                                <h4 className="text-md font-semibold text-green-300 mb-2">Potion Inventory</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto fancy-scrollbar">
                                    {Object.entries(gameState.potions).map(([potionId, quantity]) => {
                                        if (quantity <= 0) return null;
                                        const potionDef = staticData.potionDefinitions[potionId];
                                        if (!potionDef || potionDef.isPermanent) return null; // Don't show permanent potions for equipping
                                        const PotionIcon = ICONS[potionDef.iconName];
                                        return (
                                            <button
                                                key={potionId}
                                                onClick={() => setSelectedPotionFromInventory(potionId === selectedPotionFromInventory ? null : potionId)}
                                                className={`p-2 border-2 rounded-md flex flex-col items-center
                                                            ${selectedPotionFromInventory === potionId ? 'border-yellow-400 ring-2 ring-yellow-300 bg-slate-500' : 'border-slate-600 hover:border-slate-500 bg-slate-600'}`}
                                                title={`Select ${potionDef.name} (x${quantity})`}
                                            >
                                                {PotionIcon && <PotionIcon className="w-7 h-7 mb-1 text-amber-400" />}
                                                <span className="text-xs text-slate-200 truncate w-full text-center">{potionDef.name.substring(0,10)}</span>
                                                <span className="text-xs text-slate-400">(x{quantity})</span>
                                            </button>
                                        );
                                    })}
                                    {Object.values(gameState.potions).filter(q => q > 0 && !staticData.potionDefinitions[Object.keys(gameState.potions).find(k => gameState.potions[k] === q)!]?.isPermanent).length === 0 && (
                                        <p className="text-slate-400 italic col-span-full text-center py-4">No non-permanent potions in inventory.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
                {activeTab === 'SHARDS' && (
                  <ShardsTab selectedHeroState={selectedHeroState} />
                )}
                 {(activeTab === 'SKILL_TREE' || activeTab === 'STATS' || activeTab === 'POTIONS') && !selectedHeroState && gameState.heroes.length > 0 && (
                     <div className="flex items-center justify-center h-full p-4">
                        <p className="text-slate-400 text-lg text-center">
                        Select a hero from the list to view their details.
                        </p>
                    </div>
                 )}
              </div>
            </div>
          </>
      </div>
    </div>
  );
};

export default HeroAcademyView;