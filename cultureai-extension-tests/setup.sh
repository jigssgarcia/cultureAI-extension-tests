#!/bin/bash

# Setup script for CultureAI Extension Tests
# This script installs all dependencies and prepares the test environment

echo "================================================"
echo "CultureAI Browser Extension - Test Suite Setup"
echo "================================================"
echo ""

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js v16 or higher from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install npm dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✅ Playwright browsers installed"
echo ""

# Install system dependencies (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Installing system dependencies for Linux..."
    npx playwright install-deps
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Failed to install system dependencies (may require sudo)"
        echo "You can manually run: sudo npx playwright install-deps"
    else
        echo "✅ System dependencies installed"
    fi
    echo ""
fi

# Verify setup
echo "🧪 Verifying setup..."

# Check if mock server script exists
if [ ! -f "test-fixtures/mock-server.js" ]; then
    echo "❌ Mock server script not found!"
    exit 1
fi

# Check if test files exist
TEST_COUNT=$(find tests -name "*.spec.js" | wc -l)
if [ $TEST_COUNT -eq 0 ]; then
    echo "❌ No test files found!"
    exit 1
fi

echo "✅ Found $TEST_COUNT test files"
echo ""

# Create test-results directory
mkdir -p test-results

echo "================================================"
echo "✅ Setup completed successfully!"
echo "================================================"
echo ""
echo "You can now run tests using:"
echo "  npm test              - Run all tests"
echo "  npm run test:ui       - Run tests in UI mode"
echo "  npm run test:headed   - Run tests in headed mode"
echo "  npm run test:smoke    - Run smoke tests"
echo "  npm run test:critical - Run critical tests"
echo ""
echo "For more information, see README.md"
echo ""
