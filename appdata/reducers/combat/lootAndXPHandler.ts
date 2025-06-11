
import { BattleEnemy, BattleHero, Cost, GameNotification, ResourceType, GlobalBonuses, BuildingLevelUpEventInBattle, GameState, GameAction, ResonanceMoteType, HeroStats } from '../../types';
import { ENEMY_DEFINITIONS, BUILDING_DEFINITIONS, HERO_DEFINITIONS, DUNGEON_DEFINITIONS, AETHERIC_RESONANCE_STAT_CONFIGS } from '../../gameData/index'; // Added AETHERIC_RESONANCE_STAT_CONFIGS
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
  newlyAddedToFirstTimeDefeatsForAccXp: string[];
} => {
  let updatedLoot = [...currentLootCollected];
  let updatedExp = currentExpCollected;
  let updatedHeroesCopy = currentHeroes.map(h => ({...h})); 
  const newlyDefeatedWithLoot: Record<string, { loot: Cost[], originalIconName: string, originalEnemyId: string }> = {};
  let updatedBuildingsCopy = [...currentBuildings];
  let updatedBuildingLevelUpEventsGameStateCopy = {...currentBuildingLevelUpEventsGameState};
  let updatedBuildingLevelUpEventsInBattleCopy = [...currentBuildingLevelUpEventsInBattle];
  const logMessages: string[] = [];
  let updatedNotificationsCopy = [...currentNotifications];
  const deferredActions: GameAction[] = [];
  let sharedSkillPointsGainedThisTick = 0;
  const newlyAddedToFirstTimeDefeatsForAccXp: string[] = [];


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
    let droppedLoot = calculateIndividualEnemyLoot(enemyDef.loot, difficultyScale, enemy.isElite, dungeonTierForLoot);

    droppedLoot = droppedLoot.map(lootItem => {
        if (lootItem.resource === ResourceType.GOLD) {
            return { ...lootItem, amount: Math.floor(lootItem.amount * (1 + globalBonuses.enemyGoldDropBonus)) };
        }
        return lootItem;
    });

    newlyDefeatedWithLoot[enemy.uniqueBattleId] = {
        loot: droppedLoot,
        originalIconName: enemyDef.iconName,
        originalEnemyId: enemyDef.id
    };

    if (droppedLoot.length > 0) {
      logMessages.push(`  &#8627; ${enemy.name} dropped ${droppedLoot.map(l => `${formatNumber(l.amount)} ${l.resource.replace(/_/g, ' ')}`).join(', ')}!`);
      droppedLoot.forEach(lootItem => {
        const lootIndex = updatedLoot.findIndex(l => l.resource === lootItem.resource);
        if (lootIndex !== -1) {
          updatedLoot[lootIndex] = { ...updatedLoot[lootIndex], amount: updatedLoot[lootIndex].amount + lootItem.amount };
        } else {
          updatedLoot.push({ ...lootItem });
        }
      });
    }

    // --- Stat-spezifische Resonanz-Mote Drop Logik ---
    const isBoss = enemyDef.id.startsWith('BOSS_');
    const baseDropChanceForAnyMote = 0.55; // Circa 55% Basis-Drop-Chance für irgendeinen Splitter von normalen Gegnern

    if (Math.random() < baseDropChanceForAnyMote) {
        let quality: ResonanceMoteType;
        let numMotesToDrop = 1;

        if (isBoss) {
            quality = Math.random() < 0.5 ? 'potent' : 'clear';
            numMotesToDrop = Math.floor(Math.random() * 2) + 2; // Boss: 2-3 Motes
        } else if (enemy.isElite) {
            const randQualityElite = Math.random();
            if (randQualityElite < 0.15) quality = 'potent';
            else if (randQualityElite < 0.55) quality = 'clear';
            else quality = 'faint';
            numMotesToDrop = Math.random() < 0.3 ? 2 : 1;
        } else { // Normale Gegner
            const randQualityNormal = Math.random();
            if (randQualityNormal < 0.03) quality = 'potent';
            else if (randQualityNormal < 0.15) quality = 'clear';
            else quality = 'faint';
        }

        // Stat bestimmen basierend auf dropWeight
        const totalWeight = AETHERIC_RESONANCE_STAT_CONFIGS.reduce((sum, config) => sum + config.dropWeight, 0);
        let randomWeight = Math.random() * totalWeight;
        let chosenStatId: keyof HeroStats | undefined;

        for (const config of AETHERIC_RESONANCE_STAT_CONFIGS) {
            if (randomWeight < config.dropWeight) {
                chosenStatId = config.id;
                break;
            }
            randomWeight -= config.dropWeight;
        }

        if (chosenStatId) {
            deferredActions.push({ type: 'COLLECT_RESONANCE_MOTES', payload: { statId: chosenStatId, quality, amount: numMotesToDrop } });
            // Deutsche Kommentare: Benachrichtigung für den Mote-Drop erfolgt im aethericResonanceReducer beim Infundieren oder bei Bedarf hier.
        }
    }
    // --- Ende Resonanz-Mote Drop Logik ---


    const expFromThisEnemy = enemyDef.expReward;

    if (gameState.firstTimeEnemyDefeatsAccountXP && !gameState.firstTimeEnemyDefeatsAccountXP.includes(enemyDef.id)) {
        let accountXpForFirstDefeat = 0;
        if (enemy.isElite) {
            accountXpForFirstDefeat = Math.floor(expFromThisEnemy * 0.75);
        } else if (isBoss) {
            accountXpForFirstDefeat = Math.floor(expFromThisEnemy * 1.0);
        } else {
            accountXpForFirstDefeat = Math.floor(expFromThisEnemy * 0.5);
        }
        if (accountXpForFirstDefeat > 0) {
            deferredActions.push({ type: 'GAIN_ACCOUNT_XP', payload: { amount: accountXpForFirstDefeat, source: `${enemyDef.name} (First Defeat)` } });
            newlyAddedToFirstTimeDefeatsForAccXp.push(enemyDef.id);
        }
    }

    if (gameState.battleState?.isDungeonGridBattle && gameState.activeDungeonRun) {
        const runXpFromEnemy = Math.floor(enemyDef.expReward * 0.10);
        if (runXpFromEnemy > 0) {
            deferredActions.push({ type: 'GAIN_RUN_XP', payload: { amount: runXpFromEnemy } });
        }
    }

    const livingHeroesForXp = updatedHeroesCopy.filter(h => h.currentHp > 0);
    if (expFromThisEnemy > 0 && livingHeroesForXp.length > 0) {
      let modifiedExpFromEnemyForPool = expFromThisEnemy * (1 + globalBonuses.heroicPointsGainBonus);
      updatedExp += modifiedExpFromEnemyForPool;

      let modifiedHeroXpFromEnemy = expFromThisEnemy * (1 + globalBonuses.heroXpGainBonus);
      const expPerLivingHero = Math.floor(modifiedHeroXpFromEnemy / livingHeroesForXp.length);

      updatedHeroesCopy = updatedHeroesCopy.map(battleHero => {
        if (battleHero.currentHp > 0) {
          const heroBeforeXP = { ...battleHero };
          let newHeroDataAfterXP = { ...battleHero };
          newHeroDataAfterXP.currentExp += expPerLivingHero;

          while (newHeroDataAfterXP.currentExp >= newHeroDataAfterXP.expToNextLevel && newHeroDataAfterXP.level < (HERO_DEFINITIONS[newHeroDataAfterXP.definitionId] ? 100 : 100)) {
            newHeroDataAfterXP.currentExp -= newHeroDataAfterXP.expToNextLevel;
            newHeroDataAfterXP.level++;
            newHeroDataAfterXP.skillPoints = (newHeroDataAfterXP.skillPoints || 0) + 1;
            newHeroDataAfterXP.expToNextLevel = getExpToNextHeroLevel(newHeroDataAfterXP.level);
            logMessages.push(`  &#8627; ${newHeroDataAfterXP.name} reached Level ${newHeroDataAfterXP.level}!`);
            deferredActions.push({ type: 'GAIN_ACCOUNT_XP', payload: { amount: (newHeroDataAfterXP.level * 5), source: `${newHeroDataAfterXP.name} Level Up` } });
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

        const levelUpMsg = `${buildingDef.name} leveled up from loot (Lvl ${newLevel})!`; // Englischer Text
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
    newlyAddedToFirstTimeDefeatsForAccXp,
  };
};
