
import React, { useState, useMemo, useEffect } from 'react';
import { useGameContext } from '../context';
import { PlayerOwnedShard, ShardDefinition, PlayerHeroState, HeroStats, ResourceType, HeroDefinition } from '../types';
import ShardCard from './ShardCard';
import { ICONS } from './Icons';
import Button from './Button';
import Modal from './Modal'; // Added Modal for transfer confirmation
import { formatNumber, getShardDisplayValueUtil } from '../utils';
import { RESOURCE_COLORS, NOTIFICATION_ICONS } from '../constants';

interface GroupedShards {
  [definitionId: string]: {
    definition: ShardDefinition;
    levels: {
      [level: number]: PlayerOwnedShard[];
    };
  };
}

interface ShardsTabProps {
  selectedHeroState: PlayerHeroState | null;
}

const ShardsTab: React.FC<ShardsTabProps> = ({ selectedHeroState }) => {
  const { gameState, staticData, dispatch } = useGameContext();
  const [selectedShardForFusionInstanceId, setSelectedShardForFusionInstanceId] = useState<string | null>(null);
  
  // State for transfer functionality
  const [isTransferModeActive, setIsTransferModeActive] = useState(false);
  const [shardToTransfer, setShardToTransfer] = useState<PlayerOwnedShard | null>(null);
  const [transferTargetHeroId, setTransferTargetHeroId] = useState<string | null>(null);
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);

  useEffect(() => {
    // Reset selections when hero changes or transfer mode is toggled
    setSelectedShardForFusionInstanceId(null);
    setShardToTransfer(null);
    setTransferTargetHeroId(null);
    setShowTransferConfirmModal(false);
  }, [selectedHeroState?.definitionId, isTransferModeActive]);

  const heroShards = selectedHeroState?.ownedShards || [];

  const groupedShards = heroShards.reduce<GroupedShards>((acc, shard) => {
    const definition = staticData.shardDefinitions[shard.definitionId];
    if (!definition) return acc;
    if (!acc[shard.definitionId]) acc[shard.definitionId] = { definition, levels: {} };
    if (!acc[shard.definitionId].levels[shard.level]) acc[shard.definitionId].levels[shard.level] = [];
    acc[shard.definitionId].levels[shard.level].push(shard);
    return acc;
  }, {});

  const sortedShardTypes = Object.keys(groupedShards).sort((a, b) =>
    groupedShards[a].definition.name.localeCompare(groupedShards[b].definition.name)
  );

  const totalShardBonuses = useMemo(() => {
    if (!selectedHeroState) return {};
    const bonuses: Partial<HeroStats> = {};
    selectedHeroState.ownedShards.forEach(shard => {
      const shardDef = staticData.shardDefinitions[shard.definitionId];
      if (shardDef) {
        const value = getShardDisplayValueUtil(shardDef, shard.level);
        bonuses[shardDef.statAffected] = (bonuses[shardDef.statAffected] || 0) + value;
      }
    });
    return bonuses;
  }, [selectedHeroState, staticData.shardDefinitions]);

  const handleAutoFuseAll = () => {
    if (selectedHeroState) {
      dispatch({ type: 'FUSE_ALL_MATCHING_SHARDS_FOR_HERO', payload: { heroDefinitionId: selectedHeroState.definitionId } });
    }
  };

  const handleToggleTransferMode = () => {
    setIsTransferModeActive(prev => !prev);
  };

  const handleSelectShardForTransfer = (shard: PlayerOwnedShard) => {
    if (shardToTransfer?.instanceId === shard.instanceId) {
      setShardToTransfer(null);
    } else {
      setShardToTransfer(shard);
    }
    setTransferTargetHeroId(null);
  };

  const handleSelectTargetHeroForTransfer = (targetHero: PlayerHeroState) => {
    if (shardToTransfer && selectedHeroState && targetHero.definitionId !== selectedHeroState.definitionId) {
      setTransferTargetHeroId(targetHero.definitionId);
      setShowTransferConfirmModal(true);
    }
  };

  const confirmTransfer = () => {
    if (shardToTransfer && selectedHeroState && transferTargetHeroId) {
      dispatch({
        type: 'TRANSFER_SHARD',
        payload: {
          sourceHeroId: selectedHeroState.definitionId,
          targetHeroId: transferTargetHeroId,
          shardInstanceId: shardToTransfer.instanceId,
        },
      });
    }
    setShowTransferConfirmModal(false);
    setShardToTransfer(null);
    setTransferTargetHeroId(null);
  };


  const statToIconMap: Partial<Record<keyof HeroStats, string>> = {
      damage: 'SWORD', maxHp: 'HERO', defense: 'SHIELD', healPower: 'STAFF_ICON', maxMana: 'CRYSTALS',
      attackSpeed: 'WIND_SLASH', critChance: 'MAGIC_ARROW', critDamage: 'SWORD', hpRegen: 'HEALTH_POTION',
      manaRegen: 'MANA_POTION', maxEnergyShield: 'SHIELD_BADGE', energyShieldRechargeRate: 'ATOM_ICON', energyShieldRechargeDelay: 'WARNING'
  };
  const GenericShardIcon = ICONS.SHARD_ICON;

  if (!selectedHeroState) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-700/30 p-8 rounded-lg">
          {GenericShardIcon && <GenericShardIcon className="w-16 h-16 text-slate-500 mb-4" />}
          <p className="text-lg">Select a hero to manage their shards.</p>
        </div>
      </div>
    );
  }
  
  const selectedHeroName = staticData.heroDefinitions[selectedHeroState.definitionId]?.name || "Selected Hero";
  const otherHeroes = gameState.heroes.filter(h => h.definitionId !== selectedHeroState.definitionId);


  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-400">Shards for {selectedHeroName}</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAutoFuseAll} variant="primary" size="sm" icon={ICONS.FUSION_ICON && <ICONS.FUSION_ICON className="w-4 h-4"/>} disabled={heroShards.length < 2 || isTransferModeActive}>
            Auto-Fuse All
          </Button>
          {gameState.heroes.length > 1 && (
            <Button onClick={handleToggleTransferMode} variant={isTransferModeActive ? "danger" : "secondary"} size="sm" icon={ICONS.SHARD_ICON && <ICONS.SHARD_ICON className="w-4 h-4"/>}>
              {isTransferModeActive ? "Cancel Transfer Mode" : "Toggle Transfer Mode"}
            </Button>
          )}
        </div>
      </div>

      {Object.keys(totalShardBonuses).length > 0 && (
        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <h4 className="text-md font-semibold text-green-300 mb-1">Total Bonuses from Shards:</h4>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {(Object.keys(totalShardBonuses) as Array<keyof HeroStats>).map(statKey => {
              const value = totalShardBonuses[statKey];
              if (!value || value === 0) return null;
              const statName = statKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const Icon = ICONS[statToIconMap[statKey] || 'UPGRADE'];
              return ( <span key={statKey} className="text-green-400 flex items-center"> {Icon && <Icon className="w-4 h-4 mr-1"/>} +{formatNumber(value)} {statName} </span> );
            })}
          </div>
        </div>
      )}
      
      {heroShards.length === 0 && (
         <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-700/30 p-8 rounded-lg mt-4">
            {GenericShardIcon && <GenericShardIcon className="w-16 h-16 text-slate-500 mb-4" />}
            <p className="text-lg">{selectedHeroName} doesn't own any shards yet.</p>
            <p className="text-sm mt-1">Collect shards from battles or rewards!</p>
        </div>
      )}

      {heroShards.length > 0 && sortedShardTypes.map(definitionId => {
        const group = groupedShards[definitionId];
        const sortedLevels = Object.keys(group.levels).map(Number).sort((a, b) => a - b);
        const GroupIcon = ICONS[group.definition.iconName];

        return (
          <div key={definitionId} className="p-3 bg-slate-700/30 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-300 mb-2 flex items-center">
              {GroupIcon && <GroupIcon className="w-5 h-5 mr-2"/>} {group.definition.name}
            </h3>
            {sortedLevels.map(level => (
              <div key={level} className="mb-3">
                <h4 className="text-xs font-medium text-slate-400 mb-1.5 ml-1">Level {level} (x{group.levels[level].length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                  {group.levels[level].map(shard => (
                    <ShardCard
                      key={shard.instanceId}
                      heroDefinitionId={selectedHeroState.definitionId}
                      shard={shard}
                      definition={group.definition}
                      selectedShardForFusionInstanceId={isTransferModeActive ? null : selectedShardForFusionInstanceId}
                      setSelectedShardForFusionInstanceId={isTransferModeActive ? () => {} : setSelectedShardForFusionInstanceId}
                      onTransferClick={isTransferModeActive ? handleSelectShardForTransfer : undefined}
                      isTransferMode={isTransferModeActive}
                      isSelectedForTransfer={isTransferModeActive && shardToTransfer?.instanceId === shard.instanceId}
                    />
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(group.levels).length === 0 && <p className="text-sm text-slate-500 italic ml-1">No shards of this type for {selectedHeroName}.</p>}
          </div>
        );
      })}
      
      {isTransferModeActive && shardToTransfer && otherHeroes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-lg font-medium text-green-300 mb-2">Transfer "{staticData.shardDefinitions[shardToTransfer.definitionId]?.name} Lvl {shardToTransfer.level}" to:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {otherHeroes.map(targetHero => {
              const targetHeroDef = staticData.heroDefinitions[targetHero.definitionId];
              const TargetIcon = ICONS[targetHeroDef.iconName];
              return (
                <Button
                  key={targetHero.definitionId}
                  onClick={() => handleSelectTargetHeroForTransfer(targetHero)}
                  variant="secondary"
                  className="p-3 justify-start items-center space-x-2"
                  icon={TargetIcon && <TargetIcon className="w-6 h-6"/>}
                >
                  <span>{targetHeroDef.name} (Lvl {targetHero.level})</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
      {isTransferModeActive && shardToTransfer && otherHeroes.length === 0 && (
          <p className="text-slate-400 italic mt-4 pt-4 border-t border-slate-700">No other heroes available to transfer shards to.</p>
      )}

      {showTransferConfirmModal && shardToTransfer && selectedHeroState && transferTargetHeroId && (
        <Modal
          isOpen={showTransferConfirmModal}
          onClose={() => {
            setShowTransferConfirmModal(false);
            setTransferTargetHeroId(null); 
          }}
          title="Confirm Shard Transfer"
          size="sm"
        >
          <p className="text-slate-300 mb-4">
            Are you sure you want to transfer{' '}
            <strong>{staticData.shardDefinitions[shardToTransfer.definitionId]?.name} Lvl {shardToTransfer.level}</strong><br />
            from <strong>{staticData.heroDefinitions[selectedHeroState.definitionId]?.name}</strong><br />
            to <strong>{staticData.heroDefinitions[transferTargetHeroId]?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => { setShowTransferConfirmModal(false); setTransferTargetHeroId(null); }}>Cancel</Button>
            <Button variant="primary" onClick={confirmTransfer}>Confirm Transfer</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ShardsTab;
