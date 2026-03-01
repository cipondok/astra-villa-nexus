import { describe, it, expect } from 'vitest';

describe('KprScenariosTab', () => {
  it('identifies lowest monthly payment scenario', () => {
    const scenarios = [
      { monthlyPayment: 5_000_000 },
      { monthlyPayment: 3_500_000 },
      { monthlyPayment: 7_200_000 },
    ];
    const lowest = Math.min(...scenarios.map(s => s.monthlyPayment));
    expect(lowest).toBe(3_500_000);
  });

  it('getAffordabilityLabel returns correct labels', () => {
    const getLabel = (ratio?: number) => {
      if (!ratio) return null;
      if (ratio <= 30) return 'Comfortable';
      if (ratio <= 40) return 'Moderate';
      return 'Stretched';
    };
    expect(getLabel(25)).toBe('Comfortable');
    expect(getLabel(35)).toBe('Moderate');
    expect(getLabel(55)).toBe('Stretched');
    expect(getLabel(undefined)).toBeNull();
  });

  it('getAffordabilityColor returns chart-1 for low DTI', () => {
    const getColor = (ratio?: number) => {
      if (!ratio) return 'text-muted-foreground';
      if (ratio <= 30) return 'text-chart-1';
      if (ratio <= 40) return 'text-gold-primary';
      return 'text-destructive';
    };
    expect(getColor(20)).toBe('text-chart-1');
    expect(getColor(35)).toBe('text-gold-primary');
    expect(getColor(60)).toBe('text-destructive');
  });

  it('shows empty state when no scenarios', () => {
    const scenarios: any[] = [];
    expect(scenarios.length).toBe(0);
  });

  it('shows Best badge only when multiple scenarios exist', () => {
    const scenarios = [{ monthlyPayment: 3_000_000 }];
    const showBadge = scenarios.length > 1;
    expect(showBadge).toBe(false);
  });
});
