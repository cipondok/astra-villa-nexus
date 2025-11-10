# Testing Guide

![Coverage](https://img.shields.io/badge/coverage-70%25-yellow)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18)

Comprehensive testing documentation for the Astra Villa property platform.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Coverage](#test-coverage)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Coverage Thresholds](#coverage-thresholds)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 📊 Test Coverage

Current coverage status:

| Type | Coverage | Threshold | Status |
|------|----------|-----------|--------|
| **Lines** | 70%+ | 70% | ✅ Pass |
| **Functions** | 70%+ | 70% | ✅ Pass |
| **Branches** | 65%+ | 65% | ✅ Pass |
| **Statements** | 70%+ | 70% | ✅ Pass |

### Coverage Reports

After running `npm run test:coverage`, reports are generated in:

- **HTML Report**: `coverage/index.html` - Interactive browser-based report
- **LCOV Report**: `coverage/lcov.info` - For CI tools and IDEs
- **JSON Report**: `coverage/coverage-final.json` - Machine-readable format
- **Summary**: `coverage/coverage-summary.json` - Quick overview

View HTML report:
```bash
npm run test:coverage
open coverage/index.html
```

## 🧪 Test Types

### 1. Unit Tests
Test individual functions and utilities in isolation.

**Location**: `src/utils/__tests__/`

**Example**:
```typescript
// src/utils/__tests__/searchSuggestions.test.ts
describe('calculateTimeWeightedScore', () => {
  it('should return 0 for suggestion with no clicks', () => {
    const score = calculateTimeWeightedScore('test', {});
    expect(score).toBe(0);
  });
});
```

### 2. Integration Tests
Test component interactions and user workflows.

**Location**: `src/components/__tests__/`

**Example**:
```typescript
// src/components/__tests__/iPhoneSearchPanel.integration.test.tsx
describe('IPhoneSearchPanel Integration Tests', () => {
  it('should update search query on input', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'Jakarta');
    
    expect(input).toHaveValue('Jakarta');
  });
});
```

### 3. Component Tests
Test React components with React Testing Library.

**Best Practices**:
- Test user interactions, not implementation details
- Use accessible queries (`getByRole`, `getByLabelText`)
- Test from the user's perspective
- Mock external dependencies (Supabase, APIs)

## 🎯 Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Interactive UI
```bash
npm run test:ui
```

### Specific Test File
```bash
npm test searchSuggestions
```

### Specific Test Case
```bash
npm test -- -t "should calculate time-weighted score"
```

### Debug Mode
```bash
npm test -- --no-coverage --reporter=verbose
```

## 🎚️ Coverage Thresholds

Tests **will fail** if coverage drops below these thresholds:

```javascript
{
  lines: 70,      // 70% of lines must be covered
  functions: 70,  // 70% of functions must be covered
  branches: 65,   // 65% of branches must be covered
  statements: 70  // 70% of statements must be covered
}
```

### Why These Thresholds?

- **70% for most metrics**: Ensures core logic is tested while allowing flexibility
- **65% for branches**: Branching logic (if/else) is harder to cover fully
- **Enforced in CI**: Builds fail if thresholds aren't met

### Increasing Coverage

To improve coverage:

1. **Identify gaps**: Check `coverage/index.html` for red/yellow sections
2. **Write tests**: Focus on untested functions and branches
3. **Remove dead code**: Delete unused code to improve percentages
4. **Mock dependencies**: Isolate code by mocking external services

## ✍️ Writing Tests

### Test Structure (AAA Pattern)

```typescript
it('should do something specific', () => {
  // Arrange: Set up test data and state
  const input = { value: 'test' };
  
  // Act: Execute the code being tested
  const result = myFunction(input);
  
  // Assert: Verify the result
  expect(result).toBe('expected');
});
```

### Testing Best Practices

✅ **DO:**
- Write descriptive test names
- Test one thing per test
- Use `beforeEach` for common setup
- Mock external dependencies
- Test edge cases and errors
- Use accessible queries in component tests

❌ **DON'T:**
- Test implementation details
- Make tests depend on each other
- Use brittle selectors (CSS classes)
- Test third-party libraries
- Write overly complex tests

### Example: Testing a Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should update input on user typing', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const input = screen.getByRole('textbox', { name: /search/i });
    await user.type(input, 'test query');
    
    expect(input).toHaveValue('test query');
  });
  
  it('should call onSubmit when form is submitted', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<MyComponent onSubmit={mockSubmit} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);
    
    expect(mockSubmit).toHaveBeenCalledOnce();
  });
});
```

### Mocking Dependencies

#### Mock Supabase
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));
```

#### Mock React Hook
```typescript
vi.mock('@/hooks/useMyHook', () => ({
  useMyHook: () => ({
    data: { id: 1, name: 'Test' },
    loading: false,
    error: null,
  }),
}));
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

### Pre-commit Hook

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
npm test -- --run --coverage
```

This ensures tests pass before commits.

## 🐛 Troubleshooting

### Tests Fail in CI but Pass Locally

**Cause**: Environment differences

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules coverage
npm ci
npm test
```

### "Cannot find module" Errors

**Cause**: Path aliases not resolved

**Solution**: Check `vitest.config.ts` has correct aliases:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Flaky Tests (Intermittent Failures)

**Causes**:
- Race conditions with async code
- Timing issues
- Shared state between tests

**Solutions**:
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Clean up in beforeEach
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
```

### Low Coverage in Specific File

1. Run coverage and open HTML report
2. Click on the file in the report
3. Red/yellow lines are uncovered
4. Write tests for those sections

### Timeout Errors

Increase timeout for slow tests:
```typescript
it('should load data', async () => {
  // Test code
}, 10000); // 10 second timeout
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Coverage Best Practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)

## 🏆 Coverage Goals

Current goals for increasing coverage:

- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests: 75%+ coverage
- [ ] E2E tests: Critical user flows
- [ ] Accessibility tests: All interactive components
- [ ] Visual regression tests: Key UI components

## 📈 Continuous Improvement

Track coverage trends over time:

```bash
# Generate coverage badge
npm run test:coverage
# Badge updates automatically in README
```

**Target**: Gradually increase thresholds as coverage improves:
- Q1 2025: 75% line coverage
- Q2 2025: 80% line coverage
- Q3 2025: 85% line coverage

---

**Questions?** Open an issue or check our [Contributing Guide](CONTRIBUTING.md)

**Last Updated**: 2025-11-10
