# Search Suggestions Tests

This directory contains unit tests for the search suggestion utilities used in the iPhoneSearchPanel component.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run only search suggestion tests
```bash
npm test searchSuggestions
```

## Test Coverage

The test suite covers:

### 1. **calculateTimeWeightedScore**
- Returns 0 for suggestions with no clicks
- Calculates higher scores for recent clicks
- Handles multiple timestamps correctly
- Implements exponential decay for older clicks

### 2. **sortByPopularity**
- Sorts items by weighted popularity score
- Maintains immutability (doesn't modify original array)
- Orders most popular items first

### 3. **getLocationSuggestions**
- Returns empty array for queries < 2 characters
- Matches provinces by name
- Matches cities with province context
- Matches areas with full location path
- Limits results to 5 items
- Case-insensitive matching

### 4. **getFilteredSuggestions**
- Returns default suggestions when query is empty
- Filters all suggestion types by query
- Includes location matches
- Respects limits for each category:
  - Recent: max 3
  - Smart: max 3
  - Trending: max 4
  - Locations: max 5

### 5. **trackSuggestionClick**
- Creates new entry for first click
- Increments count for existing suggestions
- Limits timestamps to 50 most recent
- Maintains immutability

### 6. **getDisplayCount**
- Returns 0 for non-existent suggestions
- Returns correct count for existing suggestions
- Handles missing count properties

## Why These Tests Matter

1. **Prevent Regressions**: Catch bugs before they reach production
2. **Document Behavior**: Tests serve as living documentation
3. **Enable Refactoring**: Confidently refactor knowing tests will catch issues
4. **Improve Code Quality**: Writing testable code leads to better architecture

## Test Structure

```typescript
describe('functionName', () => {
  it('should do something specific', () => {
    // Arrange: Set up test data
    const input = { ... };
    
    // Act: Execute the function
    const result = functionName(input);
    
    // Assert: Verify the result
    expect(result).toBe(expectedValue);
  });
});
```

## Debugging Failed Tests

If a test fails:

1. **Read the error message** - It tells you what was expected vs what was received
2. **Check the test name** - It describes what behavior was expected
3. **Look at the stack trace** - Shows which line caused the failure
4. **Add console.log** - Debug by logging intermediate values
5. **Run single test** - Focus on one failing test at a time:
   ```bash
   npm test -- -t "test name"
   ```

## Best Practices

- ✅ Test one thing per test case
- ✅ Use descriptive test names
- ✅ Follow Arrange-Act-Assert pattern
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ✅ Keep tests fast and isolated
- ❌ Don't test implementation details
- ❌ Don't make tests dependent on each other

## CI/CD Integration

These tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

Builds will fail if tests don't pass, ensuring code quality.
