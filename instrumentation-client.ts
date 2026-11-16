import { initBotId } from 'botid/client/core'

// Invisible bot protection for the scoreboard write endpoints.
initBotId({
  protect: [
    { path: '/api/runs', method: 'POST' },
    { path: '/api/scores', method: 'POST' },
  ],
})
