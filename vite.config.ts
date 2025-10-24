import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Fix: Use `fileURLToPath` and `URL` from Node's `url` module to handle path resolution in an ES module context.
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix: `__dirname` is not available in ES modules. `import.meta.url` provides the modern, standard way to reference the current file's path.
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    // Securely expose only the API_KEY to the client-side code, not the entire process.env object.
    // Vite performs a static replacement, so we stringify the value.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
