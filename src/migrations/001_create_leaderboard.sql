CREATE TABLE IF NOT EXISTS leaderboard (
  id         SERIAL PRIMARY KEY,
  player     VARCHAR(64) NOT NULL,
  score      INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC);
