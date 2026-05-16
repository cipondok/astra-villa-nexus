/**
 * UUID Validation Utilities
 * Provides consistent UUID validation across the application to prevent
 * "invalid input syntax for type uuid" database errors
 */

/**
 * Validates if a string is a valid UUID v4 format
 * @param uuid - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string | undefined | null): boolean => {
  if (!uuid) return false;
  
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates if a string is a valid UUID and throws an error if not
 * Useful for operations that require a valid UUID
 * @param uuid - The string to validate
 * @param context - Optional context for the error message
 * @throws Error if UUID is invalid
 */
export const requireValidUUID = (
  uuid: string | undefined | null, 
  context?: string
): string => {
  if (!isValidUUID(uuid)) {
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(`Invalid UUID format${contextMsg}: ${uuid}`);
  }
  return uuid as string;
};

/**
 * Safely validates a UUID and returns null if invalid
 * Useful for optional UUID parameters
 * @param uuid - The string to validate
 * @returns The UUID if valid, null otherwise
 */
export const safeUUID = (uuid: string | undefined | null): string | null => {
  return isValidUUID(uuid) ? (uuid as string) : null;
};

/**
 * Validates multiple UUIDs at once
 * @param uuids - Array of UUIDs to validate
 * @returns true if all are valid, false if any are invalid
 */
export const areValidUUIDs = (uuids: (string | undefined | null)[]): boolean => {
  return uuids.every(uuid => isValidUUID(uuid));
};
