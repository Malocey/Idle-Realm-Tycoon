
import { BattleHero, BattleEnemy, BattleState } from '../../types';

export const checkBattleStatus = (
  heroes: BattleHero[],
  enemies: BattleEnemy[]
): BattleState['status'] => {
  const livingHeroes = heroes.filter(h => h.currentHp > 0);
  const livingEnemies = enemies.filter(e => e.currentHp > 0);

  if (livingHeroes.length === 0) {
    return 'DEFEAT';
  }
  if (livingEnemies.length === 0) {
    return 'VICTORY';
  }
  return 'FIGHTING';
};
