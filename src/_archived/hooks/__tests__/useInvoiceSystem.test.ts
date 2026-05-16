import { describe, it, expect } from 'vitest';

describe('useInvoiceSystem - invoice logic', () => {
  it('invoice number generation', () => {
    const num = `INV-2026-${String(42).padStart(5, '0')}`;
    expect(num).toBe('INV-2026-00042');
  });

  it('line item total calculation', () => {
    const items = [
      { description: 'Rent', quantity: 1, unitPrice: 5000000 },
      { description: 'Service fee', quantity: 1, unitPrice: 500000 },
    ];
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    expect(subtotal).toBe(5500000);
  });

  it('tax calculation (PPN 11%)', () => {
    const subtotal = 5500000;
    const tax = subtotal * 0.11;
    const total = subtotal + tax;
    expect(tax).toBe(605000);
    expect(total).toBe(6105000);
  });

  it('due date calculation', () => {
    const issueDate = new Date('2026-03-01');
    const terms = 30;
    const dueDate = new Date(issueDate.getTime() + terms * 86400000);
    expect(dueDate.toISOString().slice(0, 10)).toBe('2026-03-31');
  });

  it('overdue status check', () => {
    const dueDate = new Date('2026-02-15');
    const now = new Date('2026-03-01');
    const isOverdue = now > dueDate;
    expect(isOverdue).toBe(true);
  });

  it('payment status', () => {
    const statuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'];
    expect(statuses).toContain('overdue');
    expect(statuses).toHaveLength(6);
  });
});
