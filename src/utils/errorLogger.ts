import { supabase } from '@/integrations/supabase/client';

export interface ErrorLogData {
  error_type: string;
  error_message: string;
  error_stack?: string;
  user_id?: string;
  user_email?: string;
  page_url?: string;
  user_agent?: string;
  component_name?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Log an error to the database for admin monitoring
 */
export async function logError(errorData: ErrorLogData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logEntry = {
      ...errorData,
      user_id: errorData.user_id || user?.id,
      user_email: errorData.user_email || user?.email,
      page_url: errorData.page_url || window.location.href,
      error_page: errorData.page_url || window.location.href, // Map to existing column
      user_agent: errorData.user_agent || navigator.userAgent,
      severity: errorData.severity || 'medium',
      status: 'new'
    };

    const { error } = await supabase
      .from('error_logs')
      .insert([logEntry]);

    if (error) {
      console.error('Failed to log error to database:', error);
    }
  } catch (err) {
    // Silently fail - don't want error logging to cause more errors
    console.error('Error logger failed:', err);
  }
}

/**
 * Log a search error
 */
export async function logSearchError(error: any, searchData: any) {
  await logError({
    error_type: 'search_error',
    error_message: error instanceof Error ? error.message : String(error),
    error_stack: error instanceof Error ? error.stack : undefined,
    component_name: 'Search',
    severity: 'high',
    metadata: {
      searchData,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Log an API error
 */
export async function logAPIError(
  endpoint: string,
  error: any,
  requestData?: any
) {
  await logError({
    error_type: 'api_error',
    error_message: error instanceof Error ? error.message : String(error),
    error_stack: error instanceof Error ? error.stack : undefined,
    component_name: endpoint,
    severity: 'critical',
    metadata: {
      endpoint,
      requestData,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Log a component error
 */
export async function logComponentError(
  componentName: string,
  error: any,
  errorInfo?: any
) {
  await logError({
    error_type: 'component_error',
    error_message: error instanceof Error ? error.message : String(error),
    error_stack: error instanceof Error ? error.stack : undefined,
    component_name: componentName,
    severity: 'medium',
    metadata: {
      errorInfo,
      timestamp: new Date().toISOString()
    }
  });
}
