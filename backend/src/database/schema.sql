CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  words_destroyed INTEGER DEFAULT 0,
  time_survived INTEGER DEFAULT 0,
  difficulty_level INTEGER DEFAULT 1,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_player_name ON scores(player_name);
