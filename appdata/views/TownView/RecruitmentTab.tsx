
import React from 'react';
import { GameState, HeroDefinition, GlobalBonuses, Cost, ResourceType, PlayerHeroState } from '../../types';
import { ICONS } from '../../components/Icons';
import { RESOURCE_COLORS } from '../../constants';
import HeroCard from '../../components/HeroCard';
import Button from '../../components/Button';
import { formatNumber, canAfford } from '../../utils';

interface RecruitmentTabProps {
  heroes: PlayerHeroState[];
  unrecruitedHeroes: HeroDefinition[];
  gameState: GameState;
  globalBonuses: GlobalBonuses;
  handleRecruitHero: (heroDefId: string, canAffordRecruit: boolean) => void;
  animatingCardId: string | null;
}

const RecruitmentTab: React.FC<RecruitmentTabProps> = ({
  heroes,
  unrecruitedHeroes,
  gameState,
  globalBonuses,
  handleRecruitHero,
  animatingCardId,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-400 mb-3">Heroes</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heroes.map(h => <HeroCard key={h.definitionId} heroState={h} />)}
      </div>
      {unrecruitedHeroes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-amber-400 mb-3">Available Recruits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unrecruitedHeroes.map(heroDef => {
              let recruitmentCost = heroDef.recruitmentCost ? [...heroDef.recruitmentCost] : [];
              if (recruitmentCost.length > 0 && globalBonuses.heroRecruitmentCostReduction > 0) {
                recruitmentCost = recruitmentCost.map(cost => ({
                  ...cost,
                  amount: Math.max(1, Math.floor(cost.amount * (1 - globalBonuses.heroRecruitmentCostReduction)))
                }));
              }
              const canAffordRecruit = canAfford(gameState.resources, recruitmentCost);
              const Icon = ICONS[heroDef.iconName] || ICONS.HERO;
              const isLockedByWave = heroDef.unlockWaveRequirement !== undefined && gameState.currentWaveProgress < heroDef.unlockWaveRequirement;
              const isAnimatingThisCard = animatingCardId === heroDef.id;

              return (
                <div key={heroDef.id} className={`p-3 bg-slate-700/50 rounded-lg flex flex-col justify-between 
                                                  ${isLockedByWave ? 'opacity-60' : ''}
                                                  ${isAnimatingThisCard ? 'animate-special-cast hero-cast-pulse' : ''}`}>
                  <div>
                    <div className="flex items-center mb-2">
                      {Icon && <Icon className="w-7 h-7 mr-2 text-amber-300" />}
                      <h4 className="text-lg font-medium text-amber-200">{heroDef.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{heroDef.description}</p>
                    {isLockedByWave ? (
                      <p className="text-xs text-amber-400 font-semibold mt-1">Unlocks after Wave {heroDef.unlockWaveRequirement}.</p>
                    ) : recruitmentCost.length > 0 && (
                      <>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Recruitment Cost:</p>
                        {recruitmentCost.map(c => (
                          <div key={c.resource} className={`flex items-center text-xs ${gameState.resources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource as ResourceType]}`}>
                            <span className={`${RESOURCE_COLORS[c.resource as ResourceType]}`}>{ICONS[c.resource] && React.createElement(ICONS[c.resource], { className: "w-3 h-3 mr-1" })} {c.resource.replace(/_/g, ' ')}:</span>
                            <span className="ml-1 text-slate-200">{formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => handleRecruitHero(heroDef.id, canAffordRecruit)}
                    variant="secondary"
                    size="sm"
                    className="w-full mt-3"
                    disabled={!canAffordRecruit || isLockedByWave}
                  >
                    Recruit
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {heroes.length > 0 && unrecruitedHeroes.length === 0 && (
           <p className="text-slate-400 italic text-center py-4 mt-4">All available heroes have been recruited.</p>
      )}
       {heroes.length === 0 && unrecruitedHeroes.length === 0 && (
           <p className="text-slate-400 italic text-center py-4 mt-4">No heroes or recruits currently available.</p>
      )}
    </div>
  );
};

export default RecruitmentTab;
