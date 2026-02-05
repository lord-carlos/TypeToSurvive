import request from 'supertest';
import express from 'express';
import cors from 'cors';
import scoresRouter from '../scores';
import db from '../../database/db';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', scoresRouter);

describe('Scores API', () => {
  beforeAll(() => {
    db.exec('DELETE FROM scores');
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/scores', () => {
    const validScoreData = {
      playerName: 'TestPlayer',
      score: 1000,
      wordsDestroyed: 50,
      timeSurvived: 120,
      difficultyLevel: 3,
    };

    test('should create a new score with valid data', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send(validScoreData)
        .expect(201);

      expect(response.body).toMatchObject({
        playerName: validScoreData.playerName,
        score: validScoreData.score,
        wordsDestroyed: validScoreData.wordsDestroyed,
        timeSurvived: validScoreData.timeSurvived,
        difficultyLevel: validScoreData.difficultyLevel,
      });
      expect(response.body.id).toBeDefined();
    });

    test('should accept a score of 0', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: 'ZeroScorePlayer',
          score: 0,
          wordsDestroyed: 0,
          timeSurvived: 0,
          difficultyLevel: 1,
        })
        .expect(201);

      expect(response.body.score).toBe(0);
      expect(response.body.playerName).toBe('ZeroScorePlayer');
    });

    test('should accept negative scores', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: 'NegativeScorePlayer',
          score: -100,
          wordsDestroyed: 0,
          timeSurvived: 5,
          difficultyLevel: 1,
        })
        .expect(201);

      expect(response.body.score).toBe(-100);
    });

    test('should reject request with missing playerName', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          score: 1000,
          wordsDestroyed: 50,
          timeSurvived: 120,
          difficultyLevel: 3,
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    test('should reject request with missing score', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: 'TestPlayer',
          wordsDestroyed: 50,
          timeSurvived: 120,
          difficultyLevel: 3,
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    test('should accept score with optional fields omitted', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: 'MinimalPlayer',
          score: 500,
        })
        .expect(201);

      expect(response.body.playerName).toBe('MinimalPlayer');
      expect(response.body.score).toBe(500);
      expect(response.body.wordsDestroyed).toBeUndefined();
      expect(response.body.timeSurvived).toBeUndefined();
      expect(response.body.difficultyLevel).toBeUndefined();
    });

    test('should handle empty playerName string', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: '',
          score: 1000,
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    test('should accept score with very large numbers', async () => {
      const largeScore = 999999999;
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: 'HighScorer',
          score: largeScore,
          wordsDestroyed: 99999,
          timeSurvived: 99999,
          difficultyLevel: 999,
        })
        .expect(201);

      expect(response.body.score).toBe(largeScore);
    });

    test('should accept score with decimal values', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          playerName: 'DecimalPlayer',
          score: 100.5,
          timeSurvived: 60.3,
        })
        .expect(201);

      expect(response.body.score).toBe(100.5);
      expect(response.body.timeSurvived).toBe(60.3);
    });
  });

  describe('GET /api/leaderboard', () => {
    beforeEach(() => {
      db.exec('DELETE FROM scores');
    });

    test('should return empty array when no scores exist', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all scores sorted by score DESC', async () => {
      const scores = [
        { playerName: 'Player1', score: 100 },
        { playerName: 'Player2', score: 300 },
        { playerName: 'Player3', score: 200 },
      ];

      for (const score of scores) {
        await request(app).post('/api/scores').send(score);
      }

      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].playerName).toBe('Player2');
      expect(response.body[0].score).toBe(300);
      expect(response.body[1].playerName).toBe('Player3');
      expect(response.body[1].score).toBe(200);
      expect(response.body[2].playerName).toBe('Player1');
      expect(response.body[2].score).toBe(100);
    });

    test('should limit results to top 10 scores', async () => {
      const scores = [];
      for (let i = 1; i <= 15; i++) {
        scores.push({ playerName: `Player${i}`, score: i * 100 });
        await request(app).post('/api/scores').send(scores[i - 1]);
      }

      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body).toHaveLength(10);
      expect(response.body[0].score).toBe(1500);
      expect(response.body[9].score).toBe(600);
    });

    test('should return scores with all required fields', async () => {
      const scoreData = {
        playerName: 'TestPlayer',
        score: 1000,
        wordsDestroyed: 50,
        timeSurvived: 120,
        difficultyLevel: 3,
      };

      await request(app).post('/api/scores').send(scoreData);

      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
        playerName: scoreData.playerName,
        score: scoreData.score,
        wordsDestroyed: scoreData.wordsDestroyed,
        timeSurvived: scoreData.timeSurvived,
        difficultyLevel: scoreData.difficultyLevel,
        playedAt: expect.any(String),
      });
    });

    test('should include playedAt timestamp', async () => {
      await request(app).post('/api/scores').send({
        playerName: 'TimestampPlayer',
        score: 1000,
      });

      const response = await request(app)
        .get('/api/leaderboard')
        .expect(200);

      expect(response.body[0].playedAt).toBeDefined();
      expect(typeof response.body[0].playedAt).toBe('string');
      const date = new Date(response.body[0].playedAt);
      expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
    });
  });
});
