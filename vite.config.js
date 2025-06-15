import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // This fixes the path issue
  build: {
    outDir: 'docs' // Build to docs folder
  }
})