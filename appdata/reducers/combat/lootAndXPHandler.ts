

import { BattleEnemy, BattleHero, Cost, GameNotification, ResourceType, GlobalBonuses, BuildingLevelUpEventInBattle, GameState, GameAction } from '../../types';
import { ENEMY_DEFINITIONS, BUILDING_DEFINITIONS, HERO_DEFINITIONS, DUNGEON_DEFINITIONS } from '../../gameData/index'; // Added DUNGEON_DEFINITIONS
import { calculateIndividualEnemyLoot, formatNumber, getExpToNextHeroLevel } from '../../utils';
import { NOTIFICATION_ICONS } from '../../constants';
import { ICONS } from '../../components/Icons';


export const handleLootAndXP = (
  newlyDefeatedEnemiesThisTick: BattleEnemy[],
  currentHeroes: BattleHero[],
  currentLootCollected: Cost[],
  currentExpCollected: number,
  currentBuildings: GameState['buildings'],
  currentBuildingLevelUpEventsGameState: GameState['buildingLevelUpEvents'],
  currentBuildingLevelUpEventsInBattle: BuildingLevelUpEventInBattle[],
  currentNotifications: GameNotification[],
  gameState: GameState,
  globalBonuses: GlobalBonuses
): {
  updatedLootCollected: Cost[];
  updatedBattleExpCollected: number;
  updatedHeroes: BattleHero[];
  newlyDefeatedWithLoot: Record<string, { loot: Cost[], originalIconName: string, originalEnemyId: string }>;
  updatedBuildings: GameState['buildings'];
  updatedBuildingLevelUpEventsGameState: GameState['buildingLevelUpEvents'];
  updatedBuildingLevelUpEventsInBattle: BuildingLevelUpEventInBattle[];
  logMessages: string[];
  updatedNotifications: GameNotification[];
  deferredActions: GameAction[];
  sharedSkillPointsGained: number;
} => {
  let updatedLoot = [...currentLootCollected];
  let updatedExp = currentExpCollected;
  let updatedHeroesCopy = currentHeroes.map(h => ({...h})); // Ensure mutable copies
  const newlyDefeatedWithLoot: Record<string, { loot: Cost[], originalIconName: string, originalEnemyId: string }> = {};
  let updatedBuildingsCopy = [...currentBuildings];
  let updatedBuildingLevelUpEventsGameStateCopy = {...currentBuildingLevelUpEventsGameState};
  let updatedBuildingLevelUpEventsInBattleCopy = [...currentBuildingLevelUpEventsInBattle];
  const logMessages: string[] = [];
  let updatedNotificationsCopy = [...currentNotifications];
  const deferredActions: GameAction[] = [];
  let sharedSkillPointsGainedThisTick = 0;


  newlyDefeatedEnemiesThisTick.forEach(enemy => {
    const difficultyScale = gameState.battleState!.isDungeonGridBattle && gameState.battleState!.dungeonFloor !== undefined
      ? 1 + (gameState.battleState!.dungeonFloor * 0.15)
      : gameState.battleState!.waveNumber ? 1 + ((gameState.battleState!.waveNumber - 1) * 0.1) : 1;

    const enemyDef = ENEMY_DEFINITIONS[enemy.id];

    let dungeonTierForLoot: number | undefined = undefined;
    if (gameState.battleState?.isDungeonGridBattle && gameState.battleState.dungeonRunId && gameState.battleState.dungeonFloor !== undefined) {
        const dungeonRunDef = DUNGEON_DEFINITIONS[gameState.battleState.dungeonRunId];
        if (dungeonRunDef) {
            dungeonTierForLoot = dungeonRunDef.tier;
        }
    }
    const droppedLoot = calculateIndividualEnemyLoot(enemyDef.loot, difficultyScale, enemy.isElite, dungeonTierForLoot);

    newlyDefeatedWithLoot[enemy.uniqueBattleId] = {
        loot: droppedLoot,
        originalIconName: enemyDef.iconName,
        originalEnemyId: enemyDef.id
    };

    if (droppedLoot.length > 0) {
      logMessages.push(`  ↳ ${enemy.name} dropped ${droppedLoot.map(l => `${formatNumber(l.amount)} ${l.resource.replace(/_/g, ' ')}`).join(', ')}!`);
      droppedLoot.forEach(lootItem => {
        const lootIndex = updatedLoot.findIndex(l => l.resource === lootItem.resource);
        if (lootIndex !== -1) {
          updatedLoot[lootIndex] = { ...updatedLoot[lootIndex], amount: updatedLoot[lootIndex].amount + lootItem.amount };
        } else {
          updatedLoot.push({ ...lootItem });
        }
      });
    }

    const expFromThisEnemy = enemyDef.expReward;

    if (gameState.battleState?.isDungeonGridBattle && gameState.activeDungeonRun) {
        const runXpFromEnemy = Math.floor(enemyDef.expReward * 0.10);
        if (runXpFromEnemy > 0) {
            deferredActions.push({ type: 'GAIN_RUN_XP', payload: { amount: runXpFromEnemy } });
        }
    }

    const livingHeroesForXp = updatedHeroesCopy.filter(h => h.currentHp > 0);
    if (expFromThisEnemy > 0 && livingHeroesForXp.length > 0) {
      let modifiedExpFromEnemy = expFromThisEnemy * (1 + globalBonuses.heroXpGainBonus);
      updatedExp += modifiedExpFromEnemy;
      const expPerLivingHero = Math.floor(modifiedExpFromEnemy / livingHeroesForXp.length);

      updatedHeroesCopy = updatedHeroesCopy.map(battleHero => {
        if (battleHero.currentHp > 0) {
          const heroBeforeXP = { ...battleHero }; 
          let newHeroDataAfterXP = { ...battleHero };
          newHeroDataAfterXP.currentExp += expPerLivingHero;
          
          while (newHeroDataAfterXP.currentExp >= newHeroDataAfterXP.expToNextLevel && newHeroDataAfterXP.level < (HERO_DEFINITIONS[newHeroDataAfterXP.definitionId]?.baseStats ? 100 : 100)) {
            newHeroDataAfterXP.currentExp -= newHeroDataAfterXP.expToNextLevel;
            newHeroDataAfterXP.level++;
            newHeroDataAfterXP.skillPoints = (newHeroDataAfterXP.skillPoints || 0) + 1;
            newHeroDataAfterXP.expToNextLevel = getExpToNextHeroLevel(newHeroDataAfterXP.level);
            logMessages.push(`  ↳ ${newHeroDataAfterXP.name} leveled up to ${newHeroDataAfterXP.level}!`);
          }
          const levelsActuallyGained = newHeroDataAfterXP.level - heroBeforeXP.level;
          if (levelsActuallyGained > 0) {
            sharedSkillPointsGainedThisTick += levelsActuallyGained;
          }
          return newHeroDataAfterXP;
        }
        return battleHero;
      });
    }

    const BUILDING_LEVEL_UP_CHANCE_FROM_LOOT = 0.05;
    if (Math.random() < BUILDING_LEVEL_UP_CHANCE_FROM_LOOT) {
      const eligibleBuildings = updatedBuildingsCopy.filter(b => {
        const def = BUILDING_DEFINITIONS[b.id];
        return def && (def.maxLevel === -1 || b.level < def.maxLevel);
      });

      if (eligibleBuildings.length > 0) {
        const randomBuildingState = eligibleBuildings[Math.floor(Math.random() * eligibleBuildings.length)];
        const buildingDef = BUILDING_DEFINITIONS[randomBuildingState.id];
        const newLevel = randomBuildingState.level + 1;

        updatedBuildingsCopy = updatedBuildingsCopy.map(b =>
          b.id === randomBuildingState.id ? { ...b, level: newLevel } : b
        );
        updatedBuildingLevelUpEventsGameStateCopy[randomBuildingState.id] = { timestamp: Date.now() };

        const buildingLevelUpEventForSpoils: BuildingLevelUpEventInBattle = {
          id: `${randomBuildingState.id}-${Date.now()}`,
          buildingId: randomBuildingState.id,
          buildingName: buildingDef.name,
          newLevel: newLevel,
          iconName: buildingDef.iconName,
          timestamp: Date.now()
        };
        updatedBuildingLevelUpEventsInBattleCopy.push(buildingLevelUpEventForSpoils);

        const levelUpMsg = `${buildingDef.name} gained a level from loot (Lvl ${newLevel})!`;
        logMessages.push(`✨ ${levelUpMsg}`);
        updatedNotificationsCopy.push({
          id: Date.now().toString() + "-bldgLvlUp-" + randomBuildingState.id,
          message: levelUpMsg,
          type: 'success',
          iconName: ICONS.UPGRADE ? 'UPGRADE' : NOTIFICATION_ICONS.success,
          timestamp: Date.now(),
        });
      }
    }
  });

  return {
    updatedLootCollected: updatedLoot,
    updatedBattleExpCollected: updatedExp,
    updatedHeroes: updatedHeroesCopy,
    newlyDefeatedWithLoot,
    updatedBuildings: updatedBuildingsCopy,
    updatedBuildingLevelUpEventsGameState: updatedBuildingLevelUpEventsGameStateCopy,
    updatedBuildingLevelUpEventsInBattle: updatedBuildingLevelUpEventsInBattleCopy,
    logMessages,
    updatedNotifications: updatedNotificationsCopy,
    deferredActions,
    sharedSkillPointsGained: sharedSkillPointsGainedThisTick,
  };
};