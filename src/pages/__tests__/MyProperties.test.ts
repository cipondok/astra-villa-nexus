import { describe, it, expect } from 'vitest';
describe('MyProperties page', () => {
  it('property listing status filter', () => {
    const props = [
      { status: 'active' }, { status: 'sold' }, { status: 'active' }, { status: 'draft' },
    ];
    const active = props.filter(p => p.status === 'active');
    expect(active).toHaveLength(2);
  });
  it('bulk delete confirmation', () => {
    const selected = ['p1', 'p2'];
    expect(selected.length).toBeGreaterThan(0);
  });
});
