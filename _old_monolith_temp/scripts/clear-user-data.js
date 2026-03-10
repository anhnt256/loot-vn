/**
 * Script to clear all user-related localStorage items
 * Run this in the browser console or as a Node.js script
 */

function clearUserData() {
  if (typeof window !== "undefined") {
    // Clear all known user-related localStorage items
    const userKeys = [
      "currentUser",
      "token", 
      "userInfo",
      "user_info", 
      "user-info"
    ];
    
    userKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed localStorage item: ${key}`);
    });
    
    console.log("All user-related localStorage items have been cleared");
  } else {
    console.log("This script should be run in a browser environment");
  }
}

// Export for Node.js usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { clearUserData };
}

// Auto-execute if run directly in browser
if (typeof window !== "undefined") {
  clearUserData();
} 