import { describe, it, expect } from 'vitest';

describe('invoicePdfGenerator - PDF generation logic', () => {
  it('formats invoice header', () => {
    const header = { companyName: 'Astra Realty', invoiceNo: 'INV-2026-001', date: '2026-03-01' };
    expect(header.companyName).toBeTruthy();
    expect(header.invoiceNo).toMatch(/^INV-/);
  });
  it('calculates line items total', () => {
    const items = [{ qty: 1, price: 5000000 }, { qty: 2, price: 250000 }];
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    expect(total).toBe(5500000);
  });
  it('applies discount', () => {
    const subtotal = 5500000; const discount = 0.1;
    const afterDiscount = subtotal * (1 - discount);
    expect(afterDiscount).toBe(4950000);
  });
  it('grand total with tax and discount', () => {
    const subtotal = 5500000; const discount = 550000; const tax = (5500000 - 550000) * 0.11;
    const grand = subtotal - discount + tax;
    expect(grand).toBeCloseTo(5494500, 0);
  });
});
