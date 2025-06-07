
import React from 'react';
import { ICONS } from './Icons';
import { RESOURCE_COLORS, GAME_TICK_MS } from '../constants';
import { ResourceType } from '../types';
import { formatNumber } from '../utils';

interface ResourceItemProps {
  iconName: string;
  value: number;
  label: string;
  rate?: number; // This 'rate' is the amountPerTick from definitions
}

const ResourceItem: React.FC<ResourceItemProps> = ({iconName, value, label, rate}) => {
  const Icon = ICONS[iconName];
  let displayRatePerSecond: number | undefined = undefined;
  if (rate !== undefined && GAME_TICK_MS > 0) {
    displayRatePerSecond = rate * (1000 / GAME_TICK_MS);
  }

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-md bg-slate-700/50`}>
      {Icon && <Icon className={`w-5 h-5 ${RESOURCE_COLORS[label as ResourceType] || 'text-slate-300'}`} />}
      <span className={`${RESOURCE_COLORS[label as ResourceType] || 'text-slate-300'} font-medium`}>{label.replace(/_/g, ' ')}:</span>
      <span className="text-slate-100 font-semibold">{formatNumber(value)}</span>
      {displayRatePerSecond !== undefined && (
        <span className="text-xs text-green-400">
          (+{formatNumber(displayRatePerSecond)}/s)
        </span>
      )}
    </div>
  );
};

export default ResourceItem;