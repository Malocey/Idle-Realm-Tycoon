
import React, { useState } from 'react';
import { useGameContext } from '../context';
import { PotionDefinition, ResourceType, Cost } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS } from '../constants';
import { formatNumber, canAfford } from '../utils';
import Button from './Button';

interface PotionCraftingCardProps {
  potionDef: PotionDefinition;
}

export const PotionCraftingCard: React.FC<PotionCraftingCardProps> = ({ potionDef }) => {
  const { gameState, dispatch } = useGameContext();
  const [quantity, setQuantity] = useState(1);
  const Icon = ICONS[potionDef.iconName];

  const totalCost: Cost[] = potionDef.costs.map(c => ({
    ...c,
    amount: c.amount * quantity
  }));

  const playerCanAfford = canAfford(gameState.resources, totalCost);

  const handleCraft = () => {
    if (quantity > 0 && playerCanAfford) {
      dispatch({ type: 'ADD_POTION_TO_QUEUE', payload: { potionId: potionDef.id, quantity } });
    }
  };

  return (
    <div className="p-3 rounded-lg border bg-slate-700/50 border-slate-600 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center mb-1.5">
          {Icon && <Icon className="w-7 h-7 mr-2 text-amber-400" />}
          <h4 className="text-md font-semibold text-amber-300">{potionDef.name}</h4>
        </div>
        <p className="text-xs text-slate-400 mb-2">{potionDef.description}</p>
        <p className="text-xs text-slate-400 mb-2">Base Craft Time: {(potionDef.baseCraftTimeMs / 1000).toFixed(0)}s per potion.</p>

        <div className="mb-2">
          <p className="text-xs text-slate-500 uppercase font-semibold">Cost (per potion):</p>
          {potionDef.costs.map(c => (
            <span key={c.resource} className="text-xs mr-2 text-slate-300">
              {ICONS[c.resource] && React.createElement(ICONS[c.resource], { className: "inline w-3 h-3 mr-0.5", fill: RESOURCE_COLORS[c.resource]})}
              {formatNumber(c.amount)} {c.resource.replace(/_/g, ' ').toLowerCase()}
            </span>
          ))}
        </div>

        {quantity > 0 && (
          <div className="mb-2">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Cost (for {quantity}):</p>
            {totalCost.map(c => (
              <span key={c.resource} className={`text-xs mr-2 ${gameState.resources[c.resource] < c.amount && playerCanAfford === false ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
                {ICONS[c.resource] && React.createElement(ICONS[c.resource], { className: "inline w-3 h-3 mr-0.5"})}
                {formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center space-x-2">
        <label htmlFor={`quantity-${potionDef.id}`} className="text-sm text-slate-300">Qty:</label>
        <input
          type="number"
          id={`quantity-${potionDef.id}`}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          className="w-16 p-1.5 bg-slate-600 border border-slate-500 rounded text-sm focus:ring-sky-500 focus:border-sky-500"
        />
        <Button
          onClick={handleCraft}
          disabled={!playerCanAfford || quantity <= 0}
          size="sm"
          variant="secondary"
          className="flex-grow"
          icon={ICONS.CHECK_CIRCLE && <ICONS.CHECK_CIRCLE className="w-4 h-4"/>}
        >
          Add to Queue
        </Button>
      </div>
    </div>
  );
};
