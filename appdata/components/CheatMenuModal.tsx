
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { ResourceType } from '../types';
import { ICONS } from './Icons';

interface CheatMenuModalProps extends Omit<ModalProps, 'title' | 'children'> {
  // No additional props needed for now
}

const CheatMenuModal: React.FC<CheatMenuModalProps> = ({ isOpen, onClose }) => {
  const { gameState, dispatch } = useGameContext();

  const handleAddResources = () => {
    dispatch({
      type: 'CHEAT_ADD_RESOURCES',
      payload: {
        [ResourceType.GOLD]: 100000,
        [ResourceType.FOOD]: 1000,
        [ResourceType.WOOD]: 50000,
        [ResourceType.STONE]: 20000,
        [ResourceType.IRON]: 10000,
        [ResourceType.CRYSTALS]: 10000,
        [ResourceType.LEATHER]: 5000,
        [ResourceType.HEROIC_POINTS]: 50000,
        [ResourceType.TOWN_XP]: 1000,
        [ResourceType.CATACOMB_BLUEPRINT]: 100,
        [ResourceType.HERB_BLOODTHISTLE]: 100,
        [ResourceType.HERB_IRONWOOD_LEAF]: 100,
        [ResourceType.AETHERIUM]: 10,
        [ResourceType.META_CURRENCY]: 10,
        [ResourceType.CATACOMB_KEY]: 10,
      }
    });
  };

  const handleAddShards = () => {
    dispatch({
      type: 'CHEAT_ADD_RESOURCES',
      payload: {
        // @ts-ignore - This is a debug/cheat structure.
        debugAddShardsToFirstHero: [
          { definitionId: 'ATTACK_SHARD_BASIC', level: 1, count: 4 },
          { definitionId: 'HEALTH_SHARD_BASIC', level: 1, count: 2 },
          { definitionId: 'DEFENSE_SHARD_BASIC', level: 1, count: 2 },
        ]
      }
    });
  };

  const handleUnlockWaves = () => {
    dispatch({ type: 'CHEAT_UNLOCK_ALL_WAVES' });
  };

  const handleRevealFloor = () => {
    dispatch({ type: 'CHEAT_REVEAL_DUNGEON_FLOOR' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Developer Cheats" size="md">
      <div className="space-y-3">
        <Button
          onClick={handleAddResources}
          variant="secondary"
          className="w-full"
          icon={ICONS.GOLD && <ICONS.GOLD className="w-4 h-4" />}
        >
          Add Dev Resources
        </Button>
        <Button
          onClick={handleAddShards}
          variant="secondary"
          className="w-full"
          icon={ICONS.SHARD_ICON && <ICONS.SHARD_ICON className="w-4 h-4" />}
        >
          Add Dev Shards (to first hero)
        </Button>
        <Button
          onClick={handleUnlockWaves}
          variant="secondary"
          className="w-full"
          icon={ICONS.FIGHT && <ICONS.FIGHT className="w-4 h-4" />}
        >
          Unlock All Waves & Heroes
        </Button>
        <Button
          onClick={handleRevealFloor}
          variant="secondary"
          className="w-full"
          disabled={!gameState.activeDungeonGrid}
          title={!gameState.activeDungeonGrid ? "Only available in a dungeon" : "Reveal current dungeon floor"}
          icon={ICONS.COMPASS && <ICONS.COMPASS className="w-4 h-4" />}
        >
          Reveal Dungeon Floor
        </Button>
        {/* New Cheats */}
        <Button
            onClick={() => dispatch({ type: 'CHEAT_ADD_RUN_XP' })}
            variant="secondary" className="w-full"
            disabled={!gameState.activeDungeonRun}
            title={!gameState.activeDungeonRun ? "Only available in a dungeon run" : "Add 1000 Run XP"}
        >
            Add 1000 Run XP
        </Button>
        <Button
            onClick={() => dispatch({ type: 'CHEAT_ADD_SPECIFIC_RUN_BUFF' })}
            variant="secondary" className="w-full"
            disabled={!gameState.activeDungeonRun}
            title={!gameState.activeDungeonRun ? "Only available in a dungeon run" : "Add Minor Strength Buff"}
        >
            Add Minor Strength Buff
        </Button>
        <Button
            onClick={() => dispatch({ type: 'CHEAT_UNLOCK_MAX_ALL_RUN_BUFFS' })}
            variant="secondary" className="w-full"
        >
            Unlock & Max All Library Buffs
        </Button>
        <Button
            onClick={() => dispatch({ type: 'CHEAT_FORCE_BATTLE_VICTORY' })}
            variant="secondary" className="w-full"
            disabled={!gameState.battleState || gameState.battleState.status !== 'FIGHTING'}
            title={!gameState.battleState || gameState.battleState.status !== 'FIGHTING' ? "Only available during a battle" : "Force Win Current Battle"}
        >
            Force Win Current Battle
        </Button>
         <Button
            onClick={() => dispatch({ type: 'CHEAT_MODIFY_FIRST_HERO_STATS' })}
            variant="secondary" className="w-full"
            disabled={gameState.heroes.length === 0}
            title={gameState.heroes.length === 0 ? "No heroes available" : "Buff First Hero"}
        >
            Buff First Hero (Lvl+1, SP+5, XP+500)
        </Button>
        <Button
            onClick={() => dispatch({ type: 'CHEAT_TOGGLE_GOD_MODE' })}
            variant={gameState.godModeActive ? "success" : "secondary"} className="w-full"
        >
            Toggle God Mode ({gameState.godModeActive ? "ON" : "OFF"})
        </Button>
      </div>
    </Modal>
  );
};

export default CheatMenuModal;
