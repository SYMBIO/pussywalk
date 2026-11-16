import type { Metadata, Viewport } from 'next'
// Compiled stylesheet of the original production build (LESS sources in assets-src/styles).
import './legacy.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pussywalk.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Jeho voliči k urně dojdou. Co ty?',
  description:
    'Hra PussyWalk 2 je simulátor vrávorání. Vyzvedni Čtveráčka a dej se s panem Z. na cestu k urně.',
  openGraph: {
    title: 'Jeho voliči k urně dojdou. Co ty?',
    description:
      'PussyWalk je simulátor vrávorání, který je pro každého zdarma. Vyzvedni Čtveráčka a dej se s panem Z. na cestu k urně.',
    type: 'website',
    siteName: 'PussyWalk',
    url: '/',
    images: ['/images/layout/fb-share.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [57, 60, 72, 76, 114, 120, 144, 152, 180].map((size) => ({
      url: `/icons/apple-icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
    })),
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/icons/ms-icon-144x144.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // `touch` / `app` classes are toggled by the game script after hydration.
    <html lang="cs" className="no-touch no-app" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
