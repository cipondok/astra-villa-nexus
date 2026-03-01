import { describe, it, expect } from 'vitest';
describe('SearchFilters', () => {
  it('property types', () => { expect(['house','apartment','villa','land','commercial']).toHaveLength(5); });
  it('bedroom options', () => { expect([1,2,3,4,'5+']).toHaveLength(5); });
});
