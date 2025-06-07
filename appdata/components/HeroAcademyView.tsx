
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, HeroDefinition, ResourceType, PlayerOwnedShard, GameNotification } from '../types';
import { ICONS } from './Icons';
import SkillTreeView from './SkillTreeView';
import Button from './Button';
// ShardCard is now used within ShardsTab
// Modal import is removed as it's now used within ShardsTab if needed
// import { NOTIFICATION_ICONS } from '../constants'; // NOTIFICATION_ICONS might be used by ShardsTab
import HeroStatsPanel from './HeroStatsPanel';
import ShardsTab from './ShardsTab'; 
// Modal removed as transfer confirmation is in ShardsTab

type ActiveHeroAcademyTab = 'SKILL_TREE' | 'STATS' | 'SHARDS'; // Removed 'MANAGE_SHARDS'

const HeroAcademyView: React.FC = () => {
  const { gameState, staticData, dispatch } = useGameContext();
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveHeroAcademyTab>('SKILL_TREE');
  // Transfer related state is moved to ShardsTab
  // const [shardToTransfer, setShardToTransfer] = useState<PlayerOwnedShard | null>(null);
  // const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);
  // const [transferTargetHeroId, setTransferTargetHeroId] = useState<string | null>(null);


  useEffect(() => {
    if (gameState.heroes.length === 0) {
        setSelectedHeroId(null);
    } else {
        if (!selectedHeroId || !gameState.heroes.find(h => h.definitionId === selectedHeroId)) {
            setSelectedHeroId(gameState.heroes[0].definitionId);
        }
    }
  }, [gameState.heroes, selectedHeroId]);

  useEffect(() => {
    // Reset any relevant local state if needed when tab or hero changes,
    // but core transfer state is now in ShardsTab
  }, [activeTab, selectedHeroId]);


  const selectedHeroState = selectedHeroId ? gameState.heroes.find(h => h.definitionId === selectedHeroId) : null;
  const selectedHeroDef = selectedHeroId ? staticData.heroDefinitions[selectedHeroId] : null;
  const selectedSkillTree = selectedHeroDef ? staticData.skillTrees[selectedHeroDef.skillTreeId] : null;

  // Logic for handling shard transfer is now within ShardsTab.tsx

  if (gameState.heroes.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-sky-400 mb-4">Hero Academy</h2>
        <p className="text-slate-400 mt-4">Recruit heroes to manage their skills and progression.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
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
     

      <div className="flex-grow flex flex-col bg-slate-800/50 relative overflow-hidden">
         <>
            <div className="flex-shrink-0 p-2 border-b border-slate-700 flex space-x-1 bg-slate-800">
              <Button
                variant={activeTab === 'SKILL_TREE' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('SKILL_TREE')}
                className="flex-1"
              >
                Skill Tree
              </Button>
              <Button
                variant={activeTab === 'STATS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('STATS')}
                className="flex-1"
              >
                Stats & Info
              </Button>
              <Button
                variant={activeTab === 'SHARDS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('SHARDS')}
                className="flex-1"
                icon={ICONS.FUSION_ICON && <ICONS.FUSION_ICON className="w-4 h-4" />}
              >
                Shards (Fuse & Transfer)
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
                {activeTab === 'SHARDS' && ( 
                  <ShardsTab selectedHeroState={selectedHeroState} />
                )}
                 {(activeTab === 'SKILL_TREE' || activeTab === 'STATS') && !selectedHeroState && gameState.heroes.length > 0 && (
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
      {/* Transfer confirmation modal is now inside ShardsTab */}
    </div>
  );
};

export default HeroAcademyView;
