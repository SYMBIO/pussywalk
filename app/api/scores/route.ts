import { checkBotId } from 'botid/server'
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { hashIp, verifyRunToken } from '@/lib/runs'
import {
  MAX_LIMIT,
  SCORES_TAG,
  getTopScores,
  getTopScoresFresh,
  insertScore,
} from '@/lib/scores'

const MAX_USERNAME_LENGTH = 20 // matches the `maxlength` of the name input
const MAX_TIME = 2_147_483_647
// Allowance for the latency between the game starting and the run token being issued.
const CLOCK_TOLERANCE_MS = 5_000

// GET /api/scores?limit=100|2000 — leaderboard, fastest first.
export async function GET(request: NextRequest) {
  // Only two page sizes are used by the game; keep the cache keyspace small.
  const requested = Number(request.nextUrl.searchParams.get('limit'))
  const limit = requested > 100 ? MAX_LIMIT : 100

  const entries = await getTopScores(limit)
  return Response.json({ entries })
}

// POST /api/scores { username, time, naked, runToken } — records a finished run.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const verification = await checkBotId()
  if (verification.isBot) {
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

  // The play time cannot exceed the real time since the server saw the run start.
  const run = verifyRunToken((body as Record<string, unknown>).runToken)
  if (!run) {
    return Response.json({ error: 'invalid run' }, { status: 400 })
  }
  if (score.time > run.elapsed + CLOCK_TOLERANCE_MS) {
    return Response.json({ error: 'implausible time' }, { status: 422 })
  }

  const ip = clientIp(request)
  const result = await insertScore({
    ...score,
    runId: run.runId,
    ipHash: ip ? hashIp(ip) : null,
  })
  if (!result.ok) {
    const status = result.reason === 'rate_limited' ? 429 : 409
    return Response.json({ error: result.reason }, { status })
  }

  const id = result.id
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

function clientIp(request: NextRequest) {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null
  )
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
