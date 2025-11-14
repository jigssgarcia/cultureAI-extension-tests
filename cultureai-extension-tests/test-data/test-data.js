/**
 * Test Data for CultureAI Browser Extension Tests
 * Contains various password patterns and email addresses for testing
 */

export const testData = {
  // Corporate emails (should be monitored)
  corporateEmails: [
    'bob.smith@culture.ai',
    'alice.jones@culture.ai',
    'john.doe@culture.ai',
    'sarah.wilson@culture.ai',
    'test.user@culture.ai',
    'user123@culture.ai',
    'test.user+tag@culture.ai'
  ],

  // Non-corporate emails (should NOT be monitored)
  nonCorporateEmails: [
    'user@gmail.com',
    'test@yahoo.com',
    'person@hotmail.com',
    'someone@outlook.com',
    'user@notculture.ai',
    'test@example.com'
  ],

  // Weak passwords - Common passwords
  commonWeakPasswords: [
    'password',
    'password123',
    '123456',
    'qwerty',
    'letmein',
    'welcome',
    'abc123',
    'admin',
    'user',
    'test123'
  ],

  // Weak passwords - Length-based (≤12 characters)
  shortWeakPasswords: [
    'A1!',
    'Pass1!',
    'Secret12',
    'Abcd123!',
    'Short1!',
    'Weak12'
  ],

  // Weak passwords - Single character type only
  singleTypeWeakPasswords: {
    lowercaseOnly: 'abcdefghijklmnop',
    uppercaseOnly: 'ABCDEFGHIJKLMNOP',
    digitsOnly: '12345678901234',
    specialOnly: '!@#$%^&*()_+-='
  },

  // Weak passwords - Combination (multiple criteria)
  combinationWeakPasswords: [
    'pass',        // common + short + single type
    '123456',      // common + short + single type
    'Password1'    // ≤12 chars, missing special character
  ],

  // Strong passwords (should NOT be detected as weak)
  strongPasswords: [
    'MyStr0ng!P@ssw0rd2024',
    'C0mplex&Secure#Pass',
    'Unbreakable$123Password',
    'V3ry$ecure#P@ssw0rd!',
    'Str0ng&C0mplex#2024'
  ],

  // Boundary test cases
  boundaryPasswords: {
    exactly12CharsAllTypes: 'A1b!C2d@E3f#',    // Exactly 12 chars with all types
    exactly13CharsSingleType: 'abcdefghijklm',  // Exactly 13 chars, single type
    emptyPassword: '',
    veryLongPassword: 'ThisIsAVeryLongPasswordWithMoreThan100CharactersToTestTheBoundaryConditionsOfThePasswordValidationLogicInTheExtension',
  },

  // SSO test data
  sso: {
    google: {
      email: 'bob.smith@culture.ai',
      provider: 'Google'
    },
    microsoft: {
      email: 'alice@culture.ai',
      provider: 'Microsoft'
    }
  }
};

/**
 * Expected complexity scores for different password types
 */
export const expectedComplexityScores = {
  weak: ['weak', 'low'],
  medium: ['medium', 'moderate'],
  strong: ['strong', 'high']
};

/**
 * API endpoint configuration
 */
export const apiConfig = {
  baseUrl: 'https://doesnotexist.culture.ai',
  eventsEndpoint: '/events',
  healthEndpoint: '/health'
};

/**
 * Test timeouts and delays
 */
export const testConfig = {
  shortDelay: 500,
  mediumDelay: 1000,
  longDelay: 2000,
  apiTimeout: 5000
};
