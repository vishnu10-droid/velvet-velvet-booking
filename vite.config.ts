// @lovable.dev/vite-tanstack-config already includes the following - do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional Vite config using defineConfig({ vite: { ... } }).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    build: {
      // Large bundle warnings were informational on Vercel; raise threshold to avoid false alarm.
      chunkSizeWarningLimit: 1200,
    },
  },
});

