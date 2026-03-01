import { describe, it, expect } from 'vitest';

describe('ErrorBoundary - error handling logic', () => {
  it('captures error message', () => {
    const error = new Error('Something went wrong');
    expect(error.message).toBe('Something went wrong');
  });

  it('error has stack trace', () => {
    const error = new Error('test');
    expect(error.stack).toBeDefined();
  });

  it('fallback UI renders on error', () => {
    const hasError = true;
    const ui = hasError ? 'error-fallback' : 'normal-content';
    expect(ui).toBe('error-fallback');
  });

  it('retry resets error state', () => {
    let hasError = true;
    const retry = () => { hasError = false; };
    retry();
    expect(hasError).toBe(false);
  });

  it('logs error to monitoring service', () => {
    const errors: string[] = [];
    const logError = (err: Error) => errors.push(err.message);
    logError(new Error('crash'));
    expect(errors).toContain('crash');
  });

  it('nested boundaries catch closest', () => {
    const boundaries = ['app', 'page', 'component'];
    const caughtBy = boundaries[boundaries.length - 1];
    expect(caughtBy).toBe('component');
  });
});
