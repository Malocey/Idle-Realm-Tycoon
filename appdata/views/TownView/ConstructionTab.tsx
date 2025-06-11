
import React from 'react';
import { GameState, BuildingDefinition, GlobalBonuses, Cost, ResourceType } from '../../types';
import { ICONS } from '../../components/Icons';
import { RESOURCE_COLORS } from '../../constants';
import { formatNumber, canAfford } from '../../utils';
import Button from '../../components/Button';

interface ConstructionTabProps {
  unbuiltBuildings: BuildingDefinition[];
  gameState: GameState;
  globalBonuses: GlobalBonuses;
  handleConstructBuilding: (defId: string, canAffordBuild: boolean) => void;
  animatingCardId: string | null;
}

const ConstructionTab: React.FC<ConstructionTabProps> = ({
  unbuiltBuildings,
  gameState,
  globalBonuses,
  handleConstructBuilding,
  animatingCardId,
}) => {

  const buildingsToShow = unbuiltBuildings.filter(def => {
    if (def.id === 'LUMBER_MILL' && !gameState.mapPoiCompletionStatus['lumber_mill_blueprint_obtained']) {
        return false;
    }
    if (def.id === 'FARM' && !gameState.mapPoiCompletionStatus['farm_blueprint_obtained']) {
        return false;
    }
    if (def.id === 'GOLD_MINE' && !gameState.mapPoiCompletionStatus['gold_mine_blueprint_obtained']) {
      return false;
    }
    if (def.id === 'STONE_QUARRY' && !gameState.mapPoiCompletionStatus['stone_quarry_blueprint_obtained']) {
      return false;
    }
    if (def.id === 'TANNERY' && !gameState.mapPoiCompletionStatus['tannery_blueprint_obtained']) {
      return false;
    }
    if (def.id === 'DEMONICON_GATE' && !gameState.mapPoiCompletionStatus['demonicon_gate_unlocked']) {
      return false;
    }
    // Original wave requirement check (for buildings not covered by blueprints)
    if (def.unlockWaveRequirement && gameState.currentWaveProgress < def.unlockWaveRequirement && 
        !gameState.mapPoiCompletionStatus[`${def.id.toLowerCase()}_blueprint_obtained`] && // Double check for generic blueprint pattern
        !(def.id === 'DEMONICON_GATE' && gameState.mapPoiCompletionStatus['demonicon_gate_unlocked']) ) {
      return false;
    }
    return true;
  });


  return (
    <div> 
      <h2 className="text-2xl font-bold text-green-400 mb-3">Construct New Buildings</h2>
      {buildingsToShow.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildingsToShow.map((def, index) => {
            const Icon = ICONS[def.iconName];
            const baseCost = def.baseCost;
            const actualBuildCost = baseCost.map(c => ({
              ...c,
              amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
            }));
            const canAffordBuild = canAfford(gameState.resources, actualBuildCost);
            
            let isLocked = false;
            let lockMessage = "";

            if (def.id === 'GOLD_MINE' && !gameState.mapPoiCompletionStatus['gold_mine_blueprint_obtained']) {
              isLocked = true;
              lockMessage = "Requires Gold Mine Blueprint obtained from the Gold Mine Depths.";
            } else if (def.id === 'STONE_QUARRY' && !gameState.mapPoiCompletionStatus['stone_quarry_blueprint_obtained']) {
              isLocked = true;
              lockMessage = "Requires Stone Quarry Blueprint obtained from the Quarry Excavation.";
            } else if (def.id === 'TANNERY' && !gameState.mapPoiCompletionStatus['tannery_blueprint_obtained']) {
              isLocked = true;
              lockMessage = "Requires Tannery Blueprint obtained from the Tannery Outpost.";
            } else if (def.id === 'DEMONICON_GATE' && !gameState.mapPoiCompletionStatus['demonicon_gate_unlocked']) {
              isLocked = true;
              lockMessage = "Requires the Corrupted Shrine on the World Map to be cleansed.";
            } else if (def.unlockWaveRequirement && gameState.currentWaveProgress < def.unlockWaveRequirement) {
              isLocked = true;
              lockMessage = `Unlocks after completing Wave ${def.unlockWaveRequirement}.`;
            }

            const isAnimatingThisCard = animatingCardId === def.id;

            return (
              <div 
                  key={def.id} 
                  className={`bg-slate-800 p-4 rounded-lg shadow-md glass-effect border border-slate-700 
                              ${isLocked ? 'opacity-60' : 'animate-card-cascade-enter'} 
                              ${isAnimatingThisCard ? 'animate-special-cast hero-cast-pulse' : ''}`}
                  style={{ animationDelay: isLocked ? undefined : `${index * 0.075}s` }}
              >
                <div className="flex items-center mb-2">
                  {Icon && <Icon className="w-8 h-8 mr-3 text-green-400" />}
                  <h3 className="text-xl font-semibold text-green-300">{def.name}</h3>
                </div>
                <p className="text-sm text-slate-400 mb-2">{def.description}</p>
                {isLocked ? (
                  <p className="text-sm text-amber-400 font-semibold mt-3">{lockMessage}</p>
                ) : (
                  <>
                    <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">Build Cost</h4>
                    {actualBuildCost.map(c => (
                      <div key={c.resource} className={`flex items-center text-sm ${gameState.resources[c.resource] < c.amount ? 'text-red-400' : 'text-slate-300'}`}>
                        <span className={`${RESOURCE_COLORS[c.resource as ResourceType]}`}>{ICONS[c.resource] && React.createElement(ICONS[c.resource], { className: "w-3 h-3 inline mr-1" })} {c.resource.replace(/_/g, ' ')}:</span>
                        <span className="ml-1">{formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}</span>
                      </div>
                    ))}
                    <Button
                      onClick={() => handleConstructBuilding(def.id, canAffordBuild)}
                      disabled={!canAffordBuild}
                      className="w-full mt-3"
                      variant="secondary"
                      icon={ICONS.BUILDING && <ICONS.BUILDING className="w-4 h-4" />}
                    >
                      Build
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-400 italic text-center py-4">All available buildings have been constructed or current unlocks have been built.</p>
      )}
    </div>
  );
};

export default ConstructionTab;
