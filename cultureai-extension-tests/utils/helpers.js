/**
 * Utility functions for CultureAI Browser Extension Tests
 */

import crypto from 'crypto';

/**
 * Hash a password using SHA-256 (simulating the extension's hashing logic)
 * @param {string} password - The password to hash
 * @returns {string} - The hashed password in hexadecimal format
 */
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Multi-stage hashing as per extension logic:
 * 1. SHA-256 hash
 * 2. Take first half
 * 3. Hash again
 * 4. Hash again
 * @param {string} password - The password to hash
 * @returns {string} - The final hashed password
 */
export function multiStageHash(password) {
  // Stage 1: SHA-256 hash
  let hash = crypto.createHash('sha256').update(password).digest('hex');
  
  // Stage 2: Take first half (32 characters of the 64-char hex)
  hash = hash.substring(0, 32);
  
  // Stage 3: Hash again
  hash = crypto.createHash('sha256').update(hash).digest('hex');
  
  // Stage 4: Hash again
  hash = crypto.createHash('sha256').update(hash).digest('hex');
  
  return hash;
}

/**
 * Validate if an email is a corporate email
 * @param {string} email - Email to validate
 * @returns {boolean} - True if corporate email, false otherwise
 */
export function isCorporateEmail(email) {
  return email.endsWith('@culture.ai');
}

/**
 * Check if a password is weak based on the criteria
 * @param {string} password - Password to check
 * @param {string[]} commonPasswords - List of common passwords
 * @returns {object} - Object with isWeak flag and reasons
 */
export function isWeakPassword(password, commonPasswords = []) {
  const reasons = [];
  
  // Check if in common password list
  if (commonPasswords.includes(password.toLowerCase())) {
    reasons.push('common_password');
  }
  
  // Check length (≤12 characters)
  if (password.length <= 12) {
    reasons.push('short_length');
  }
  
  // Check character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const typeCount = [hasLowercase, hasUppercase, hasDigit, hasSpecial].filter(Boolean).length;
  
  if (typeCount <= 1) {
    reasons.push('single_character_type');
  }
  
  return {
    isWeak: reasons.length > 0,
    reasons
  };
}

/**
 * Generate a unique session ID
 * @returns {string} - UUID v4 format session ID
 */
export function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Wait for a specific amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after the wait time
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch events from the mock API
 * @param {string} baseUrl - Base URL of the API
 * @returns {Promise<Array>} - Array of received events
 */
export async function getReceivedEvents(baseUrl = 'https://doesnotexist.culture.ai') {
  const response = await fetch(`${baseUrl}/events`);
  const data = await response.json();
  return data.events || [];
}

/**
 * Clear all events from the mock API
 * @param {string} baseUrl - Base URL of the API
 * @returns {Promise<boolean>} - True if successful
 */
export async function clearReceivedEvents(baseUrl = 'https://doesnotexist.culture.ai') {
  const response = await fetch(`${baseUrl}/events`, { method: 'DELETE' });
  const data = await response.json();
  return data.success;
}

/**
 * Check if API is healthy
 * @param {string} baseUrl - Base URL of the API
 * @returns {Promise<boolean>} - True if healthy
 */
export async function isApiHealthy(baseUrl = 'https://doesnotexist.culture.ai') {
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}

/**
 * Format test data for better readability in reports
 * @param {object} data - Data to format
 * @returns {string} - Formatted string
 */
export function formatTestData(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Validate event payload structure
 * @param {object} event - Event payload to validate
 * @returns {object} - Validation result with isValid flag and errors
 */
export function validateEventPayload(event) {
  const errors = [];
  
  if (!event.email) {
    errors.push('Missing required field: email');
  }
  
  if (!event.passwordHash) {
    errors.push('Missing required field: passwordHash');
  }
  
  if (event.email && !isCorporateEmail(event.email)) {
    errors.push('Email is not a corporate email');
  }
  
  if (event.passwordHash && event.passwordHash.length !== 64) {
    errors.push('Password hash is not in SHA-256 format (64 hex characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
