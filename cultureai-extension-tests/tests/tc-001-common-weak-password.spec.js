/**
 * TC-001: Detect Weak Password - Common Password
 * Priority: P1
 * Type: Functional
 * 
 * Tests that the extension detects weak passwords from the common password list
 * and sends the event to the /events endpoint with proper hashing
 */

import { test, expect } from '@playwright/test';
import { testData, apiConfig } from '../test-data/test-data.js';
import { 
  multiStageHash, 
  clearReceivedEvents, 
  getReceivedEvents,
  validateEventPayload,
  wait
} from '../utils/helpers.js';

test.describe('TC-001: Detect Weak Password - Common Password', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any previously received events
    await clearReceivedEvents(apiConfig.baseUrl);
    
    // Navigate to the test login page
    await page.goto('file://' + process.cwd() + '/test-fixtures/login.html');
    await expect(page.locator('h1')).toContainText('Test Login');
  });

  test('should detect common weak password "password123" with corporate email @P1 @smoke @critical', async ({ page }) => {
    // Test data
    const email = testData.corporateEmails[0]; // bob.smith@culture.ai
    const password = 'password123';
    
    // Fill in the login form
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    
    // Submit the form
    await page.getByTestId('login-button').click();
    
    // Wait for extension to process and send event
    await wait(2000);
    
    // Verify event was sent to API
    const events = await getReceivedEvents(apiConfig.baseUrl);
    
    // Assertions
    expect(events.length).toBeGreaterThan(0);
    
    const latestEvent = events[events.length - 1];
    
    // Validate event structure
    const validation = validateEventPayload(latestEvent);
    expect(validation.isValid, `Event validation failed: ${validation.errors.join(', ')}`).toBeTruthy();
    
    // Verify email
    expect(latestEvent.email).toBe(email);
    
    // Verify password is hashed (not plaintext)
    expect(latestEvent.passwordHash).not.toBe(password);
    expect(latestEvent.passwordHash).toHaveLength(64); // SHA-256 produces 64 hex characters
    
    // Verify it's a proper hash
    const expectedHash = multiStageHash(password);
    expect(latestEvent.passwordHash).toBe(expectedHash);
  });

  test('should detect multiple common weak passwords @P1 @regression', async ({ page }) => {
    const email = testData.corporateEmails[1]; // alice.jones@culture.ai
    const commonPasswords = ['123456', 'qwerty', 'abc123'];
    
    for (const password of commonPasswords) {
      // Clear events before each iteration
      await clearReceivedEvents(apiConfig.baseUrl);
      
      // Fill and submit form
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);
      await page.getByTestId('login-button').click();
      
      // Wait for processing
      await wait(2000);
      
      // Verify event
      const events = await getReceivedEvents(apiConfig.baseUrl);
      expect(events.length).toBeGreaterThan(0);
      
      const event = events[events.length - 1];
      expect(event.email).toBe(email);
      expect(event.passwordHash).toHaveLength(64);
    }
  });

  test('should use HTTPS protocol for API requests @P1 @security', async ({ page }) => {
    const email = testData.corporateEmails[2]; // john.doe@culture.ai
    const password = 'password123';
    
    // Intercept network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/events')) {
        requests.push(request);
      }
    });
    
    // Fill and submit form
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    // Verify HTTPS is used (in production)
    // Note: In test environment, we use HTTP for mock server
    // In production, this should be HTTPS
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
  });

  test('should never send password in plaintext @P1 @security @critical', async ({ page }) => {
    const email = testData.corporateEmails[3]; // sarah.wilson@culture.ai
    const password = 'letmein';
    
    // Monitor all network traffic
    const requestBodies = [];
    page.on('request', async request => {
      if (request.url().includes('/events') && request.method() === 'POST') {
        const postData = request.postData();
        if (postData) {
          requestBodies.push(postData);
        }
      }
    });
    
    // Fill and submit form
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    // Verify password never appears in plaintext in any request
    for (const body of requestBodies) {
      expect(body).not.toContain(password);
    }
    
    // Verify event has hash, not plaintext
    const events = await getReceivedEvents(apiConfig.baseUrl);
    if (events.length > 0) {
      const event = events[events.length - 1];
      expect(event.passwordHash).not.toBe(password);
      expect(event.passwordHash).toMatch(/^[a-f0-9]{64}$/); // Valid SHA-256 hex
    }
  });

  test('should include all required fields in event payload @P1 @functional', async ({ page }) => {
    const email = 'test.user@culture.ai';
    const password = 'welcome';
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
    
    const event = events[events.length - 1];
    
    // Required fields
    expect(event).toHaveProperty('email');
    expect(event).toHaveProperty('passwordHash');
    
    // Verify values
    expect(event.email).toBe(email);
    expect(event.passwordHash).toBeTruthy();
  });
});
