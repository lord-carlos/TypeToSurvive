import db from '../database/db';
import type { CreateScoreInput, Score } from '../types/index';

export async function handlePostScore(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as CreateScoreInput;
    const { playerName, score, wordsDestroyed, timeSurvived, difficultyLevel } = body;

    if (!playerName || score === undefined || score === null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO scores (player_name, score, words_destroyed, time_survived, difficulty_level)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(playerName, score, wordsDestroyed, timeSurvived, difficultyLevel);

    const newScore: Score = {
      id: result.lastInsertRowid as number,
      playerName,
      score,
      wordsDestroyed,
      timeSurvived,
      difficultyLevel,
    };

    return Response.json(newScore, { status: 201 });
  } catch (error) {
    console.error('Error creating score:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function handleGetLeaderboard(_req: Request): Promise<Response> {
  try {
    const stmt = db.prepare(`
      SELECT id, player_name as playerName, score, words_destroyed as wordsDestroyed, 
             time_survived as timeSurvived, difficulty_level as difficultyLevel, 
             played_at as playedAt
      FROM scores
      ORDER BY score DESC
      LIMIT 10
    `);

    const scores = stmt.all() as Score[];
    return Response.json(scores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
