export type WordDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface WordEntity {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  typedChars: number;
  isDestroyed: boolean;
  distanceTraveled: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface DifficultyConfig {
  spawnRate: number;
  speedMultiplier: number;
  wordDifficulty: WordDifficulty;
}
