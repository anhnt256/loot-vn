/**
 * Chat message validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Sanitize message content
 */
export function sanitizeMessage(content: string): string {
  return (
    content
      .trim()
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .substring(0, 1000)
  ); // Limit to 1000 characters
}

/**
 * Validate message content
 */
export function validateMessage(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push("Message content cannot be empty");
  }

  if (content.length > 1000) {
    errors.push("Message content too long (max 1000 characters)");
  }

  if (content.length < 1) {
    errors.push("Message content too short (min 1 character)");
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/g, // Repeated characters (more than 10)
    /https?:\/\/[^\s]+/g, // URLs
    /[A-Z]{10,}/g, // All caps (more than 10)
    /[!@#$%^&*()_+=[\]{}|;':",./<>?]{5,}/g, // Special characters spam
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      errors.push("Message contains spam patterns");
      break;
    }
  }

  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(content)) {
      errors.push("Message contains potentially harmful content");
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate machine name
 */
export function validateMachineName(machineName: string): ValidationResult {
  const errors: string[] = [];

  if (!machineName || machineName.trim().length === 0) {
    errors.push("Machine name is required");
  }

  if (machineName.length > 255) {
    errors.push("Machine name too long (max 255 characters)");
  }

  // Check for valid machine name pattern
  const validPattern = /^[a-zA-Z0-9\-_.]+$/;
  if (!validPattern.test(machineName)) {
    errors.push("Machine name contains invalid characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate user ID
 */
export function validateUserId(userId: any): ValidationResult {
  const errors: string[] = [];

  if (userId === null || userId === undefined) {
    return { isValid: true, errors: [] }; // User ID is optional
  }

  const numUserId = parseInt(userId.toString(), 10);
  if (isNaN(numUserId)) {
    errors.push("Invalid user ID format");
  }

  if (numUserId < 1) {
    errors.push("User ID must be positive");
  }

  if (numUserId > 2147483647) {
    // Max int32
    errors.push("User ID too large");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate staff ID
 */
export function validateStaffId(staffId: any): ValidationResult {
  const errors: string[] = [];

  if (staffId === null || staffId === undefined) {
    return { isValid: true, errors: [] }; // Staff ID is optional
  }

  const numStaffId = parseInt(staffId.toString(), 10);
  if (isNaN(numStaffId)) {
    errors.push("Invalid staff ID format");
  }

  if (numStaffId < 1) {
    errors.push("Staff ID must be positive");
  }

  if (numStaffId > 2147483647) {
    // Max int32
    errors.push("Staff ID too large");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: any, limit: any): ValidationResult {
  const errors: string[] = [];

  const numPage = parseInt(page?.toString() || "1", 10);
  const numLimit = parseInt(limit?.toString() || "50", 10);

  if (isNaN(numPage) || numPage < 1) {
    errors.push("Page must be a positive integer");
  }

  if (isNaN(numLimit) || numLimit < 1) {
    errors.push("Limit must be a positive integer");
  }

  if (numLimit > 100) {
    errors.push("Limit cannot exceed 100");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate chat message data
 */
export function validateChatMessage(data: {
  content: string;
  machineName: string;
  userId?: any;
  staffId?: any;
}): ValidationResult {
  const errors: string[] = [];

  // Validate content
  const contentValidation = validateMessage(data.content);
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  }

  // Validate machine name
  const machineValidation = validateMachineName(data.machineName);
  if (!machineValidation.isValid) {
    errors.push(...machineValidation.errors);
  }

  // Validate user ID
  const userValidation = validateUserId(data.userId);
  if (!userValidation.isValid) {
    errors.push(...userValidation.errors);
  }

  // Validate staff ID
  const staffValidation = validateStaffId(data.staffId);
  if (!staffValidation.isValid) {
    errors.push(...staffValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
