module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.js',
    '<rootDir>/tests/**/*.ts'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'actions/**/*.{js,ts}',
    'app/api/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Module name mapping for TypeScript
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/dist/',
    '/build/'
  ],
  
  // Collect coverage from specific directories
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/tests/',
    '/scripts/',
    '/public/'
  ],
  
  // Environment variables for tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    TZ: 'Asia/Ho_Chi_Minh'
  },
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js'
}; 