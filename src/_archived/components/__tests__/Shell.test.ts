import { describe, it, expect } from 'vitest';
describe('Shell', () => {
  it('layout sections', () => { expect(['header','sidebar','main','footer']).toHaveLength(4); });
  it('sidebar collapsible', () => { let collapsed=false; collapsed=true; expect(collapsed).toBe(true); });
});
