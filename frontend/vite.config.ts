/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

// https://vite.dev/config/
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Allow external connections (works for both Docker and local network access)
    port: 5173,
    // Use polling by default - works well in Docker and doesn't hurt performance significantly in local dev
    // Can be disabled by setting VITE_NO_POLLING=true for local development if needed
    watch: {
      usePolling: true, // Enable polling for file changes (Docker-compatible, works locally too)
      interval: 1000, // Poll every second (reasonable balance)
    },
    hmr: {
      port: 5173, // Ensure HMR uses the same port
    },
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: '.storybook'
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});