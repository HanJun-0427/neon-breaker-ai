export type GameMode = 'CAMPAIGN' | 'ENDLESS' | 'TIME_ATTACK';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER';

export type BrickType = 
  | 'NORMAL' 
  | 'ARMORED_2' 
  | 'ARMORED_3' 
  | 'EXPLOSIVE' 
  | 'PRISM' 
  | 'MYSTERY' 
  | 'GOLD';

export type PowerUpType = 
  | 'MULTI_BALL' 
  | 'LASER' 
  | 'WIDE_PADDLE' 
  | 'FIREBALL' 
  | 'SHIELD' 
  | 'SLOW_MO' 
  | 'LIFE';

export interface Ball {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
  isFireball: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hasLaser: boolean;
  laserCooldown: number;
}

export interface Brick {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hp: number;
  maxHp: number;
  color: string;
  points: number;
  isDying?: boolean;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  dy: number;
  type: PowerUpType;
  width: number;
  height: number;
  color: string;
  label: string;
}

export interface Laser {
  id: string;
  x: number;
  y: number;
  dy: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  dy: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  label: string;
  color: string;
  duration: number;
  remaining: number;
}

export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  rows: number;
  cols: number;
  targetScore: number;
  layout: (BrickType | null)[][];
}

export interface GameSaveData {
  highScore: number;
  endlessHighScore: number;
  timeAttackHighScore: number;
  highestUnlockedStage: number;
  stageStars: Record<number, number>; // stageId -> 1..3
  totalBricksDestroyed: number;
  maxComboAchieved: number;
  soundEnabled: boolean;
}
