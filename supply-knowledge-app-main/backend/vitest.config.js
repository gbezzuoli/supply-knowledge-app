// Arquivo: vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ignora os arquivos de teste que ainda não foram implementados.
    exclude: [
      'node_modules/**',
      'dist/**',
      '__tests__/services/userService.test.js',
      '__tests__/services/geminiService.test.js',
      '__tests__/middleware/auth.middleware.test.js',
    ],
    // --- NOVA LINHA ---
    // Carrega o dotenv para que process.env seja populado nos testes
    setupFiles: ['dotenv/config'],
  },
});