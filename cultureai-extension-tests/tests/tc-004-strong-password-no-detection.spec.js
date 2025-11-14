/**
 * TC-004: Strong Password - No Detection
 * Priority: P1
 * Type: Functional
 * 
 * Tests that the extension does NOT detect strong passwords as weak
 * and does NOT send events for strong passwords
 */

import { test, expect } from '@playwright/test';
import { testData, apiConfig } from '../test-data/test-data.js';
import { 
  clearReceivedEvents, 
  getReceivedEvents,
  wait
} from '../utils/helpers.js';

test.describe('TC-004: Strong Password - No Detection', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearReceivedEvents(apiConfig.baseUrl);
    await page.goto('file://' + process.cwd() + '/test-fixtures/login.html');
  });

  test('should NOT detect strong password "MyStr0ng!P@ssw0rd2024" @P1 @smoke @critical', async ({ page }) => {
    const email = testData.corporateEmails[3]; // sarah.wilson@culture.ai
    const password = 'MyStr0ng!P@ssw0rd2024'; // Strong: >12 chars, mixed types
    
    // Verify password is strong
    expect(password.length).toBeGreaterThan(12);
    expect(password).toMatch(/[a-z]/); // Has lowercase
    expect(password).toMatch(/[A-Z]/); // Has uppercase
    expect(password).toMatch(/\d/);    // Has digit
    expect(password).toMatch(/[!@#$%^&*]/); // Has special char
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    // Verify NO event was sent
    const events = await getReceivedEvents(apiConfig.baseUrl);
    
    // Should have zero events for strong password
    expect(events.length).toBe(0);
  });

  test('should NOT detect multiple strong passwords @P1 @regression', async ({ page }) => {
    const email = 'bob.smith@culture.ai';
    const strongPasswords = testData.strongPasswords;
    // ["MyStr0ng!P@ssw0rd2024", "C0mplex&Secure#Pass", "Unbreakable$123Password"]
    
    for (const password of strongPasswords) {
      await clearReceivedEvents(apiConfig.baseUrl);
      
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);
      await page.getByTestId('login-button').click();
      
      await wait(2000);
      
      const events = await getReceivedEvents(apiConfig.baseUrl);
      
      expect(events.length, `Strong password "${password}" should NOT trigger detection`).toBe(0);
    }
  });

  test('should allow normal login without interference for strong passwords @P1 @functional', async ({ page }) => {
    const email = 'alice.jones@culture.ai';
    const password = 'C0mplex&Secure#Pass';
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    // Wait for success message
    await wait(1000);
    
    // Verify success message appears
    const message = page.locator('.message.success');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Login successful!');
    
    // Verify no API call was made
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBe(0);
  });

  test('should verify API endpoint receives no request for strong passwords @P1 @functional', async ({ page }) => {
    const email = 'john.doe@culture.ai';
    const password = 'Unbreakable$123Password';
    
    // Track API requests
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
    
    // Verify no POST request to /events
    expect(apiRequests.length, 'Should not send any API request for strong password').toBe(0);
    
    // Double-check with API
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBe(0);
  });

  test('should handle password with all character types correctly @P1 @boundary', async ({ page }) => {
    const email = 'test.user@culture.ai';
    // Strong password with all 4 character types and >12 characters
    const password = 'Abc123!@#DefGhi456$%^';
    
    expect(password.length).toBeGreaterThan(12);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/\d/);
    expect(password).toMatch(/[!@#$%^&*]/);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBe(0);
  });

  test('should not trigger false positives on strong passwords @P1 @critical', async ({ page }) => {
    const email = 'sarah.wilson@culture.ai';
    const strongPasswords = [
      'MyStr0ng!P@ssw0rd2024',
      'V3ry$ecure#P@ssw0rd!',
      'Str0ng&C0mplex#2024',
      'P@ssw0rd!With#Numb3rs'
    ];
    
    for (const password of strongPasswords) {
      await clearReceivedEvents(apiConfig.baseUrl);
      
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);
      await page.getByTestId('login-button').click();
      
      await wait(1500);
      
      const events = await getReceivedEvents(apiConfig.baseUrl);
      
      expect(
        events.length, 
        `Strong password "${password}" incorrectly detected as weak (false positive)`
      ).toBe(0);
    }
  });

  test('should distinguish between weak and strong passwords correctly @P1 @functional', async ({ page }) => {
    const email = 'bob.smith@culture.ai';
    
    // Test weak password first
    const weakPassword = 'password123';
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(weakPassword);
    await page.getByTestId('login-button').click();
    await wait(2000);
    
    let events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Weak password should be detected').toBeGreaterThan(0);
    
    // Clear and test strong password
    await clearReceivedEvents(apiConfig.baseUrl);
    
    const strongPassword = 'MyStr0ng!P@ssw0rd2024';
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(strongPassword);
    await page.getByTestId('login-button').click();
    await wait(2000);
    
    events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Strong password should NOT be detected').toBe(0);
  });
});
