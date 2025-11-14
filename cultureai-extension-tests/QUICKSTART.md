# Quick Start Guide

Get up and running with the CultureAI Browser Extension test suite.

## Prerequisites

- Node.js v16+ installed
- npm v7+ installed
- 2GB of free disk space (for browsers)

## Installation (3 steps)

### Step 1: Navigate to Project Directory

```bash
cd cultureai-extension-tests
```

### Step 2: Run Setup Script

**Linux/macOS:**
```bash
./setup.sh
```

**Windows:**
```bash
npm install
npx playwright install
```

### Step 3: Verify Installation

```bash
npm test -- --list
```

You should see a list of test cases.

## Running Your First Test

### Run All Tests

```bash
npm test
```

### Run Tests in UI Mode (Recommended)

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See all tests
- Run individual tests
- Debug with time-travel
- View traces and screenshots

### Run Smoke Tests (Quick Validation)

```bash
npm run test:smoke
```

This runs the most critical tests.

## Understanding Test Results

After running tests, you'll see output like:

```
✓ TC-001: Common Weak Password (5 tests)
  ✓ should detect common weak password "password123" @P1 @smoke @critical (2.1s)
  ✓ should detect multiple common weak passwords @P1 @regression (6.3s)
  ...

35 passed (1.5m)
```

### View HTML Report

```bash
npm run test:report
```

This opens an HTML report with:
- Test results summary
- Screenshots of failures
- Test execution traces
- Timing information

## Common Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:headed` | See browser while testing |
| `npm run test:smoke` | Run smoke tests only |
| `npm run test:critical` | Run P1 tests only |
| `npm run test:debug` | Debug mode |
| `npm run test:report` | View last test report |

## Test Categories

Tests are tagged for easy filtering:

- `@smoke` - Essential tests for quick validation
- `@P1` - Priority 1 critical tests
- `@critical` - Most critical functionality
- `@security` - Security-related tests
- `@privacy` - Privacy compliance tests
- `@regression` - Regression test suite

### Run Specific Category

```bash
npx playwright test --grep @security
```

## Project Structure Quick Reference

```
cultureai-extension-tests/
├── tests/              # Your test files (.spec.js)
├── test-fixtures/      # Mock server and test pages
├── test-data/          # Test data (passwords, emails)
├── utils/              # Helper functions
├── extension/          # Mock browser extension
└── README.md           # Full documentation
```

## Troubleshooting

### Tests Failing?

1. **Check mock server is running**
   ```bash
   # In a separate terminal:
   node test-fixtures/mock-server.js
   ```

2. **Clear previous test results**
   ```bash
   rm -rf test-results/
   ```

3. **Reinstall dependencies**
   ```bash
   npm ci
   npx playwright install --with-deps
   ```

### Need Help?

1. Check `README.md` for detailed documentation
2. Review test files in `tests/` directory
3. Check Playwright docs: https://playwright.dev

## Next Steps

1. Run all tests successfully
2. Read the full README.md
3. Explore test files in `tests/` directory
4. Customize test data in `test-data/test-data.js`
5. Add your own test cases

## Example: Adding Your First Test

Create a new file: `tests/my-first-test.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test('my first test', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/test-fixtures/login.html');
  await expect(page.locator('h1')).toContainText('Test Login');
});
```

Run it:
```bash
npx playwright test tests/my-first-test.spec.js
```

## Happy Testing!

For questions, refer to the main README.md or test files for examples.
