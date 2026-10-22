import { defineConfig } from 'vitest/config';
// base './' (rutas relativas): funciona en GitHub Pages bajo /<repo>/ sin importar el nombre del repositorio.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1600 },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
