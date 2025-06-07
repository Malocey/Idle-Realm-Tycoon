
import React from 'react';
import Button from '../Button';
import { MinigameUpgradeType, StoneQuarryMinigameState, ResourceType } from '../../types';
import { ICONS } from '../Icons';
import { formatNumber } from '../../utils';
import * as GameConstants from '../../constants'; // Namespace import
import { UpgradeConfig } from './MinigameUpgradesSection'; 

interface UpgradeButtonProps {
  config: UpgradeConfig;
  minigameState: StoneQuarryMinigameState;
  handleUpgrade: (upgradeType: MinigameUpgradeType) => void;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ config, minigameState, handleUpgrade }) => {
  const currentLevel = config.getCurrentLevel(minigameState);
  const costs = config.getCosts(currentLevel, minigameState);
  const canAfford = Object.keys(costs).every(
    resKey => (minigameState.resources[resKey as ResourceType] || 0) >= (costs[resKey as ResourceType] || 0)
  );
  const isEffectivelyMaxed = config.isMaxed(minigameState);
  const isDisabled = isEffectivelyMaxed || !canAfford;
  const costEntries = Object.entries(costs);

  return (
    <Button
      key={config.id}
      onClick={() => handleUpgrade(config.id)}
      variant="secondary"
      size="sm"
      className="w-full justify-start text-left py-1.5 px-2.5"
      disabled={isDisabled}
      title={isEffectivelyMaxed ? `${config.label} is maxed out!` : !canAfford ? 'Not enough resources' : `Upgrade ${config.label}`}
    >
      <div className="flex flex-col items-start text-xs">
        <span>{config.label}: <span className="font-normal">{config.bonusPerLevelDisplay}</span></span>
        <span className="text-[0.65rem] opacity-80">
          Cost:{' '}
          {costEntries.length > 0 ? costEntries.map(([resKey, amount], index) => {
            const Icon = ICONS[resKey as ResourceType];
            return (
              <React.Fragment key={resKey}>
                <span className={`${isDisabled && !isEffectivelyMaxed && (minigameState.resources[resKey as ResourceType] || 0) < (Number(amount) || 0) ? 'text-red-300' : (GameConstants.RESOURCE_COLORS[resKey as ResourceType] || 'text-slate-300')}`}>
                  {formatNumber(Number(amount) || 0)}
                  {Icon ? <Icon className={`inline w-2.5 h-2.5 mx-0.5 align-middle`} /> : <span className="mx-0.5">{resKey.charAt(0).toUpperCase()}</span>}
                </span>
                {index < costEntries.length - 1 && ', '}
              </React.Fragment>
            );
          }) : <span className="text-green-300">Free</span>}
        </span>
      </div>
    </Button>
  );
};

export default UpgradeButton;