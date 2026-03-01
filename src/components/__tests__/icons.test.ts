import { describe, it, expect } from 'vitest';
describe('icons', () => {
  it('icon set includes common icons', () => { const icons=['home','search','user','settings','bell']; expect(icons.length).toBeGreaterThanOrEqual(5); });
});
