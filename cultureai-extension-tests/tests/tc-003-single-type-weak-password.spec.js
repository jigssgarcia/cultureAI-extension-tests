/**
 * TC-003: Detect Weak Password - Single Character Type
 * Priority: P1
 * Type: Functional
 * 
 * Tests that the extension detects passwords containing only one character type
 * (only lowercase, only uppercase, only digits, or only special characters)
 */

import { test, expect } from '@playwright/test';
import { testData, apiConfig } from '../test-data/test-data.js';
import { 
  clearReceivedEvents, 
  getReceivedEvents,
  validateEventPayload,
  wait
} from '../utils/helpers.js';

test.describe('TC-003: Detect Weak Password - Single Character Type', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearReceivedEvents(apiConfig.baseUrl);
    await page.goto('file://' + process.cwd() + '/test-fixtures/login.html');
  });

  test('should detect password with only lowercase letters @P1 @smoke @critical', async ({ page }) => {
    const email = testData.corporateEmails[2]; // john.doe@culture.ai
    const password = testData.singleTypeWeakPasswords.lowercaseOnly; // "abcdefghijklmnop"
    
    // Verify password is lowercase only
    expect(password).toMatch(/^[a-z]+$/);
    expect(password).not.toMatch(/[A-Z]/);
    expect(password).not.toMatch(/\d/);
    expect(password).not.toMatch(/[!@#$%^&*]/);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
    
    const event = events[events.length - 1];
    const validation = validateEventPayload(event);
    expect(validation.isValid).toBeTruthy();
    expect(event.email).toBe(email);
  });

  test('should detect password with only uppercase letters @P1 @regression', async ({ page }) => {
    const email = 'john.doe@culture.ai';
    const password = testData.singleTypeWeakPasswords.uppercaseOnly; // "ABCDEFGHIJKLMNOP"
    
    // Verify password is uppercase only
    expect(password).toMatch(/^[A-Z]+$/);
    expect(password).not.toMatch(/[a-z]/);
    expect(password).not.toMatch(/\d/);
    expect(password).not.toMatch(/[!@#$%^&*]/);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
  });

  test('should detect password with only digits @P1 @regression', async ({ page }) => {
    const email = 'john.doe@culture.ai';
    const password = testData.singleTypeWeakPasswords.digitsOnly; // "12345678901234"
    
    // Verify password is digits only
    expect(password).toMatch(/^\d+$/);
    expect(password).not.toMatch(/[a-z]/);
    expect(password).not.toMatch(/[A-Z]/);
    expect(password).not.toMatch(/[!@#$%^&*]/);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
  });

  test('should detect password with only special characters @P1 @regression', async ({ page }) => {
    const email = 'john.doe@culture.ai';
    const password = testData.singleTypeWeakPasswords.specialOnly; // "!@#$%^&*()_+-="
    
    // Verify password is special chars only
    expect(password).toMatch(/^[!@#$%^&*()_+\-=]+$/);
    expect(password).not.toMatch(/[a-z]/);
    expect(password).not.toMatch(/[A-Z]/);
    expect(password).not.toMatch(/\d/);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThan(0);
  });

  test('should send four separate events for all single-type passwords @P1 @functional', async ({ page }) => {
    const email = 'john.doe@culture.ai';
    const singleTypePasswords = [
      testData.singleTypeWeakPasswords.lowercaseOnly,
      testData.singleTypeWeakPasswords.uppercaseOnly,
      testData.singleTypeWeakPasswords.digitsOnly,
      testData.singleTypeWeakPasswords.specialOnly
    ];
    
    await clearReceivedEvents(apiConfig.baseUrl);
    
    // Submit all four passwords
    for (const password of singleTypePasswords) {
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);
      await page.getByTestId('login-button').click();
      await wait(1500);
    }
    
    // Verify four separate events were sent
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length).toBeGreaterThanOrEqual(4);
    
    // Verify each event has correct email and is properly hashed
    for (const event of events) {
      expect(event.email).toBe(email);
      expect(event.passwordHash).toHaveLength(64);
    }
  });

  test('should correctly hash each single-type password @P1 @security', async ({ page }) => {
    const email = 'test.user@culture.ai';
    const passwords = Object.values(testData.singleTypeWeakPasswords);
    
    for (const password of passwords) {
      await clearReceivedEvents(apiConfig.baseUrl);
      
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);
      await page.getByTestId('login-button').click();
      
      await wait(2000);
      
      const events = await getReceivedEvents(apiConfig.baseUrl);
      expect(events.length).toBeGreaterThan(0);
      
      const event = events[events.length - 1];
      
      // Verify proper hashing
      expect(event.passwordHash).not.toBe(password);
      expect(event.passwordHash).toHaveLength(64);
      expect(event.passwordHash).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test('should detect long passwords with single character type @P1 @boundary', async ({ page }) => {
    const email = 'bob.smith@culture.ai';
    
    // Even long passwords should be detected if they have only one char type
    const longLowercaseOnly = 'abcdefghijklmnopqrstuvwxyz'; // 26 chars, lowercase only
    
    expect(longLowercaseOnly.length).toBeGreaterThan(12);
    expect(longLowercaseOnly).toMatch(/^[a-z]+$/);
    
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(longLowercaseOnly);
    await page.getByTestId('login-button').click();
    
    await wait(2000);
    
    const events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Long password with single char type should still be detected').toBeGreaterThan(0);
  });

  test('should not confuse single-type detection with mixed-type passwords @P1 @functional', async ({ page }) => {
    const email = 'alice.jones@culture.ai';
    
    // First test single-type (should be detected)
    const singleType = 'abcdefghijklmnop';
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(singleType);
    await page.getByTestId('login-button').click();
    await wait(2000);
    
    let events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Single-type password should be detected').toBeGreaterThan(0);
    
    // Clear and test mixed-type (should NOT be detected if >12 chars)
    await clearReceivedEvents(apiConfig.baseUrl);
    
    const mixedType = 'Abcd123!@#DefGhi'; // >12 chars, multiple types
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(mixedType);
    await page.getByTestId('login-button').click();
    await wait(2000);
    
    events = await getReceivedEvents(apiConfig.baseUrl);
    expect(events.length, 'Mixed-type strong password should NOT be detected').toBe(0);
  });
});
