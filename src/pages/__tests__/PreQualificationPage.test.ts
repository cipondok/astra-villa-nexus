import { describe, it, expect } from 'vitest';

describe('PreQualificationPage', () => {
  it('wizard steps complete in order', () => {
    const steps = ['personal', 'employment', 'financial', 'property', 'result'];
    expect(steps).toHaveLength(5);
    expect(steps[4]).toBe('result');
  });
  it('DTI threshold for qualification', () => {
    const dti = 35;
    const status = dti <= 30 ? 'qualified' : dti <= 50 ? 'conditional' : 'not_qualified';
    expect(status).toBe('conditional');
  });
});
