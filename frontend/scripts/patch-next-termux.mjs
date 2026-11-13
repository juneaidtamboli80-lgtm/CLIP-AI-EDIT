/**
 * Termux / Android workaround for Next.js 14.
 *
 * Next.js does not publish a native `@next/swc-android-arm64` binary for
 * v14, but it does ship a supported WebAssembly fallback. The fallback is
 * only enabled when `loadBindings()` is called with `useWasmBinary`, and
 * some worker entry points call it without the flag. This patch flips the
 * default on Android so `next dev` / `next build` work in Termux.
 *
 * On every other platform this script is a no-op.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

if (process.platform !== 'android') {
  process.exit(0)
}

let swcPath
try {
  swcPath = require.resolve('next/dist/build/swc/index.js')
} catch {
  console.warn('[patch-next-termux] Next.js not installed yet — skipping.')
  process.exit(0)
}

const original = 'async function loadBindings(useWasmBinary = false) {'
const patched = "async function loadBindings(useWasmBinary = process.platform === 'android') {"

const source = readFileSync(swcPath, 'utf8')
if (source.includes(patched)) {
  process.exit(0)
}

if (!source.includes(original)) {
  console.warn(
    '[patch-next-termux] Could not find the loadBindings signature. ' +
      'Next.js may have changed; set experimental.useWasmBinary manually.',
  )
  process.exit(0)
}

writeFileSync(swcPath, source.replace(original, patched))
console.log('[patch-next-termux] Enabled the SWC WebAssembly fallback for Android.')
