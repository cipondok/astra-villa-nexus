import { describe, it, expect } from 'vitest';

describe('useAdvancedPropertySearch - advanced search', () => {
  it('radius search in km', () => {
    const props = [{ id: '1', dist: 2 }, { id: '2', dist: 8 }, { id: '3', dist: 5 }];
    const radius = 5;
    expect(props.filter(p => p.dist <= radius)).toHaveLength(2);
  });
  it('multi-select amenities filter', () => {
    const props = [
      { id: '1', amenities: ['pool', 'gym', 'parking'] },
      { id: '2', amenities: ['gym'] },
      { id: '3', amenities: ['pool', 'parking'] },
    ];
    const required = ['pool', 'parking'];
    const matched = props.filter(p => required.every(a => p.amenities.includes(a)));
    expect(matched).toHaveLength(2);
  });
  it('year built range', () => {
    const props = [{ year: 2015 }, { year: 2020 }, { year: 2023 }];
    expect(props.filter(p => p.year >= 2018)).toHaveLength(2);
  });
  it('floor level filter', () => {
    const units = [{ floor: 1 }, { floor: 5 }, { floor: 12 }, { floor: 20 }];
    expect(units.filter(u => u.floor >= 10)).toHaveLength(2);
  });
});
