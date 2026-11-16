-- PussyWalk II scoreboard (replaces Firebase Realtime DB `pussywalk-2/scoreboard`).
CREATE TABLE IF NOT EXISTS scores (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username    text        NOT NULL,
  time_ms     integer     NOT NULL CHECK (time_ms >= 0),
  naked       boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Firebase push key of records imported from the original scoreboard.
  legacy_key  text UNIQUE
);

-- The scoreboard only ever lists times >= 40 s, ordered fastest first.
CREATE INDEX IF NOT EXISTS scores_board_idx
  ON scores (time_ms, created_at, id)
  WHERE time_ms >= 40000;

-- Anti-cheat (2026-11): each score is bound to a single server-issued run
-- token, and submissions are rate limited per (hashed) client IP.
ALTER TABLE scores ADD COLUMN IF NOT EXISTS run_id text UNIQUE;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS ip_hash text;

CREATE INDEX IF NOT EXISTS scores_ip_recent_idx
  ON scores (ip_hash, created_at)
  WHERE ip_hash IS NOT NULL;

-- PussyWalk I (Flash, 1.pussywalk.com): the "winners" list is just names,
-- newest first. Legacy rows come from web/scores.json of the old server.
CREATE TABLE IF NOT EXISTS scores_v1 (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  ip_hash     text,
  legacy      boolean     NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS scores_v1_ip_recent_idx
  ON scores_v1 (ip_hash, created_at)
  WHERE ip_hash IS NOT NULL;
