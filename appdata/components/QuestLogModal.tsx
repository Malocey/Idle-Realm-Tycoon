
import React from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button'; // If needed for claim buttons later
import { ICONS } from './Icons'; // For quest icons
// import QuestCard from './QuestCard'; // To be created
// FIX: Add missing import for 'formatNumber'
import { formatNumber } from '../utils';
import { MAX_ACTIVE_QUESTS } from '../types';

interface QuestLogModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const QuestLogModal: React.FC<QuestLogModalProps> = ({ isOpen, onClose }) => {
  const { gameState, dispatch } = useGameContext();
  const { activeQuests } = gameState;

  const canRequestMoreQuests = activeQuests.length < MAX_ACTIVE_QUESTS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Quests" size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto fancy-scrollbar pr-2">
        {activeQuests.length === 0 ? (
          <div className="text-center py-8">
            {ICONS.QUEST_ICON && <ICONS.QUEST_ICON className="w-16 h-16 text-slate-500 mx-auto mb-4" />}
            <p className="text-slate-400">No active quests at the moment.</p>
            <p className="text-sm text-slate-500">New quests will appear here automatically, or you can request them.</p>
          </div>
        ) : (
          activeQuests.map(quest => (
            // Placeholder for QuestCard component
            <div key={quest.id} className={`p-4 bg-slate-700/50 rounded-lg border ${quest.isCompleted && !quest.isClaimed ? 'border-green-500' : 'border-slate-600'}`}>
              <h3 className="text-lg font-semibold text-amber-300 mb-1">{quest.title}</h3>
              {quest.objectives.map((obj, index) => {
                const progress = obj.targetValue > 0 ? Math.min(100, (obj.currentValue / obj.targetValue) * 100) : 0;
                return (
                    <div key={index} className="mb-1">
                    <p className="text-sm text-slate-300">{obj.description}</p>
                    <div className="w-full bg-slate-600 rounded-full h-2.5 mt-1">
                        <div 
                        className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%`}}
                        role="progressbar"
                        aria-valuenow={obj.currentValue}
                        aria-valuemin={0}
                        aria-valuemax={obj.targetValue}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right">{formatNumber(obj.currentValue)} / {formatNumber(obj.targetValue)}</p>
                    </div>
                );
              })}
              <div className="mt-2">
                <p className="text-xs text-slate-500 uppercase font-semibold">Rewards:</p>
                {quest.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center text-sm text-green-400">
                    {reward.iconName && ICONS[reward.iconName] && React.createElement(ICONS[reward.iconName], {className: "w-4 h-4 mr-1.5"})}
                    <span>{reward.description}</span>
                  </div>
                ))}
              </div>
              {quest.isCompleted && !quest.isClaimed && (
                <Button 
                  onClick={() => dispatch({ type: 'CLAIM_QUEST_REWARD', payload: { questId: quest.id }})}
                  variant="success"
                  size="sm"
                  className="w-full mt-3"
                  icon={ICONS.CHECK_CIRCLE && <ICONS.CHECK_CIRCLE className="w-4 h-4"/>}
                >
                  Claim Reward
                </Button>
              )}
              {quest.isClaimed && ( // Should not be visible if claimed quests are removed, but good for testing
                 <p className="text-sm text-green-400 text-center mt-3 py-1 bg-green-800/30 rounded">Reward Claimed!</p>
              )}
            </div>
            // Replace above div with <QuestCard key={quest.id} quest={quest} /> later
          ))
        )}
      </div>
      {canRequestMoreQuests && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <Button
            onClick={() => dispatch({ type: 'GENERATE_NEW_QUESTS' })}
            variant="secondary"
            size="md"
            className="w-full"
            icon={ICONS.QUEST_ICON && <ICONS.QUEST_ICON className="w-4 h-4" />}
          >
            Request New Quest(s) ({MAX_ACTIVE_QUESTS - activeQuests.length} slot(s) available)
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default QuestLogModal;