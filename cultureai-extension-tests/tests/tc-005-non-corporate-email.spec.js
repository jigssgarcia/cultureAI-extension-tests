/**
 * TC-005: Non-Corporate Email - No Detection
 * Priority: P1
 * Type: Functional
 * 
 * Tests that the extension does NOT monitor or detect passwords 
 * when used with non-corporate email addresses (privacy compliance)
 */

import { test, expect } from '@playwright/test';
import { testData, apiConfig } from '../test-data/test-data.js';
import { 
  clearReceivedEvents, 
  getReceivedEvents,
  isCorporateEmail,
  wait
} from '../utils/helpers.js';

test.describe('TC-005: Non-Corporate Email - No Detection', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearReceivedEvents(apiConfig.baseUrl);
    await page.goto('file://' + process.cwd() + '/test-fixtures/login.html');
  });

  test('should NOT detect weak password with non-corporate email @P1 @smoke @critical', async ({ page }) => {
    const email = 'user@gmail.com'; // Non-corporate email
    const password = 'password123';  // Weak password
    
    // Verify email is not corporate
    expect(isCorporateEmail(email)).toBe(false);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    // Verify NO event was sent (respecting privacy)
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Should not monitor non-corporate emails').toBe(0);
  });

  test('should NOT monitor multiple non-corporate email providers @P1 @regression', async ({ page }) => {
    const nonCorporateEmails = testData.nonCorporateEmails;
    // ["user@gmail.com", "test@yahoo.com", "person@hotmail.com", "someone@outlook.com"]
    const weakPassword = 'password123';
    
    for (const email of nonCorporateEmails) {
      await clearReceivedEvents(apiConfig.baseUrl);
      
      // Verify it's not a corporate email
      expect(isCorporateEmail(email)).toBe(false);
      
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(weakPassword);
      await page.getByTestId('login-button').click();
      
      await wait(2000);
      
      const events = await getReceivedEvents(apiConfig.baseUrl);
      
      expect(
        events.length, 
        `Should not monitor ${email} - personal email usage must not be tracked`
      ).toBe(0);
    }
  });

  test('should respect privacy by not sending any data for personal emails @P1 @privacy @critical', async ({ page }) => {
    const email = 'test@yahoo.com';
    const password = '123456'; // Very weak password
    
    // Track all network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/events') && request.method() === 'POST') {
        apiRequests.push(request);
      }
    });
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    // Verify no API requests were made
    expect(apiRequests.length, 'Should not make any API calls for personal emails').toBe(0);
    
    // Double-check with API
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBe(0);
  });

  test('should NOT send events for emails from similar but non-corporate domains @P1 @functional', async ({ page }) => {
    const email = 'someone@notculture.ai'; // Similar domain but not corporate
    const password = 'qwerty';
    
    expect(isCorporateEmail(email)).toBe(false);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBe(0);
  });

  test('should allow login without interference for personal emails @P1 @functional', async ({ page }) => {
    const email = 'person@hotmail.com';
    const password = 'password123';
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(1000);
    
    // Verify login succeeds without extension interference
    const message = page.locator('.message.success');
    await expect(message).toBeVisible();
    
    // Verify no monitoring occurred
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBe(0);
  });

  test('should contrast behavior between corporate and non-corporate emails @P1 @critical', async ({ page }) => {
    const weakPassword = 'password123';
    
    // Test non-corporate email first
    const nonCorpEmail = 'user@gmail.com';
    await page.getByTestId('email-input').fill(nonCorpEmail);
    await page.getByTestId('password-input').fill(weakPassword);
    await page.getByTestId('login-button').click();
    await wait(2000);
    
    let events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Non-corporate email should not be monitored').toBe(0);
    
    // Now test corporate email
    await clearReceivedEvents(apiConfig.baseUrl);
    
    const corpEmail = 'bob.smith@culture.ai';
    await page.getByTestId('email-input').fill(corpEmail);
    await page.getByTestId('password-input').fill(weakPassword);
    await page.getByTestId('login-button').click();
    await wait(2000);
    
    events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Corporate email should be monitored').toBeGreaterThan(0);
  });

  test('should not monitor even extremely weak passwords with personal emails @P1 @privacy', async ({ page }) => {
    const personalEmails = ['user@gmail.com', 'test@outlook.com'];
    const extremelyWeakPasswords = ['123456', 'password', 'abc123'];
    
    for (const email of personalEmails) {
      for (const password of extremelyWeakPasswords) {
        await clearReceivedEvents(apiConfig.baseUrl);
        
        await page.getByTestId('email-input').fill(email);
        await page.getByTestId('password-input').fill(password);
        await page.getByTestId('login-button').click();
        
        await wait(1500);
        
        const events = await getReceivedEvents(apiConfig.baseUrl);
        
        expect(
          events.length,
          `Should not monitor ${email} with password "${password}" - privacy must be respected`
        ).toBe(0);
      }
    }
  });
});
