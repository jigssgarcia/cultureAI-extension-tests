import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for CultureAI Browser Extension Testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL for the mock server */
    baseURL: 'https://doesnotexist.culture.ai',
    
    /* Collect trace on first retry of each test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Maximum time each action can take */
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Extension testing requires specific context options
        launchOptions: {
          args: [
            '--disable-extensions-except=./extension',
            '--load-extension=./extension'
          ]
        }
      },
    },

    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            '--disable-extensions-except=./extension',
            '--load-extension=./extension'
          ]
        }
      },
    },

    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
        launchOptions: {
          args: [
            '--disable-extensions-except=./extension',
            '--load-extension=./extension'
          ]
        }
      },
    },
  ],

  /* Run local mock server before starting the tests */
  webServer: {
    command: 'node test-fixtures/mock-server.js',
    url: 'https://doesnotexist.culture.ai',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
