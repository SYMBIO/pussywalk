import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import {
  MAX_LIMIT,
  SCORES_TAG,
  getTopScores,
  getTopScoresFresh,
  insertScore,
} from '@/lib/scores'

const MAX_USERNAME_LENGTH = 20 // matches the `maxlength` of the name input
const MAX_TIME = 2_147_483_647

// GET /api/scores?limit=100|2000 — leaderboard, fastest first.
export async function GET(request: NextRequest) {
  // Only two page sizes are used by the game; keep the cache keyspace small.
  const requested = Number(request.nextUrl.searchParams.get('limit'))
  const limit = requested > 100 ? MAX_LIMIT : 100

  const entries = await getTopScores(limit)
  return Response.json({ entries })
}

// POST /api/scores { username, time, naked } — records a finished run.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const score = parseScore(body)
  if (!score) {
    return Response.json({ error: 'invalid score' }, { status: 400 })
  }

  const id = await insertScore(score)
  revalidateTag(SCORES_TAG, 'max')

  const entries = await getTopScoresFresh(MAX_LIMIT)
  return Response.json({ id, entries }, { status: 201 })
}

function parseScore(body: unknown) {
  if (typeof body !== 'object' || body === null) return null
  const { username, time, naked } = body as Record<string, unknown>

  if (typeof username !== 'string') return null
  // Strip control characters, collapse whitespace.
  const name = username.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (name.length === 0 || [...name].length > MAX_USERNAME_LENGTH) return null

  if (typeof time !== 'number' || !Number.isInteger(time)) return null
  if (time < 0 || time > MAX_TIME) return null

  return { username: name, time, naked: naked === true }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host === request.headers.get('host')
  } catch {
    return false
  }
}
