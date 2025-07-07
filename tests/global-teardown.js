// Global teardown for Jest tests
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up test cache
  const cacheDir = path.join(process.cwd(), '.jest-cache');
  if (fs.existsSync(cacheDir)) {
    try {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('🗑️  Test cache cleaned');
    } catch (error) {
      console.warn('⚠️  Could not clean test cache:', error.message);
    }
  }
  
  // Clean up coverage directory if empty
  const coverageDir = path.join(process.cwd(), 'coverage');
  if (fs.existsSync(coverageDir)) {
    try {
      const files = fs.readdirSync(coverageDir);
      if (files.length === 0) {
        fs.rmdirSync(coverageDir);
        console.log('🗑️  Empty coverage directory cleaned');
      }
    } catch (error) {
      console.warn('⚠️  Could not clean coverage directory:', error.message);
    }
  }
  
  console.log('✅ Global teardown completed');
  console.log('🎉 All tests finished successfully!');
}; 