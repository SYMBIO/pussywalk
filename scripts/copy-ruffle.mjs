// Copies the self-hosted Ruffle Flash emulator into public/v1/ruffle/
// (served as https://1.pussywalk.com/ruffle/). Runs before dev and build.
import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const src = path.dirname(require.resolve('@ruffle-rs/ruffle/package.json'))
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'v1', 'ruffle')

await rm(dest, { recursive: true, force: true })
await mkdir(dest, { recursive: true })
const files = (await readdir(src)).filter((f) => /\.(js|wasm)$/.test(f) || f.startsWith('LICENSE'))
for (const file of files) {
  await cp(path.join(src, file), path.join(dest, file))
}
console.log(`Ruffle: copied ${files.length} files to public/v1/ruffle`)
