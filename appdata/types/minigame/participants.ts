export interface MinigameGolemState {
  id: string;
  r: number;
  c: number;
  golemType: 'DIRT' | 'CLAY' | 'SAND' | 'CRYSTAL';
  clickCooldownRemainingMs: number;
  moveCooldownRemainingMs: number;
  clickPower: number;
  lastClickTick?: number;
}

export interface MinigameMoleState {
  id: string;
  r: number;
  c: number;
  targetR: number | null;
  targetC: number | null;
  actionCooldownMs: number;
  moveCooldownMs: number;
}