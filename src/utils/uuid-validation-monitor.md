# UUID Validation Error Monitoring System

## Overview
Comprehensive error logging and monitoring system for tracking UUID validation failures across the application.

## Features

### 1. Automatic Error Logging
All UUID validation failures are automatically logged with:
- **Timestamp**: When the error occurred
- **Context**: Where in the code the validation failed
- **Invalid Value**: What value was passed (sanitized for safety)
- **Stack Trace**: Code execution path leading to the error
- **User Agent**: Browser/device information
- **Route**: Current page/route when error occurred
- **Additional Info**: Custom metadata about the error

### 2. Persistent Storage
- Errors stored in **memory** for current session (last 100 errors)
- Errors stored in **localStorage** for persistence across page reloads (last 50 errors)
- Can be exported as JSON for debugging/support

### 3. Admin Dashboard
Visual monitoring dashboard showing:
- Total error count
- Errors grouped by context (function/component name)
- Errors grouped by route (page URL)
- Recent error details with full context
- Export and clear functionality

## Usage

### Basic UUID Validation with Logging

```typescript
import { validateUUIDWithLogging } from '@/utils/uuid-validation-logger';

// Validate and automatically log failures
const isValid = validateUUIDWithLogging(
  userId,
  'MyComponent.handleClick', // context - where this is called
  { action: 'delete_user' }   // additional info (optional)
);

if (!isValid) {
  // Handle invalid UUID
  return;
}
```

### Require Valid UUID (Throws Error)

```typescript
import { requireValidUUIDWithLogging } from '@/utils/uuid-validation-logger';

try {
  // Will throw error if UUID is invalid
  const validUserId = requireValidUUIDWithLogging(
    userId,
    'UserProfile.loadData',
    { userId, timestamp: Date.now() }
  );
  
  // Proceed with valid UUID
  await loadUserData(validUserId);
} catch (error) {
  console.error('Invalid user ID:', error);
}
```

### Access Error Logs Programmatically

```typescript
import { uuidValidationLogger } from '@/utils/uuid-validation-logger';

// Get current session errors
const currentErrors = uuidValidationLogger.getErrors();

// Get persisted errors from localStorage
const persistedErrors = uuidValidationLogger.getPersistedErrors();

// Get statistics
const stats = uuidValidationLogger.getStats();
console.log('Total errors:', stats.totalErrors);
console.log('Errors by context:', stats.errorsByContext);
console.log('Recent errors:', stats.recentErrors);

// Export all errors as JSON
const exportData = uuidValidationLogger.exportErrors();
console.log(exportData);

// Clear all errors
uuidValidationLogger.clearErrors();
```

### View Admin Dashboard

Add the UUIDValidationMonitor component to your admin panel:

```typescript
import { UUIDValidationMonitor } from '@/components/admin/UUIDValidationMonitor';

// In your admin dashboard
<UUIDValidationMonitor />
```

## Integration Points

### Already Integrated
✅ **AuthContext.tsx**: Profile fetching with user ID validation  
✅ **useOptimizedQuery.ts**: User profile query hook  
✅ **search-by-image edge function**: UUID validation for API calls

### Recommended Integration Points
- All database queries involving user IDs
- Edge functions accepting UUID parameters
- API routes handling user-specific data
- Components receiving UUID props from URL params
- Form submissions with UUID fields

## Common Patterns

### Pattern 1: Database Query Protection
```typescript
const fetchUserData = async (userId: string) => {
  if (!validateUUIDWithLogging(userId, 'fetchUserData', { 
    source: 'api_call' 
  })) {
    throw new Error('Invalid user ID');
  }
  
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};
```

### Pattern 2: Route Param Validation
```typescript
const UserProfile = () => {
  const { userId } = useParams();
  
  useEffect(() => {
    if (!validateUUIDWithLogging(userId, 'UserProfile.mount', {
      route: window.location.pathname
    })) {
      navigate('/error?message=invalid-user-id');
      return;
    }
    
    loadProfile(userId);
  }, [userId]);
};
```

### Pattern 3: Edge Function Input Validation
```typescript
serve(async (req) => {
  const { userId } = await req.json();
  
  if (!isValidUUID(userId)) {
    logUUIDValidationError('my-function', userId, {
      headers: Object.fromEntries(req.headers),
      method: req.method
    });
    
    return new Response(
      JSON.stringify({ error: 'Invalid user ID' }),
      { status: 400 }
    );
  }
  
  // Process with valid UUID
});
```

## Debugging UUID Errors

### Step 1: Check the Admin Dashboard
1. Navigate to admin panel
2. Open UUID Validation Monitor
3. Review "Recent Errors" tab for latest failures
4. Check "By Context" to find which functions are failing most
5. Check "By Route" to find which pages have issues

### Step 2: Export Error Data
1. Click "Export" button in dashboard
2. Download JSON file with all error details
3. Search for patterns in invalid values
4. Identify common sources (e.g., URL params, API responses)

### Step 3: Review Stack Traces
1. Expand stack trace in error details
2. Trace back to original source of invalid UUID
3. Add validation at the entry point

### Step 4: Check localStorage
```javascript
// In browser console
const errors = JSON.parse(localStorage.getItem('uuid_validation_errors'));
console.table(errors);
```

## Performance Considerations

- **Memory**: Keeps max 100 errors in memory
- **localStorage**: Keeps max 50 errors persisted
- **Console Logging**: Only logs validation failures (not successes)
- **No Network Calls**: All logging is local (future: can add backend reporting)

## Future Enhancements

1. **Backend Reporting**: Send error logs to backend for centralized monitoring
2. **Real-time Alerts**: Notify admins when error thresholds are exceeded
3. **Trend Analysis**: Track error rates over time
4. **User Impact Tracking**: Associate errors with specific user sessions
5. **Automatic Fixes**: Suggest code changes based on common error patterns
