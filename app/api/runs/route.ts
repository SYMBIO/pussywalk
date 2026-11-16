import { checkBotId } from 'botid/server'
import { createRunToken } from '@/lib/runs'

// POST /api/runs — called when a game run starts; returns a signed run token.
export async function POST() {
  const verification = await checkBotId()
  if (verification.isBot) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }
  return Response.json({ token: createRunToken() }, { headers: { 'cache-control': 'no-store' } })
}
