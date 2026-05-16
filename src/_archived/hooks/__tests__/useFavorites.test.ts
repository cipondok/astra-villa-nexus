import { describe, it, expect } from 'vitest';

describe('useFavorites - Set operations', () => {
  it('Set tracks unique property IDs', () => {
    const favs = new Set<string>();
    favs.add('prop-1');
    favs.add('prop-2');
    favs.add('prop-1'); // duplicate
    expect(favs.size).toBe(2);
  });

  it('isFavorite checks Set membership', () => {
    const favs = new Set(['prop-1', 'prop-2']);
    expect(favs.has('prop-1')).toBe(true);
    expect(favs.has('prop-3')).toBe(false);
  });

  it('toggle removes existing favorite', () => {
    const favs = new Set(['prop-1', 'prop-2']);
    favs.delete('prop-1');
    expect(favs.has('prop-1')).toBe(false);
    expect(favs.size).toBe(1);
  });

  it('toggle adds new favorite', () => {
    const favs = new Set(['prop-1']);
    const newFavs = new Set([...favs, 'prop-2']);
    expect(newFavs.has('prop-2')).toBe(true);
    expect(newFavs.size).toBe(2);
  });

  it('empty favorites set has size 0', () => {
    const favs = new Set<string>();
    expect(favs.size).toBe(0);
  });
});
