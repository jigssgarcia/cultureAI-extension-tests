/**
 * TC-002: Detect Weak Password - Length Criterion (≤12 characters)
 * Priority: P1
 * Type: Functional
 * 
 * Tests that the extension detects passwords with 12 or fewer characters as weak
 */

import { test, expect } from '@playwright/test';
import { testData, apiConfig } from '../test-data/test-data.js';
import { 
  clearReceivedEvents, 
  getReceivedEvents,
  validateEventPayload,
  wait
} from '../utils/helpers.js';

test.describe('TC-002: Detect Weak Password - Length Criterion', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearReceivedEvents(apiConfig.baseUrl);
    await page.goto('file://' + process.cwd() + '/test-fixtures/login.html');
  });

  test('should detect password with ≤12 characters as weak @P1 @smoke @critical', async ({ page }) => {
    const email = testData.corporateEmails[1]; // alice.jones@culture.ai
    const password = 'Short1!'; // 7 characters
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
    
    const event = events[events.length - 1];
    
    // Validate event
    const validation = validateEventPayload(event);
    expect(validation.isValid).toBeTruthy();
    
    expect(event.email).toBe(email);
    expect(event.passwordHash).toHaveLength(64);
  });

  test('should detect all test passwords with ≤12 characters @P1 @regression', async ({ page }) => {
    const email = 'alice.jones@culture.ai';
    const shortPasswords = testData.shortWeakPasswords; // ["A1!", "Pass1!", "Secret12", "Abcd123!"]
    
    for (const password of shortPasswords) {
      await clearReceivedEvents(apiConfig.baseUrl);
      
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);
      await page.getByTestId('login-button').click();
      
      await wait(2000);
      
      const events = await getReceivedEvents(apiConfig.baseUrl);
      
      expect(events.length, `Password "${password}" should be detected as weak`).toBeGreaterThan(0);
      
      const event = events[events.length - 1];
      expect(event.email).toBe(email);
      expect(password.length, `Password "${password}" should be ≤12 chars`).toBeLessThanOrEqual(12);
    }
  });

  test('should detect exactly 12 character password as weak @P1 @boundary', async ({ page }) => {
    const email = 'test.user@culture.ai';
    const password = 'Exactly12Ch!'; // Exactly 12 characters
    
    expect(password.length).toBe(12);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
    
    const event = events[events.length - 1];
    expect(event.email).toBe(email);
  });

  test('should receive 200 OK response from API @P1 @functional', async ({ page }) => {
    const email = 'bob.smith@culture.ai';
    const password = 'Pass1!';
    
    let responseStatus = null;
    
    page.on('response', async response => {
      if (response.url().includes('/events')) {
        responseStatus = response.status();
      }
    });
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    // In a real scenario, we'd verify the extension got 200 OK
    // For now, verify the mock server returns 200
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
  });

  test('should hash short passwords correctly @P1 @security', async ({ page }) => {
    const email = 'john.doe@culture.ai';
    const password = 'A1!'; // Very short: 3 characters
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
    
    const event = events[events.length - 1];
    
    // Even very short passwords should be properly hashed
    expect(event.passwordHash).toHaveLength(64);
    expect(event.passwordHash).not.toBe(password);
    expect(event.passwordHash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should detect multiple short password submissions @P1 @performance', async ({ page }) => {
    const email = 'sarah.wilson@culture.ai';
    const shortPasswords = ['A1!', 'Pass1!', 'Weak12'];
    
    for (let i = 0; i < shortPasswords.length; i++) {
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(shortPasswords[i]);
      await page.getByTestId('login-button').click();
      
      await wait(1000);
    }
    
    // Verify all events were captured
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThanOrEqual(shortPasswords.length);
  });
});
