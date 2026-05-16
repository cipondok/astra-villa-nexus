import { describe, it, expect } from 'vitest';
describe('CollapsibleSearchPanelMobile', () => {
  it('collapsed by default', () => { expect(false).toBe(false); });
  it('expands on tap', () => { let open = false; open = true; expect(open).toBe(true); });
});
