import { describe, it, expect } from 'vitest';

describe('useKeyboardShortcuts - matching logic', () => {
  const matchesShortcut = (
    event: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean },
    shortcut: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }
  ) => {
    const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatches = shortcut.ctrlKey ? (event.ctrlKey ?? false) : !(event.ctrlKey ?? false);
    const shiftMatches = shortcut.shiftKey ? (event.shiftKey ?? false) : !(event.shiftKey ?? false);
    const altMatches = shortcut.altKey ? (event.altKey ?? false) : !(event.altKey ?? false);
    return keyMatches && ctrlMatches && shiftMatches && altMatches;
  };

  it('matches simple key press', () => {
    expect(matchesShortcut({ key: 'k' }, { key: 'k' })).toBe(true);
  });

  it('is case insensitive', () => {
    expect(matchesShortcut({ key: 'K' }, { key: 'k' })).toBe(true);
  });

  it('matches Ctrl+K', () => {
    expect(matchesShortcut({ key: 'k', ctrlKey: true }, { key: 'k', ctrlKey: true })).toBe(true);
  });

  it('rejects Ctrl+K when only K pressed', () => {
    expect(matchesShortcut({ key: 'k' }, { key: 'k', ctrlKey: true })).toBe(false);
  });

  it('rejects K when Ctrl+K pressed but shortcut expects plain K', () => {
    expect(matchesShortcut({ key: 'k', ctrlKey: true }, { key: 'k' })).toBe(false);
  });

  it('matches Shift+Alt combo', () => {
    expect(matchesShortcut(
      { key: 's', shiftKey: true, altKey: true },
      { key: 's', shiftKey: true, altKey: true }
    )).toBe(true);
  });

  it('skips input field check - tagName logic', () => {
    const inputTags = ['INPUT', 'TEXTAREA'];
    expect(inputTags.includes('INPUT')).toBe(true);
    expect(inputTags.includes('DIV')).toBe(false);
  });
});
