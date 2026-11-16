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
