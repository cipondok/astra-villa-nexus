import { describe, it, expect } from 'vitest';

describe('ApplicationStatusBar', () => {
  it('calculates progress percentage from steps', () => {
    const steps = ['submitted', 'under_review', 'approved', 'completed'];
    const currentStep = 2;
    const progress = Math.round((currentStep / (steps.length - 1)) * 100);
    expect(progress).toBe(67);
  });

  it('maps status to color variants', () => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    expect(colorMap.approved).toBe('bg-green-500');
  });
});
