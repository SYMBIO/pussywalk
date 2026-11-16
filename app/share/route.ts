import type { NextRequest } from 'next/server'

// Facebook share landing page for a finished run (replaces images/layout/share.php).
// Crawlers read the Open Graph tags; people are sent straight to the game.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const name = (params.get('n') ?? '').slice(0, 40)
  const time = (params.get('t') ?? '').slice(0, 60)
  const nude = params.get('c') === '1'

  const origin = request.nextUrl.origin
  const title = `${name} zdolal/a PussyWalk II!`
  const description = `Do cíle dovrávoral/a v čase ${time} Vem pana Z. a Čtveráčka taky na procházku a přibliž je k urně. Překonáš můj čas?`
  const image = `${origin}/images/layout/fb-share-winner${nude ? '-nude' : ''}.png`
  const url = `${origin}/share?${new URLSearchParams({ n: name, t: time, c: nude ? '1' : '' })}`

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PussyWalk">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta http-equiv="refresh" content="0;url=/">
</head>
<body><a href="/">PussyWalk II</a></body>
</html>`

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
