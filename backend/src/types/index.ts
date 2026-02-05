export interface Score {
  id?: number;
  playerName: string;
  score: number;
  wordsDestroyed: number;
  timeSurvived: number;
  difficultyLevel: number;
  playedAt?: Date;
}

export interface CreateScoreInput {
  playerName: string;
  score: number;
  wordsDestroyed: number;
  timeSurvived: number;
  difficultyLevel: number;
}
