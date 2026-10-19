/**
 * Konfigurasi Playwright khusus project contoh VocaGame.
 *
 * Jalankan dari root repo:
 *   npx playwright test -c vocagame/playwright.config.ts
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // alur OTP & order sebaiknya berurutan
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.VOCA_BASE_URL ?? 'https://vocagame.com',
    locale: 'id-ID',
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
