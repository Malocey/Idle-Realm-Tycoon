
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { PermanentHeroBuff, PlayerHeroState, HeroStats } from '../types';
import { ICONS } from './Icons';

interface DungeonRewardModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const DungeonRewardModal: React.FC<DungeonRewardModalProps> = ({ isOpen, onClose }) => {
  const { gameState, dispatch, staticData, getGlobalBonuses } = useGameContext();
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [selectedBuff, setSelectedBuff] = useState<PermanentHeroBuff | null>(null);
  const [offeredBuffs, setOfferedBuffs] = useState<PermanentHeroBuff[]>([]);

  const globalBonuses = getGlobalBonuses();

  useEffect(() => {
    if (isOpen && gameState.activeDungeonRun) {
      const dungeonDef = staticData.dungeonDefinitions[gameState.activeDungeonRun.dungeonDefinitionId];
      if (dungeonDef) {
        const numChoices = dungeonDef.finalReward.permanentBuffChoices + globalBonuses.dungeonBuffChoicesBonus;
        const availableBuffTemplates = [...dungeonDef.possiblePermanentBuffs];
        const currentOffered: PermanentHeroBuff[] = [];
        
        for (let i = 0; i < numChoices && availableBuffTemplates.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableBuffTemplates.length);
          const template = availableBuffTemplates.splice(randomIndex, 1)[0];
          let description = '';
          const statName = template.stat.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          if (template.stat === 'critChance' || template.stat === 'critDamage') {
            description = `+${(template.value * 100).toFixed(template.stat === 'critChance' ? 2 : 1)}% ${statName}`;
          } else {
            description = `+${template.value.toFixed(template.stat === 'attackSpeed' ? 2 : 0)} ${statName}`;
          }
          currentOffered.push({ 
            ...template, 
            description
          });
        }
        setOfferedBuffs(currentOffered);
        
        if (!selectedHeroId && gameState.activeDungeonRun.survivingHeroIds.length > 0) {
            setSelectedHeroId(gameState.activeDungeonRun.survivingHeroIds[0]);
        }
      }
    } else {
      setSelectedHeroId(null);
      setSelectedBuff(null);
      setOfferedBuffs([]);
    }
  }, [isOpen, gameState.activeDungeonRun, staticData.dungeonDefinitions, globalBonuses.dungeonBuffChoicesBonus, selectedHeroId]); // Added selectedHeroId to deps

  const handleClaimReward = () => {
    if (selectedHeroId && selectedBuff && gameState.activeDungeonRun) {
      dispatch({ type: 'APPLY_PERMANENT_HERO_BUFF', payload: { heroDefinitionId: selectedHeroId, buff: selectedBuff } });
      dispatch({ type: 'END_DUNGEON_RUN', payload: { outcome: 'SUCCESS' } }); 
      onClose();
    }
  };

  if (!gameState.activeDungeonRun || !isOpen) {
    return null;
  }

  const dungeonDef = staticData.dungeonDefinitions[gameState.activeDungeonRun.dungeonDefinitionId];
  const survivingHeroes = gameState.heroes.filter(h => gameState.activeDungeonRun?.survivingHeroIds.includes(h.definitionId));

  return (
    <Modal isOpen={isOpen} onClose={() => {
        dispatch({ type: 'END_DUNGEON_RUN', payload: { outcome: 'SUCCESS' } }); 
        onClose();
    }} title={`Victory! ${dungeonDef?.name || 'Dungeon'} Cleared!`} size="lg">
      <div className="space-y-4">
        <p className="text-slate-300">Select a permanent buff and a hero to apply it to:</p>

        <div>
          <h4 className="text-lg font-semibold text-amber-300 mb-2">Choose Buff:</h4>
          <div className="space-y-2">
            {offeredBuffs.map((buff, index) => (
              <Button
                key={index}
                onClick={() => setSelectedBuff(buff)}
                variant={selectedBuff?.description === buff.description ? 'primary' : 'secondary'}
                className="w-full justify-start"
              >
                {buff.description}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-sky-300 mb-2">Choose Hero:</h4>
          {survivingHeroes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {survivingHeroes.map(hero => {
                 const heroDef = staticData.heroDefinitions[hero.definitionId];
                 const Icon = ICONS[heroDef.iconName];
                return (
                    <Button
                        key={hero.definitionId}
                        onClick={() => setSelectedHeroId(hero.definitionId)}
                        variant={selectedHeroId === hero.definitionId ? 'primary' : 'secondary'}
                        className="w-full justify-start items-center space-x-2 p-2"
                    >
                        {Icon && <Icon className="w-5 h-5"/>}
                        <span>{heroDef.name} (Lvl {hero.level})</span>
                    </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-red-400">No heroes survived the entire dungeon run.</p>
          )}
        </div>

        <Button
          onClick={handleClaimReward}
          disabled={!selectedHeroId || !selectedBuff || survivingHeroes.length === 0}
          className="w-full mt-4"
          variant="success" 
          size="lg"
        >
          Claim Reward & Exit
        </Button>
      </div>
    </Modal>
  );
};
export default DungeonRewardModal;

// Helper function for Button variant, if not already existing
declare module './Button' {
  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'; 
  }
}
