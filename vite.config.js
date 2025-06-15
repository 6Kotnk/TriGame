import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    // Enable compression and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['three'], // Replace with your actual large libraries
        }
      }
    },
    // Compress assets
    assetsInlineLimit: 4096, // Inline small assets as base64
    chunkSizeWarningLimit: 1000
  },
  // Enable asset optimization
  assetsInclude: ['**/*.gltf', '**/*.glb'] // Include 3D model formats if using
})