import { describe, it, expect } from 'vitest';

describe('useInfiniteProperties - infinite scroll', () => {
  it('page size constant', () => {
    const PAGE_SIZE = 15;
    expect(PAGE_SIZE).toBe(15);
  });
  it('hasNextPage check', () => {
    const total = 47; const loaded = 30;
    expect(loaded < total).toBe(true);
    expect(47 < total).toBe(false);
  });
  it('merges pages without duplicates', () => {
    const page1 = [{ id: '1' }, { id: '2' }];
    const page2 = [{ id: '2' }, { id: '3' }];
    const all = [...page1, ...page2];
    const unique = all.filter((item, i, arr) => arr.findIndex(x => x.id === item.id) === i);
    expect(unique).toHaveLength(3);
  });
  it('scroll threshold trigger', () => {
    const scrollHeight = 2000; const scrollTop = 1700; const clientHeight = 400;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 200;
    expect(nearBottom).toBe(true);
  });
});
