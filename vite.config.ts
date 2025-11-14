import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

function resolveProxyTarget(apiBaseUrl: string): string {
  try {
    const url = new URL(apiBaseUrl)
    return `${url.protocol}//${url.host}`
  } catch {
    // If it's not a valid absolute URL (e.g., '/api'), default to prod host
    return 'https://www.apislms.dgtoohl.com'
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'https://www.apislms.dgtoohl.com/api/v1'

  return {
    plugins: [react(), tailwind()],
    server: {
      proxy: {
        '/api': {
          target: resolveProxyTarget(apiBaseUrl),
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
      },
    },
  }
})
