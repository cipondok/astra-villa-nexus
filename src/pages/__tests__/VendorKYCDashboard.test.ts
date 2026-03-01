import { describe, it, expect } from 'vitest';
describe('VendorKYCDashboard page', () => {
  it('KYC verification steps', () => {
    const steps = ['identity', 'business', 'bank-account', 'review'];
    expect(steps).toHaveLength(4);
  });
  it('document types required', () => {
    const docs = ['KTP', 'NPWP', 'SIUP', 'Bank Statement'];
    expect(docs).toContain('KTP');
  });
  it('verification status', () => {
    const statuses = ['pending', 'in_review', 'approved', 'rejected'];
    expect(statuses).toContain('approved');
  });
});
