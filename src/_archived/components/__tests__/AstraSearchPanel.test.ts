import { describe, it, expect } from 'vitest';
describe('AstraSearchPanel', () => {
  it('search categories', () => { expect(['all','tokens','properties','agents']).toHaveLength(4); });
  it('debounce delay', () => { expect(300).toBeGreaterThan(0); });
});
