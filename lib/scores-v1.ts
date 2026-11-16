import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from './db'

// PussyWalk I (Flash) "winners" list: names only, newest first.

export const SCORES_V1_TAG = 'scores-v1'
const MAX_NAMES = 5000

/** Same shape the Flash game read from the old static scores.json. */
export async function getV1Names(): Promise<{ name: string }[]> {
  'use cache'
  cacheTag(SCORES_V1_TAG)
  cacheLife('hours')
  const rows = await sql`SELECT name FROM scores_v1 ORDER BY id DESC LIMIT ${MAX_NAMES}`
  return rows as { name: string }[]
}

const RATE_LIMIT = 3
const RATE_WINDOW = '5 minutes'

export async function insertV1Name(name: string, ipHash: string | null) {
  if (ipHash) {
    const [{ recent }] = (await sql`
      SELECT count(*)::int AS recent FROM scores_v1
      WHERE ip_hash = ${ipHash} AND created_at > now() - ${RATE_WINDOW}::interval
    `) as { recent: number }[]
    if (recent >= RATE_LIMIT) return false
  }
  await sql`INSERT INTO scores_v1 (name, ip_hash) VALUES (${name}, ${ipHash})`
  return true
}
