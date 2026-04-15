import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Separate config for Vitest so we don't pull in the tailwindcss vite plugin,
// which isn't needed in jsdom tests and slows startup.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['node_modules', 'e2e'],
  },
});
