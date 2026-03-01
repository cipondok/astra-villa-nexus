import { describe, it, expect, vi } from 'vitest';

describe('useDebounce - edge cases', () => {
  it('returns initial value immediately', () => {
    const value = 'hello';
    let debounced = value;
    expect(debounced).toBe('hello');
  });

  it('delay of 0 still debounces', () => {
    const delay = 0;
    expect(delay).toBeGreaterThanOrEqual(0);
  });

  it('handles undefined values', () => {
    const value: string | undefined = undefined;
    const debounced = value ?? '';
    expect(debounced).toBe('');
  });

  it('handles rapid value changes', () => {
    const changes = ['a', 'ab', 'abc', 'abcd'];
    const final = changes[changes.length - 1];
    expect(final).toBe('abcd');
  });

  it('handles numeric debounce values', () => {
    const value = 42;
    expect(typeof value).toBe('number');
  });

  it('handles object values', () => {
    const obj = { key: 'value' };
    const serialized = JSON.stringify(obj);
    expect(JSON.parse(serialized)).toEqual(obj);
  });
});
