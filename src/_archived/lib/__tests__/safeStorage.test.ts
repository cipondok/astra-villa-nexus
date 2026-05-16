import { describe, it, expect } from 'vitest';
import { safeLocalStorage, safeSessionStorage, getLocalDayKey } from '../safeStorage';

describe('safeLocalStorage', () => {
  it('sets and gets a value', () => {
    safeLocalStorage.setItem('test-key', 'hello');
    expect(safeLocalStorage.getItem('test-key')).toBe('hello');
    safeLocalStorage.removeItem('test-key');
  });

  it('returns null for missing key', () => {
    expect(safeLocalStorage.getItem('nonexistent-key-xyz')).toBeNull();
  });

  it('removes a value', () => {
    safeLocalStorage.setItem('rm-key', 'val');
    safeLocalStorage.removeItem('rm-key');
    expect(safeLocalStorage.getItem('rm-key')).toBeNull();
  });
});

describe('safeSessionStorage', () => {
  it('sets and gets a value', () => {
    safeSessionStorage.setItem('sess-key', 'world');
    expect(safeSessionStorage.getItem('sess-key')).toBe('world');
    safeSessionStorage.removeItem('sess-key');
  });

  it('returns null for missing key', () => {
    expect(safeSessionStorage.getItem('nonexistent-sess')).toBeNull();
  });
});

describe('getLocalDayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = getLocalDayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches today\'s date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getLocalDayKey()).toBe(expected);
  });
});
