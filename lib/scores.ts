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

export async function insertScore(score: Omit<ScoreEntry, 'id'>): Promise<number> {
  const rows = await sql`
    INSERT INTO scores (username, time_ms, naked)
    VALUES (${score.username}, ${score.time}, ${score.naked})
    RETURNING id
  `
  return (rows[0] as { id: number }).id
}
