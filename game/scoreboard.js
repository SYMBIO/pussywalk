// Client for the scoreboard API (replaces the original Firebase Realtime DB calls).

// Times below this threshold were never shown on the original Firebase
// scoreboard (`orderByChild('time').startAt(40000)`).
export const MIN_SCORE_TIME = 40000

export async function fetchScoreboard(limit) {
  const res = await fetch('/api/scores?limit=' + encodeURIComponent(limit), {
    headers: { accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error('Scoreboard request failed: ' + res.status)
  }
  const data = await res.json()
  return data.entries
}

// Returns { id, entries } where `entries` is the top 2000 including the new score.
export async function submitScore({ username, time, naked }) {
  const res = await fetch('/api/scores', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ username, time, naked }),
  })
  if (!res.ok) {
    throw new Error('Score submit failed: ' + res.status)
  }
  return res.json()
}
