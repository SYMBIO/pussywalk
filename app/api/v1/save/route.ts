import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { hashIp } from '@/lib/runs'
import { SCORES_V1_TAG, insertV1Name } from '@/lib/scores-v1'

const MAX_NAME_LENGTH = 40

// Served as https://1.pussywalk.com/saveScore.php (see rewrites in next.config.ts).
// The Flash game POSTs `name` (form-urlencoded) and ignores the response body,
// so this always answers 200 with an empty body, like the original PHP script.
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const sameOrigin = origin != null && safeHost(origin) === request.headers.get('host')

  let raw: FormDataEntryValue | null = null
  try {
    raw = (await request.formData()).get('name')
  } catch {
    raw = null
  }

  const name =
    typeof raw === 'string' ? raw.replace(/[\u0000-\u001f\u007f]/g, '').trim() : ''

  // Same rule as the original saveScore.php: non-empty and containing a letter.
  const valid = name.length > 0 && [...name].length <= MAX_NAME_LENGTH && /[a-zA-Z]/.test(name)

  if (sameOrigin && valid) {
    const ip =
      request.headers.get('x-real-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      null
    const saved = await insertV1Name(name, ip ? hashIp(ip) : null)
    if (saved) revalidateTag(SCORES_V1_TAG, { expire: 0 })
  }

  return new Response(null, { status: 200 })
}

function safeHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}
