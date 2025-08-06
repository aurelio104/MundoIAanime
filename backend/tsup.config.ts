import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['main.ts'],
  format: ['esm'],         // ✅ ESM compatible
  outDir: 'dist',
  target: 'node20',
  clean: true,
  dts: true,               // ✅ Genera archivos .d.ts
  splitting: false,        // ✅ Importante si usas createBot/addKeyword como default
  shims: false,            // ✅ Evita agregar shims innecesarios (como __dirname)
  minify: false            // Puedes cambiar a true si quieres minimizar
})
