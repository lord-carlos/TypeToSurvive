export interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  typedChars: number;
  isDestroyed: boolean;
}

export interface GameState {
  health: number;
  score: number;
  wordsDestroyed: number;
  timeSurvived: number;
  difficultyLevel: number;
  isGameOver: boolean;
}

export interface Score {
  id?: number;
  playerName: string;
  score: number;
  wordsDestroyed: number;
  timeSurvived: number;
  difficultyLevel: number;
  playedAt: Date;
}

export interface DifficultyLevel {
  spawnRate: number;
  speedMultiplier: number;
  wordDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export type WordDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const GameScreenState = {
  START_SCREEN: 'start_screen',
  GAME_PLAYING: 'game_playing',
  GAME_OVER: 'game_over'
} as const;

export type GameScreenState = typeof GameScreenState[keyof typeof GameScreenState];

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}
