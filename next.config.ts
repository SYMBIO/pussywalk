import type { NextConfig } from 'next'
import { withBotId } from 'botid/next/config'

// PussyWalk I (Flash, 2014) is served from the same deployment under its own
// domain: requests to 1.pussywalk.com are rewritten into the static site in
// public/v1/ (+ two API routes that replace the old PHP scoreboard).
const V1_HOST = '1\\.pussywalk\\.com|1\\.localhost'
const v1 = (source: string, destination: string) => ({
  source,
  destination,
  has: [{ type: 'host' as const, value: V1_HOST }],
})

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return {
      beforeFiles: [
        v1('/', '/v1/index.html'),
        v1('/cs', '/v1/cs.html'),
        v1('/en', '/v1/en.html'),
        v1('/m/cs', '/v1/m-cs.html'),
        v1('/m/en', '/v1/m-en.html'),
        v1('/scores.json', '/api/v1/scores'),
        v1('/saveScore.php', '/api/v1/save'),
        v1('/:path((?!v1/|api/|_next/).+)', '/v1/:path'),
      ],
      afterFiles: [
        // Share links posted to Facebook by PussyWalk II.
        { source: '/images/layout/share.php', destination: '/share' },
      ],
      fallback: [],
    }
  },
}

export default withBotId(nextConfig)
