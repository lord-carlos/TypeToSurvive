import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { handlePostScore, handleGetLeaderboard } from '../scores';
import db from '../../database/db';

const TEST_PORT = 3002;
const BASE_URL = `http://localhost:${TEST_PORT}`;
let server: ReturnType<typeof Bun.serve>;

async function parseJson(response: Response): Promise<any> {
  return response.json();
}

describe('Scores API', () => {
  beforeAll(() => {
    db.exec('DELETE FROM scores');
    server = Bun.serve({
      port: TEST_PORT,
      routes: {
        '/api/scores': {
          POST: handlePostScore,
        },
        '/api/leaderboard': {
          GET: handleGetLeaderboard,
        },
      },
      fetch() {
        return new Response('Not Found', { status: 404 });
      },
    });
  });

  afterAll(() => {
    server.stop();
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
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validScoreData),
      });

      expect(response.status).toBe(201);
      const body = await parseJson(response);
      expect(body).toMatchObject({
        playerName: validScoreData.playerName,
        score: validScoreData.score,
        wordsDestroyed: validScoreData.wordsDestroyed,
        timeSurvived: validScoreData.timeSurvived,
        difficultyLevel: validScoreData.difficultyLevel,
      });
      expect(body.id).toBeDefined();
    });

    test('should accept a score of 0', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'ZeroScorePlayer',
          score: 0,
          wordsDestroyed: 0,
          timeSurvived: 0,
          difficultyLevel: 1,
        }),
      });

      expect(response.status).toBe(201);
      const body = await parseJson(response);
      expect(body.score).toBe(0);
      expect(body.playerName).toBe('ZeroScorePlayer');
    });

    test('should accept negative scores', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'NegativeScorePlayer',
          score: -100,
          wordsDestroyed: 0,
          timeSurvived: 5,
          difficultyLevel: 1,
        }),
      });

      expect(response.status).toBe(201);
      const body = await parseJson(response);
      expect(body.score).toBe(-100);
    });

    test('should reject request with missing playerName', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: 1000,
          wordsDestroyed: 50,
          timeSurvived: 120,
          difficultyLevel: 3,
        }),
      });

      expect(response.status).toBe(400);
      const body = await parseJson(response);
      expect(body.error).toBe('Missing required fields');
    });

    test('should reject request with missing score', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'TestPlayer',
          wordsDestroyed: 50,
          timeSurvived: 120,
          difficultyLevel: 3,
        }),
      });

      expect(response.status).toBe(400);
      const body = await parseJson(response);
      expect(body.error).toBe('Missing required fields');
    });

    test('should accept score with optional fields omitted', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'MinimalPlayer',
          score: 500,
        }),
      });

      expect(response.status).toBe(201);
      const body = await parseJson(response);
      expect(body.playerName).toBe('MinimalPlayer');
      expect(body.score).toBe(500);
      expect(body.wordsDestroyed).toBeUndefined();
      expect(body.timeSurvived).toBeUndefined();
      expect(body.difficultyLevel).toBeUndefined();
    });

    test('should handle empty playerName string', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: '',
          score: 1000,
        }),
      });

      expect(response.status).toBe(400);
      const body = await parseJson(response);
      expect(body.error).toBe('Missing required fields');
    });

    test('should accept score with very large numbers', async () => {
      const largeScore = 999999999;
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'HighScorer',
          score: largeScore,
          wordsDestroyed: 99999,
          timeSurvived: 99999,
          difficultyLevel: 999,
        }),
      });

      expect(response.status).toBe(201);
      const body = await parseJson(response);
      expect(body.score).toBe(largeScore);
    });

    test('should accept score with decimal values', async () => {
      const response = await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'DecimalPlayer',
          score: 100.5,
          timeSurvived: 60.3,
        }),
      });

      expect(response.status).toBe(201);
      const body = await parseJson(response);
      expect(body.score).toBe(100.5);
      expect(body.timeSurvived).toBe(60.3);
    });
  });

  describe('GET /api/leaderboard', () => {
    beforeEach(() => {
      db.exec('DELETE FROM scores');
    });

    test('should return empty array when no scores exist', async () => {
      const response = await fetch(`${BASE_URL}/api/leaderboard`);

      expect(response.status).toBe(200);
      const body = await parseJson(response);
      expect(body).toEqual([]);
    });

    test('should return all scores sorted by score DESC', async () => {
      const scores = [
        { playerName: 'Player1', score: 100 },
        { playerName: 'Player2', score: 300 },
        { playerName: 'Player3', score: 200 },
      ];

      for (const score of scores) {
        await fetch(`${BASE_URL}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(score),
        });
      }

      const response = await fetch(`${BASE_URL}/api/leaderboard`);

      expect(response.status).toBe(200);
      const body = await parseJson(response);
      expect(body).toHaveLength(3);
      expect(body[0].playerName).toBe('Player2');
      expect(body[0].score).toBe(300);
      expect(body[1].playerName).toBe('Player3');
      expect(body[1].score).toBe(200);
      expect(body[2].playerName).toBe('Player1');
      expect(body[2].score).toBe(100);
    });

    test('should limit results to top 10 scores', async () => {
      for (let i = 1; i <= 15; i++) {
        await fetch(`${BASE_URL}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName: `Player${i}`, score: i * 100 }),
        });
      }

      const response = await fetch(`${BASE_URL}/api/leaderboard`);

      expect(response.status).toBe(200);
      const body = await parseJson(response);
      expect(body).toHaveLength(10);
      expect(body[0].score).toBe(1500);
      expect(body[9].score).toBe(600);
    });

    test('should return scores with all required fields', async () => {
      const scoreData = {
        playerName: 'TestPlayer',
        score: 1000,
        wordsDestroyed: 50,
        timeSurvived: 120,
        difficultyLevel: 3,
      };

      await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });

      const response = await fetch(`${BASE_URL}/api/leaderboard`);

      expect(response.status).toBe(200);
      const body = await parseJson(response);
      expect(body[0]).toMatchObject({
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
      await fetch(`${BASE_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'TimestampPlayer',
          score: 1000,
        }),
      });

      const response = await fetch(`${BASE_URL}/api/leaderboard`);

      expect(response.status).toBe(200);
      const body = await parseJson(response);
      expect(body[0].playedAt).toBeDefined();
      expect(typeof body[0].playedAt).toBe('string');
      const date = new Date(body[0].playedAt);
      expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
    });
  });
});
