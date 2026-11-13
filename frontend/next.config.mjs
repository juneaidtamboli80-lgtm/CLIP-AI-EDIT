/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is only needed for the Docker image; keeping it off for
  // local builds means `next start` works without a copy step.
  ...(process.env.NEXT_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
    // Android/Termux has no published native SWC binary for Next 14.
    // Force the supported WASM fallback there; other platforms keep native SWC.
    ...(process.platform === 'android' ? { useWasmBinary: true } : {}),
  },
}

export default nextConfig
