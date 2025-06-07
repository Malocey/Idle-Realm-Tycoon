import React from 'react';
import { GoldMineUpgradeDefinition, ResourceType, Cost, GameState } from '../../types';
import { ICONS } from '../Icons';
import Button from '../Button';
import { formatNumber, canAfford } from '../../utils';
import { RESOURCE_COLORS } from '../../constants'; // Ensure this is imported

interface GoldMineUpgradeCardProps {
  upgradeDef: GoldMineUpgradeDefinition;
  currentLevel: number;
  onPurchase: (upgradeId: string) => void;
  playerResources: GameState['resources']; // Pass player's main resources
}

const GoldMineUpgradeCard: React.FC<GoldMineUpgradeCardProps> = ({
  upgradeDef,
  currentLevel,
  onPurchase,
  playerResources,
}) => {
  const Icon = ICONS[upgradeDef.iconName];
  const isMaxLevel = upgradeDef.maxLevel !== -1 && currentLevel >= upgradeDef.maxLevel;
  const nextLevel = currentLevel + 1;
  const costForNextLevel = isMaxLevel ? [] : upgradeDef.cost(currentLevel);
  const playerCanAfford = !isMaxLevel && canAfford(playerResources, costForNextLevel);

  const effectValue = upgradeDef.effects[0]?.value || 0; // Assuming one primary effect for simplicity
  const description = upgradeDef.description(currentLevel, effectValue);
  
  let nextLevelDescription = "";
  if (!isMaxLevel) {
    const nextEffectValue = upgradeDef.effects[0]?.value || 0;
    // For description, let's assume the 'effectValue' passed is per level.
    // So, next level's total bonus would be effectValue * nextLevel.
    // Or, if effectValue is the bonus *for* the next level, then description logic in def needs to be clear.
    // For simplicity, assuming effectValue in description is the per-level bonus.
    nextLevelDescription = upgradeDef.description(nextLevel, effectValue).replace('Current:', 'Next Lvl:');
  }


  return (
    <div className={`p-3 rounded-lg border bg-slate-700/50 border-slate-600 ${isMaxLevel ? 'opacity-70' : ''}`}>
      <div className="flex items-center mb-1">
        {Icon && <Icon className="w-6 h-6 mr-2 text-amber-400" />}
        <h4 className="text-md font-semibold text-amber-300">
          {upgradeDef.name} <span className="text-xs text-slate-400">Lvl {currentLevel}{upgradeDef.maxLevel !== -1 ? `/${upgradeDef.maxLevel}` : ''}</span>
        </h4>
      </div>
      <p className="text-xs text-slate-300 mb-1">{description}</p>
      {!isMaxLevel && <p className="text-xs text-sky-400 mb-2">{nextLevelDescription}</p>}

      {!isMaxLevel && (
        <>
          <div className="mb-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Upgrade Cost (Lvl {nextLevel}):</p>
            {costForNextLevel.map(c => (
              <span key={c.resource} className={`text-xs mr-2 ${playerResources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
                {ICONS[c.resource] && React.createElement(ICONS[c.resource],{className: "inline w-3 h-3 mr-0.5"})} 
                {formatNumber(c.amount)} / {formatNumber(playerResources[c.resource] || 0)}
              </span>
            ))}
          </div>
          <Button
            onClick={() => onPurchase(upgradeDef.id)}
            disabled={!playerCanAfford}
            size="sm"
            variant="secondary"
            className="w-full mt-1"
          >
            Upgrade
          </Button>
        </>
      )}
      {isMaxLevel && <p className="text-xs text-green-400 mt-1 text-center font-semibold">Max Level Reached</p>}
    </div>
  );
};

export default GoldMineUpgradeCard;
