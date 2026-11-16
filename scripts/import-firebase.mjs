// Imports a Firebase Realtime DB export of `pussywalk-2/scoreboard` into Postgres.
// Usage: node --env-file=.env.local scripts/import-firebase.mjs <scoreboard.json>
// Idempotent: records are keyed by their Firebase push key (`legacy_key`).
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const file = process.argv[2]
if (!file) {
  console.error('Usage: import-firebase.mjs <scoreboard.json>')
  process.exit(1)
}

const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'

// Firebase push keys encode their creation time (ms) in the first 8 characters.
function pushKeyTime(key) {
  let ms = 0
  for (const ch of key.slice(0, 8)) {
    const v = PUSH_CHARS.indexOf(ch)
    if (v < 0) return null
    ms = ms * 64 + v
  }
  return new Date(ms)
}

const data = JSON.parse(await readFile(file, 'utf8'))
const rows = []
const skipped = []

for (const [key, value] of Object.entries(data)) {
  const time = Number(value?.time)
  const username = typeof value?.username === 'string' ? value.username : String(value?.username ?? '')
  if (!Number.isInteger(time) || time < 0 || time > 2_147_483_647) {
    skipped.push({ key, value })
    continue
  }
  rows.push({
    key,
    username,
    time,
    naked: value.naked === true,
    createdAt: pushKeyTime(key)?.toISOString() ?? null,
  })
}

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)
const BATCH = 2000
let inserted = 0

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const result = await sql.query(
    `INSERT INTO scores (legacy_key, username, time_ms, naked, created_at)
     SELECT k, u, t, n, coalesce(c, now())
     FROM unnest($1::text[], $2::text[], $3::int[], $4::bool[], $5::timestamptz[]) AS x(k, u, t, n, c)
     ON CONFLICT (legacy_key) DO NOTHING
     RETURNING id`,
    [
      batch.map((r) => r.key),
      batch.map((r) => r.username),
      batch.map((r) => r.time),
      batch.map((r) => r.naked),
      batch.map((r) => r.createdAt),
    ],
  )
  inserted += result.length
}

console.log(`Source records: ${Object.keys(data).length}`)
console.log(`Inserted: ${inserted}, already present: ${rows.length - inserted}, skipped (invalid): ${skipped.length}`)
if (skipped.length) console.log(JSON.stringify(skipped, null, 2))
