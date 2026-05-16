import { describe, it, expect } from 'vitest';
describe('MeasurementTool', () => {
  it('units', () => { expect(['sqm','sqft','hectare','acre']).toHaveLength(4); });
  it('sqm to sqft', () => { expect(Math.round(100*10.7639)).toBe(1076); });
});
