// Imports PussyWalk I winners from the old server's web/scores.json
// (array of {name}, newest first). Usage:
//   node --env-file=.env.local scripts/import-v1-scores.mjs <scores.json>
// Refuses to run if legacy rows are already present.
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const file = process.argv[2]
if (!file) {
  console.error('Usage: import-v1-scores.mjs <scores.json>')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)
const [{ n }] = await sql`SELECT count(*)::int AS n FROM scores_v1 WHERE legacy`
if (n > 0) {
  console.error(`scores_v1 already has ${n} legacy rows, aborting.`)
  process.exit(1)
}

const data = JSON.parse(await readFile(file, 'utf8'))
// Oldest first, so identity ids grow with time and ORDER BY id DESC = newest first.
const names = data.map((row) => String(row.name ?? '')).reverse()
const legacyDate = '2017-01-09T00:00:00Z' // mtime of the last scores.json on the server

const BATCH = 2000
for (let i = 0; i < names.length; i += BATCH) {
  await sql.query(
    `INSERT INTO scores_v1 (name, created_at, legacy)
     SELECT name, $2::timestamptz, true FROM unnest($1::text[]) WITH ORDINALITY AS x(name, ord) ORDER BY ord`,
    [names.slice(i, i + BATCH), legacyDate],
  )
}
console.log(`Imported ${names.length} names.`)
