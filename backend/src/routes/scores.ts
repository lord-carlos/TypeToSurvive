import { Router } from 'express';
import db from '../database/db';
import type { CreateScoreInput, Score } from '../types/index';

const router = Router();

router.post('/scores', (req, res) => {
  try {
    const { playerName, score, wordsDestroyed, timeSurvived, difficultyLevel }: CreateScoreInput = req.body;

    if (!playerName || score === undefined || score === null) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    res.status(201).json(newScore);
  } catch (error) {
    console.error('Error creating score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard', (_req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, player_name as playerName, score, words_destroyed as wordsDestroyed, 
             time_survived as timeSurvived, difficulty_level as difficultyLevel, 
             played_at as playedAt
      FROM scores
      ORDER BY score DESC
      LIMIT 50
    `);

    const scores = stmt.all() as Score[];
    res.json(scores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
