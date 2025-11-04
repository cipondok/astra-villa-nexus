/**
 * UUID Validation Error Logging and Monitoring
 * Tracks UUID validation failures with detailed context for debugging
 */

export interface UUIDValidationError {
  timestamp: string;
  context: string;
  invalidValue: any;
  stackTrace?: string;
  userAgent?: string;
  route?: string;
  additionalInfo?: Record<string, any>;
}

class UUIDValidationLogger {
  private errors: UUIDValidationError[] = [];
  private maxErrors = 100; // Keep last 100 errors in memory
  private reportingEndpoint = '/api/log-uuid-error'; // Future: send to backend

  /**
   * Log a UUID validation failure with full context
   */
  logValidationFailure(
    context: string,
    invalidValue: any,
    additionalInfo?: Record<string, any>
  ): void {
    const error: UUIDValidationError = {
      timestamp: new Date().toISOString(),
      context,
      invalidValue: this.sanitizeValue(invalidValue),
      stackTrace: this.captureStackTrace(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      additionalInfo,
    };

    // Add to in-memory store
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest
    }

    // Console logging with clear formatting
    console.error('🔴 UUID Validation Failure:', {
      context,
      value: error.invalidValue,
      type: typeof invalidValue,
      route: error.route,
      ...additionalInfo,
    });

    // Store in localStorage for persistence across page reloads
    this.persistToLocalStorage(error);

    // Future: Send to backend monitoring service
    // this.sendToBackend(error);
  }

  /**
   * Sanitize the invalid value for safe logging
   */
  private sanitizeValue(value: any): any {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Complex Object]';
      }
    }
    return String(value);
  }

  /**
   * Capture stack trace for debugging
   */
  private captureStackTrace(): string {
    try {
      const stack = new Error().stack;
      return stack?.split('\n').slice(2, 6).join('\n') || 'No stack trace available';
    } catch {
      return 'Stack trace capture failed';
    }
  }

  /**
   * Persist error to localStorage for cross-session tracking
   */
  private persistToLocalStorage(error: UUIDValidationError): void {
    try {
      const storageKey = 'uuid_validation_errors';
      const existingErrors = localStorage.getItem(storageKey);
      const errors: UUIDValidationError[] = existingErrors ? JSON.parse(existingErrors) : [];
      
      errors.push(error);
      
      // Keep only last 50 in localStorage
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to persist UUID validation error to localStorage:', e);
    }
  }

  /**
   * Get all logged errors from current session
   */
  getErrors(): UUIDValidationError[] {
    return [...this.errors];
  }

  /**
   * Get errors from localStorage (persisted across sessions)
   */
  getPersistedErrors(): UUIDValidationError[] {
    try {
      const storageKey = 'uuid_validation_errors';
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all logged errors
   */
  clearErrors(): void {
    this.errors = [];
    try {
      localStorage.removeItem('uuid_validation_errors');
    } catch {
      console.warn('Failed to clear UUID validation errors from localStorage');
    }
  }

  /**
   * Get statistics about UUID validation failures
   */
  getStats(): {
    totalErrors: number;
    errorsByContext: Record<string, number>;
    errorsByRoute: Record<string, number>;
    recentErrors: UUIDValidationError[];
  } {
    const allErrors = [...this.errors, ...this.getPersistedErrors()];
    
    const errorsByContext: Record<string, number> = {};
    const errorsByRoute: Record<string, number> = {};
    
    allErrors.forEach(error => {
      errorsByContext[error.context] = (errorsByContext[error.context] || 0) + 1;
      if (error.route) {
        errorsByRoute[error.route] = (errorsByRoute[error.route] || 0) + 1;
      }
    });

    return {
      totalErrors: allErrors.length,
      errorsByContext,
      errorsByRoute,
      recentErrors: allErrors.slice(-10),
    };
  }

  /**
   * Export errors as JSON for support/debugging
   */
  exportErrors(): string {
    const stats = this.getStats();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      stats,
      allErrors: [...this.errors, ...this.getPersistedErrors()],
    }, null, 2);
  }
}

// Singleton instance
export const uuidValidationLogger = new UUIDValidationLogger();

/**
 * Enhanced UUID validation with automatic error logging
 */
export const validateUUIDWithLogging = (
  uuid: string | undefined | null,
  context: string,
  additionalInfo?: Record<string, any>
): boolean => {
  if (!uuid) {
    uuidValidationLogger.logValidationFailure(
      context,
      uuid,
      { reason: 'Null or undefined UUID', ...additionalInfo }
    );
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(uuid);

  if (!isValid) {
    uuidValidationLogger.logValidationFailure(
      context,
      uuid,
      { reason: 'Invalid UUID format', ...additionalInfo }
    );
  }

  return isValid;
};

/**
 * Require valid UUID with logging, throws error if invalid
 */
export const requireValidUUIDWithLogging = (
  uuid: string | undefined | null,
  context: string,
  additionalInfo?: Record<string, any>
): string => {
  if (!validateUUIDWithLogging(uuid, context, additionalInfo)) {
    const errorMsg = `Invalid UUID in ${context}: ${uuid}`;
    throw new Error(errorMsg);
  }
  return uuid as string;
};
