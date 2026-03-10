#!/bin/bash

# Test runner script for CI/CD
set -e

echo "🧪 Starting timezone tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in CI environment
if [ "$CI" = "true" ]; then
    print_status "Running in CI environment"
    TEST_COMMAND="npm run test:ci"
else
    print_status "Running in local environment"
    TEST_COMMAND="npm test"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found, installing dependencies..."
    npm install
fi

# Check if Jest is installed
if ! command -v npx jest &> /dev/null; then
    print_error "Jest not found. Installing Jest..."
    npm install --save-dev jest jest-environment-node
fi

# Set timezone for tests
export TZ="Asia/Ho_Chi_Minh"
print_status "Set timezone to: $TZ"

# Run tests
print_status "Running timezone tests..."
if $TEST_COMMAND; then
    print_success "All tests passed! ✅"
    
    # Check if coverage report exists
    if [ -d "coverage" ]; then
        print_status "Coverage report generated in coverage/ directory"
        
        # Display coverage summary
        if [ -f "coverage/coverage-summary.json" ]; then
            print_status "Coverage summary:"
            cat coverage/coverage-summary.json | jq -r '.total | "Lines: \(.lines.pct)% | Functions: \(.functions.pct)% | Branches: \(.branches.pct)% | Statements: \(.statements.pct)%"'
        fi
    fi
    
    exit 0
else
    print_error "Tests failed! ❌"
    exit 1
fi 