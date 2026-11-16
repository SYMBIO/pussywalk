import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from './db'

/** Times below 40 s were never listed on the original scoreboard. */
export const MIN_SCORE_TIME = 40_000
/** The original client fetched at most 2000 rows (to locate the player's rank). */
export const MAX_LIMIT = 2000
export const SCORES_TAG = 'scores'

export type ScoreEntry = {
  id: number
  username: string
  time: number
  naked: boolean
}

async function queryTopScores(limit: number): Promise<ScoreEntry[]> {
  const rows = await sql`
    SELECT id, username, time_ms AS time, naked
    FROM scores
    WHERE time_ms >= ${MIN_SCORE_TIME}
    ORDER BY time_ms, created_at, id
    LIMIT ${limit}
  `
  return rows as ScoreEntry[]
}

/** Cached leaderboard read; invalidated via the `scores` tag on every new score. */
export async function getTopScores(limit: number): Promise<ScoreEntry[]> {
  'use cache'
  cacheTag(SCORES_TAG)
  cacheLife('hours')
  return queryTopScores(limit)
}

/** Uncached read used right after a write so the player always sees their own score. */
export function getTopScoresFresh(limit: number): Promise<ScoreEntry[]> {
  return queryTopScores(limit)
}

export type NewScore = Omit<ScoreEntry, 'id'> & { runId: string; ipHash: string | null }

export type InsertResult =
  | { ok: true; id: number }
  | { ok: false; reason: 'run_used' | 'duplicate' | 'rate_limited' }

/** Max submissions per (hashed) IP within RATE_WINDOW. A real run takes 40+ s. */
const RATE_LIMIT = 3
const RATE_WINDOW = '5 minutes'

export async function insertScore(score: NewScore): Promise<InsertResult> {
  if (score.ipHash) {
    const [{ recent }] = (await sql`
      SELECT count(*)::int AS recent FROM scores
      WHERE ip_hash = ${score.ipHash} AND created_at > now() - ${RATE_WINDOW}::interval
    `) as { recent: number }[]
    if (recent >= RATE_LIMIT) return { ok: false, reason: 'rate_limited' }
  }

  // Identical name + identical time to the millisecond is a replayed/forged
  // submission (the 2017 "Zeman znovu 2018" spam was 8x exactly 45.000 s).
  const dup = await sql`
    SELECT 1 FROM scores WHERE username = ${score.username} AND time_ms = ${score.time} LIMIT 1
  `
  if (dup.length > 0) return { ok: false, reason: 'duplicate' }

  const rows = await sql`
    INSERT INTO scores (username, time_ms, naked, run_id, ip_hash)
    VALUES (${score.username}, ${score.time}, ${score.naked}, ${score.runId}, ${score.ipHash})
    ON CONFLICT (run_id) DO NOTHING
    RETURNING id
  `
  if (rows.length === 0) return { ok: false, reason: 'run_used' }
  return { ok: true, id: (rows[0] as { id: number }).id }
}
