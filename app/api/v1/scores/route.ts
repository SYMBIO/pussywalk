import { getV1Names } from '@/lib/scores-v1'

// Served as https://1.pussywalk.com/scores.json (see rewrites in next.config.ts).
export async function GET() {
  return Response.json(await getV1Names())
}
