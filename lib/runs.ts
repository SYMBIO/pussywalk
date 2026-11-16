import 'server-only'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

// A run token proves when a game run started (server time). A submitted
// play time can never be longer than the real time elapsed since then, so a
// fake record requires actually waiting that long — and each token is single use.

const MAX_RUN_AGE_MS = 24 * 60 * 60 * 1000

function secret() {
  const value = process.env.SCORE_SECRET
  if (!value) throw new Error('SCORE_SECRET is not set')
  return value
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createRunToken(now = Date.now()) {
  const payload = `${randomUUID()}.${now}`
  return `${payload}.${sign(payload)}`
}

export function verifyRunToken(token: unknown, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 200) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [runId, startedAtRaw, signature] = parts
  const expected = Buffer.from(sign(`${runId}.${startedAtRaw}`))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

  const startedAt = Number(startedAtRaw)
  if (!Number.isSafeInteger(startedAt)) return null
  const elapsed = now - startedAt
  if (elapsed < 0 || elapsed > MAX_RUN_AGE_MS) return null

  return { runId, startedAt, elapsed }
}

/** Keyed hash of the client IP — used for rate limiting, the raw IP is never stored. */
export function hashIp(ip: string) {
  return createHmac('sha256', secret()).update(`ip:${ip}`).digest('base64url').slice(0, 32)
}
