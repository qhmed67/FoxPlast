import base from './playwright.config'
import { defineConfig } from '@playwright/test'

// Same suite, but pointed at the full chromium build we can install without a
// system Playwright cache (the sandbox has no writable ~/.cache).
export default defineConfig({
  ...base,
  use: {
    ...base.use,
    launchOptions: {
      executablePath: '.pw-browsers/chromium-1248/chrome-linux64/chrome',
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      env: {
        ...process.env,
        HOME: `${process.cwd()}/.chrome-profile`,
        XDG_CACHE_HOME: `${process.cwd()}/.chrome-profile/cache`,
      },
    },
  },
})
