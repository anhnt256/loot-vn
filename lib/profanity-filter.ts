import * as leoProfanity from "leo-profanity";

// Initialize profanity filter
leoProfanity.loadDictionary("en");

// Add Vietnamese profanity words
leoProfanity.add([
  // Basic profanity
  "đm", "địt", "vkl", "vcl", "clgt", "lồn", "cặc", "đụ", "đéo", "đĩ",
  
  // Personal attacks
  "má mày", "mẹ mày", "óc chó", "chó má", "ngu", "thằng", "con", "mẹ", "bố", "cha",
  "ông", "bà", "cụ", "tổ", "tiên", "sư", "thầy", "cô", "anh", "chị", "em", "bạn",
  "người", "kẻ", "mày", "tao", "nó", "hắn", "đồ", "cái",
  
  // English profanity
  "fuck", "shit", "damn", "bitch", "asshole", "stupid", "idiot", "moron", "crap", "hell",
  
  // Vietnamese phrases
  "địt mẹ", "đụ mẹ", "đéo mẹ", "địt bố", "đụ bố", "đéo bố", "địt cha", "đụ cha", "đéo cha",
  "đồ ngu", "chó lợn", "thằng ngu", "con ngu", "mẹ nó", "bố nó", "cha nó"
]);

/**
 * Filter profanity from text
 */
export function filterProfanity(text: string): string {
  if (!text) return text;
  
  try {
    return leoProfanity.clean(text);
  } catch (error) {
    console.error('Error filtering profanity:', error);
    return text;
  }
}

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  try {
    return leoProfanity.check(text);
  } catch (error) {
    console.error('Error checking profanity:', error);
    return false;
  }
}

/**
 * Add custom profanity words
 */
export function addProfanityWords(words: string[]): void {
  try {
    leoProfanity.add(words);
  } catch (error) {
    console.error('Error adding profanity words:', error);
  }
}

/**
 * Get list of profanity words
 */
export function getProfanityWords(): string[] {
  try {
    return leoProfanity.list();
  } catch (error) {
    console.error('Error getting profanity words:', error);
    return [];
  }
}

/**
 * Clear all profanity words
 */
export function clearProfanityWords(): void {
  try {
    leoProfanity.clearList();
  } catch (error) {
    console.error('Error clearing profanity words:', error);
  }
}
