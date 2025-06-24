
import { useState, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

interface ErrorInfo {
  type: 'network' | 'auth' | 'permission' | 'validation' | 'server' | 'unknown';
  message: string;
  code?: string;
  suggestion?: string;
  retryable: boolean;
}

export const useSupabaseErrorHandler = () => {
  const [lastError, setLastError] = useState<ErrorInfo | null>(null);

  const classifyError = (error: any): ErrorInfo => {
    console.error('Supabase error:', error);

    // Network errors
    if (error.name === 'AbortError' || error.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection failed',
        suggestion: 'Check your internet connection and try again',
        retryable: true
      };
    }

    // Authentication errors
    if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('auth')) {
      return {
        type: 'auth',
        message: 'Authentication required',
        code: error.code,
        suggestion: 'Please log in again',
        retryable: false
      };
    }

    // Permission errors
    if (error.code === 'PGRST116' || error.message?.includes('RLS') || error.message?.includes('permission')) {
      return {
        type: 'permission',
        message: 'Access denied',
        code: error.code,
        suggestion: 'You do not have permission to access this resource',
        retryable: false
      };
    }

    // Validation errors
    if (error.code?.startsWith('23') || error.message?.includes('constraint') || error.message?.includes('validation')) {
      return {
        type: 'validation',
        message: error.message || 'Data validation failed',
        code: error.code,
        suggestion: 'Please check your input and try again',
        retryable: false
      };
    }

    // Server errors
    if (error.code?.startsWith('5') || error.status >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred',
        code: error.code,
        suggestion: 'Please try again in a few moments',
        retryable: true
      };
    }

    // Unknown errors
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      suggestion: 'Please try again or contact support if the issue persists',
      retryable: true
    };
  };

  const handleError = useCallback((error: any) => {
    const errorInfo = classifyError(error);
    setLastError(errorInfo);
    return errorInfo;
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const createRetryableQuery = useCallback((queryFn: () => Promise<any>, maxRetries = 3) => {
    let retryCount = 0;

    const executeWithRetry = async (): Promise<any> => {
      try {
        const result = await queryFn();
        clearError();
        return result;
      } catch (error) {
        const errorInfo = handleError(error);
        
        if (errorInfo.retryable && retryCount < maxRetries) {
          retryCount++;
          const delay = Math.min(Math.pow(2, retryCount) * 1000, 10000); // Exponential backoff, max 10s
          
          console.log(`Retrying query in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry();
        }
        
        throw error;
      }
    };

    return executeWithRetry;
  }, [handleError, clearError]);

  return {
    lastError,
    handleError,
    clearError,
    createRetryableQuery
  };
};
