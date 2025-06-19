
import React from 'react';
import { useGameContext } from '../context';
import { ENEMY_DEFINITIONS } from '../gameData/index';
import { ICONS } from '../components/Icons';
import Button from '../components/Button';
import { formatNumber, getDemoniconRankChallengeDetails } from '../utils'; 
import { ResourceType, DemoniconMilestoneRewardDefinition, HeroStats } from '../types'; 

const DemoniconPortalView: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext();
  const { 
    defeatedEnemyTypes, 
    demoniconHighestRankCompleted, 
    activeView,
    globalDemoniconLevel,
    globalDemoniconXP,
    expToNextGlobalDemoniconLevel,
    achievedDemoniconMilestoneRewards // New
  } = gameState;

  if (activeView !== 'DEMONICON_PORTAL') return null; 

  const handleChallengeEnemy = (enemyId: string) => {
    dispatch({ type: 'START_DEMONICON_CHALLENGE', payload: { enemyId, rank: 0 } });
  };

  const unlockedEnemiesForDemonicon = defeatedEnemyTypes
    .map(enemyId => staticData.enemyDefinitions[enemyId])
    .filter(Boolean); 

  const globalDemoniconXPPercentage = expToNextGlobalDemoniconLevel > 0 
    ? (globalDemoniconXP / expToNextGlobalDemoniconLevel) * 100 
    : 0;
    
  const currentGlobalBonusValue = (globalDemoniconLevel -1) * 5;
  const nextGlobalLevelBonusValue = globalDemoniconLevel * 5;

  // Get active milestone bonuses for display
  const activeMilestoneBonuses = achievedDemoniconMilestoneRewards.map(rewardId => {
    // Find the full definition. This assumes rewardId is unique across all milestones.
    let foundDef: DemoniconMilestoneRewardDefinition | undefined;
    for (const enemyMilestones of Object.values(staticData.demoniconMilestoneRewards)) {
        foundDef = enemyMilestones.find(m => m.id === rewardId);
        if (foundDef) break;
    }
    return foundDef?.rewards.map(r => r.description).join(', ');
  }).filter(Boolean);


  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-bold text-rose-400 mb-2 text-center">Demonicon Portal</h2>
      <div className="text-center mb-6 bg-slate-800/70 p-3 rounded-lg shadow-md max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-amber-300">Global Demonicon Level: {globalDemoniconLevel}</h3>
        <div className="w-full bg-slate-700 rounded-full h-3 my-1">
            <div 
                className="bg-amber-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${globalDemoniconXPPercentage}%` }}
                role="progressbar"
                aria-label="Global Demonicon Experience Progress"
                aria-valuenow={globalDemoniconXP}
                aria-valuemin={0}
                aria-valuemax={expToNextGlobalDemoniconLevel}
            ></div>
        </div>
        <p className="text-xs text-slate-400">{formatNumber(globalDemoniconXP)} / {formatNumber(expToNextGlobalDemoniconLevel)} Global XP</p>
        {globalDemoniconLevel > 0 && (
            <div className="text-xs text-green-400 mt-1">
                Current Global Bonus: +{formatNumber(currentGlobalBonusValue)}% Resource Production & Hero XP Gain.
            </div>
        )}
         <div className="text-xs text-sky-300 mt-0.5">
            Next Level Bonus (Lvl {globalDemoniconLevel + 1}): +{formatNumber(nextGlobalLevelBonusValue)}% Resource Production & Hero XP Gain.
        </div>
        {activeMilestoneBonuses.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-xs font-semibold text-purple-300">Active Milestone Bonuses (Demonicon Only):</p>
                {activeMilestoneBonuses.map((bonusText, index) => (
                    <p key={index} className="text-xs text-purple-400">{bonusText}</p>
                ))}
            </div>
        )}
      </div>
      
      {unlockedEnemiesForDemonicon.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-400 text-lg">No enemy echoes available yet.</p>
          <p className="text-sm text-slate-500">Defeat new types of enemies in waves or dungeons to unlock them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {unlockedEnemiesForDemonicon.map(enemyDef => {
            const highestRankClearedInternal = demoniconHighestRankCompleted[enemyDef.id] ?? -1;
            const displayHighestRankCleared = highestRankClearedInternal === -1 ? 'None' : `Rank ${highestRankClearedInternal + 1}`;
            const EnemyIcon = ICONS[enemyDef.iconName] || ICONS.ENEMY;
            const totalDemonicCoinsEarned = highestRankClearedInternal > -1 ? (highestRankClearedInternal + 1) * 5 : 0;
            
            // For "Next Unbeaten Rank", if highest cleared is -1 (none), next is 0 (displayed as 1).
            // If highest cleared is 0 (displayed as 1), next is 1 (displayed as 2).
            const nextUnbeatenRankInternal = highestRankClearedInternal + 1;
            const displayNextUnbeatenRank = nextUnbeatenRankInternal + 1;
            const globalXpForNextUnbeatenRank = nextUnbeatenRankInternal + 1; // XP is rank + 1 (0-indexed based)
            
            const detailsForHighestCleared = highestRankClearedInternal > -1 ? getDemoniconRankChallengeDetails(highestRankClearedInternal) : null;
            const statBoostPercentHighest = detailsForHighestCleared ? ((detailsForHighestCleared.statMultiplier - 1) * 100).toFixed(0) : "0";

            const detailsForNextChallenge = getDemoniconRankChallengeDetails(nextUnbeatenRankInternal);
            const statBoostPercentNext = ((detailsForNextChallenge.statMultiplier - 1) * 100).toFixed(0);


            return (
              <div key={enemyDef.id} className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 hover:border-rose-500 transition-colors duration-150 flex flex-col justify-between animate-fadeIn">
                <div>
                  <div className="flex items-center mb-2">
                    <EnemyIcon className="w-10 h-10 mr-3 text-rose-300 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-rose-300">{enemyDef.name}</h3>
                      <p className="text-xs text-slate-400">Highest Cleared: {displayHighestRankCleared}</p>
                    </div>
                  </div>
                  {detailsForHighestCleared && (
                    <p className="text-xs text-slate-500 mb-1">
                      Stats for Highest Cleared (Rank {highestRankClearedInternal + 1}): {detailsForHighestCleared.enemyCount} Enemies, +{statBoostPercentHighest}% Stats
                    </p>
                  )}
                   <p className="text-xs text-amber-400 mb-1">Total Demonic Coins from this foe: {totalDemonicCoinsEarned}</p>
                  
                  <div className="mt-1 mb-2 p-1.5 bg-slate-700/50 rounded">
                    <p className="text-xs font-semibold text-sky-300">Next Unbeaten Rank ({displayNextUnbeatenRank}):</p>
                    <p className="text-xs text-slate-300">
                        Challenge: {detailsForNextChallenge.enemyCount} Enemies, +{statBoostPercentNext}% Stats
                    </p>
                    <p className="text-xs text-green-400">
                        Rewards: +5 Demonic Coins, +{globalXpForNextUnbeatenRank} Global XP
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleChallengeEnemy(enemyDef.id)}
                  variant="danger" 
                  size="sm"
                  className="w-full mt-2"
                  icon={ICONS.FIGHT && <ICONS.FIGHT className="w-4 h-4"/>}
                >
                  Challenge (Starts at Rank 1)
                </Button>
              </div>
            );
          })}
        </div>
      )}
       <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-amber-300 mb-2 flex items-center">
                {ICONS.DEMONIC_COIN && <ICONS.DEMONIC_COIN className="w-5 h-5 mr-2 text-rose-400"/>}
                Demonic Coins: <span className="ml-2 text-rose-400">{formatNumber(gameState.resources.DEMONIC_COIN || 0)}</span>
            </h3>
            <p className="text-sm text-slate-400">
                Earn Demonic Coins by clearing new highest ranks for each enemy in the Demonicon. (Shop for upgrades coming soon!)
            </p>
        </div>
    </div>
  );
};

export default DemoniconPortalView;
