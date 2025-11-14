# CultureAI Browser Extension - Automated Test Suite

Comprehensive Playwright test automation suite for the CultureAI Browser Extension that detects weak passwords used with corporate email addresses.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Scenarios](#test-scenarios)
- [CI/CD Integration](#cicd-integration)
- [Assumptions & Limitations](#assumptions--limitations)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This test suite validates the CultureAI Browser Extension's ability to:
- Detect weak passwords (common passwords, ≤12 characters, single character type)
- Monitor only corporate email addresses (@culture.ai)
- Securely hash passwords before transmission
- Send events to the /events API endpoint
- Respect user privacy by not monitoring personal email addresses

## Features

- **Comprehensive Test Coverage**: automated test cases covering critical functionality
- **Security-First Approach**: Validates password hashing and secure transmission
- **Privacy Compliance**: Ensures non-corporate emails are not monitored
- **Cross-Browser Support**: Chrome, Edge, and Chromium
- **Mock API Server**: Simulates the /events endpoint for testing
- **Detailed Reporting**: HTML, JSON, and JUnit reports
- **CI/CD Ready**: Configured for GitHub Actions and other CI platforms
- **Tag-Based Execution**: Run specific test categories (@smoke, @P1, @security, etc.)

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Operating System**: Windows 11, macOS Sonoma, or Ubuntu 22.04
- **Browsers**: Chrome 120+, Edge 120+ (will be installed by Playwright)

## Installation

### 1. Clone or Extract the Repository

```bash
cd cultureai-extension-tests
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

This will install Chromium, Chrome, Edge, Firefox, and WebKit browsers.

## Project Structure

```
cultureai-extension-tests/
├── tests/                                    # Test files
│   ├── tc-001-common-weak-password.spec.js  # TC-001 tests
│   ├── tc-002-length-weak-password.spec.js  # TC-002 tests
│   ├── tc-003-single-type-weak-password.spec.js  # TC-003 tests
│   ├── tc-004-strong-password-no-detection.spec.js  # TC-004 tests
│   └── tc-005-non-corporate-email.spec.js   # TC-005 tests
├── test-fixtures/                           # Test fixtures
│   ├── mock-server.js                       # Mock API server
│   └── login.html                           # Test login page
├── test-data/                               # Test data
│   └── test-data.js                         # Passwords, emails, configs
├── utils/                                   # Utility functions
│   └── helpers.js                           # Helper functions
├── test-results/                            # Test execution results
├── playwright.config.js                     # Playwright configuration
├── package.json                             # Dependencies
└── README.md                                # This file
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with UI Mode (Recommended for Development)

```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser Actions)

```bash
npm run test:headed
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Specific Test Categories

**Smoke Tests (Quick validation):**
```bash
npm run test:smoke
```

**Critical Priority Tests (P1):**
```bash
npm run test:critical
```

**Regression Tests:**
```bash
npm run test:regression
```

### Run Specific Test File

```bash
npx playwright test tests/tc-001-common-weak-password.spec.js
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=chrome
npx playwright test --project=edge
```

### View Test Reports

After test execution, view the HTML report:

```bash
npm run test:report
```

## Test Coverage

### Test Cases Implemented

| Test ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| TC-001 | Detect Weak Password - Common Password | P1 | ✅ Implemented |
| TC-002 | Detect Weak Password - Length Criterion (≤12 chars) | P1 | ✅ Implemented |
| TC-003 | Detect Weak Password - Single Character Type | P1 | ✅ Implemented |
| TC-004 | Strong Password - No Detection | P1 | ✅ Implemented |
| TC-005 | Non-Corporate Email - No Detection | P1 | ✅ Implemented |

### Coverage by Test Type

- **Functional Testing**
- **Security Testing** 
- **Privacy Testing**:
- **Boundary Testing**:
- **Performance Testing**:

**Total**:

## 🧪 Test Scenarios

### TC-001: Common Weak Passwords
- Detects passwords from common password list (password123, 123456, qwerty)
- Validates proper hashing (SHA-256, multi-stage)
- Ensures no plaintext transmission
- Verifies HTTPS protocol usage

### TC-002: Length-Based Detection
- Detects passwords with ≤12 characters
- Tests boundary condition (exactly 12 characters)
- Validates API response (200 OK)
- Tests very short passwords (3 characters)

### TC-003: Single Character Type
- Detects lowercase-only passwords
- Detects uppercase-only passwords
- Detects digits-only passwords
- Detects special characters-only passwords
- Validates all four types generate separate events

### TC-004: Strong Password Validation
- Ensures strong passwords are NOT detected
- Validates no false positives
- Confirms normal login flow without interference
- Tests multiple strong password patterns

### TC-005: Privacy Compliance
- Ensures non-corporate emails are NOT monitored
- Tests multiple email providers (Gmail, Yahoo, Hotmail, Outlook)
- Validates no API calls for personal emails
- Confirms privacy-first approach

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: test-results/
        retention-days: 30
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
    post {
        always {
            publishHTML([
                reportDir: 'test-results/html-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report'
            ])
        }
    }
}
```

## Assumptions & Limitations

### Assumptions

1. **Browser Extension Simulation**: Since the actual browser extension is not accessible, tests simulate extension behavior by:
   - Using a mock API server to capture events
   - Implementing the expected hashing algorithm in utilities
   - Testing the login form interactions

2. **Multi-Stage Hashing**: The extension uses a 4-stage hashing process:
   - Stage 1: SHA-256 hash of password
   - Stage 2: Take first half (32 characters)
   - Stage 3: Hash again with SHA-256
   - Stage 4: Hash again with SHA-256
   
3. **Corporate Email Domain**: Only `@culture.ai` emails are considered corporate

4. **Weak Password Criteria**:
   - In common password list, OR
   - ≤12 characters in length, OR
   - Contains only one character type (lowercase, uppercase, digits, or special)

5. **API Endpoint**: Mock server runs on `https://doesnotexist.culture.ai/events`

### Limitations

1. **No Actual Extension Testing**: Tests validate the expected behavior without the real extension
2. **SSO Testing**: SSO login detection (TC-006) is not fully implemented due to OAuth complexity
3. **Local Testing Only**: Tests run against local mock server, not production endpoints
4. **Browser Profile Reading**: Browser profile detection is simulated

### Future Enhancements

- Integration with actual browser extension
- SSO provider testing (Google, Microsoft, Okta)
- Dynamic form detection tests
- Performance benchmarking with real-world sites
- Visual regression testing
- Accessibility testing

## Best Practices

### Code Quality

- **Clean Code**: Descriptive variable names, proper comments, consistent formatting
- **DRY Principle**: Reusable utility functions in `utils/helpers.js`
- **Test Independence**: Each test can run independently
- **Setup/Teardown**: Proper `beforeEach` hooks to ensure clean state

### Test Organization

- **Descriptive Names**: Test names clearly describe what is being tested
- **Tags**: Use tags (@P1, @smoke, @critical) for categorization
- **Test Data**: Centralized in `test-data/test-data.js`
- **Fixtures**: Reusable test fixtures in `test-fixtures/`

### Assertions

- **Meaningful Messages**: Custom error messages for better debugging
- **Multiple Assertions**: Verify multiple aspects in each test
- **Validation Helpers**: Use `validateEventPayload()` for consistent checks

### Reporting

- **Multiple Formats**: HTML (visual), JSON (parsing), JUnit (CI tools)
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Available for debugging

## Troubleshooting

### Mock Server Not Starting

**Issue**: Tests fail with "Connection refused" error

**Solution**:
```bash
# Manually start the mock server
node test-fixtures/mock-server.js

# In another terminal, run tests
npm test
```

### Browser Not Launching

**Issue**: Playwright can't find installed browsers

**Solution**:
```bash
# Reinstall browsers
npx playwright install --with-deps
```

### Tests Timing Out

**Issue**: Tests exceed timeout limits

**Solution**: Increase timeout in `playwright.config.js`:
```javascript
use: {
  actionTimeout: 30000, // Increase from 10000
}
```

### Extension Not Loading

**Issue**: Extension path not found

**Solution**: Ensure the extension directory exists:
```bash
mkdir -p extension
# Add your extension files to the extension/ directory
```

### Port Already in Use

**Issue**: Port 3000 is already in use

**Solution**: Change port in `test-fixtures/mock-server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

And update `playwright.config.js`:
```javascript
webServer: {
  url: 'http://localhost:3001',
}
```

## Test Execution Report

### Sample Output

```
Running 35 tests using 3 workers

✓ TC-001: Detect Weak Password - Common Password (5 tests)
  ✓ should detect common weak password "password123" @P1 @smoke @critical (2.1s)
  ✓ should detect multiple common weak passwords @P1 @regression (6.3s)
  ✓ should use HTTPS protocol for API requests @P1 @security (1.8s)
  ✓ should never send password in plaintext @P1 @security @critical (2.0s)
  ✓ should include all required fields @P1 @functional (1.9s)

✓ TC-002: Detect Weak Password - Length Criterion (6 tests)
  ✓ should detect password with ≤12 characters @P1 @smoke @critical (1.7s)
  ✓ should detect all test passwords with ≤12 characters @P1 @regression (5.2s)
  ...

35 passed (1.5m)
```

## 📞 Support

For questions or issues:
1. Check this README
2. Review test output and logs
3. Check Playwright documentation: https://playwright.dev
4. Review test files for implementation details

## 📄 License

This test suite is created for the CultureAI Browser Extension QA assessment.

---

**Created by**: QA Engineer  
**Date**: November 2025  
**Framework**: Playwright v1.40+  
**Node Version**: v16+
