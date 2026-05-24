import { defineConfig } from 'vite'

export default defineConfig({
  // Root is the project folder (index.html lives here)
  root: '.',
  // Production build output
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Inline assets smaller than 4kb
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Clean asset names for cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // Dev server
  server: {
    port: 3000,
    open: true,
  },
})
