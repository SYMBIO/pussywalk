import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      // Share links posted to Facebook by the original site.
      { source: '/images/layout/share.php', destination: '/share' },
    ]
  },
}

export default nextConfig
