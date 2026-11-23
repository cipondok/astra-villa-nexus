import { describe, expect, it } from 'vitest';
import { buildInquiryRow, validateInquiryContact } from '../propertyInquiry';

const base = { name: 'Budi', email: '', phone: '', message: 'Masih tersedia?' };

describe('listing enquiries', () => {
  it('need an email or a phone so the owner can reply', () => {
    expect(validateInquiryContact(base)).toBe('contactRequired');
    expect(validateInquiryContact({ ...base, email: 'budi@example.com' })).toBeNull();
    expect(validateInquiryContact({ ...base, phone: '0812 3456 7890' })).toBeNull();
  });

  it('need a message', () => {
    expect(validateInquiryContact({ ...base, email: 'budi@example.com', message: '  ' })).toBe('messageRequired');
  });

  it('never set a status, reply or reviewer (the database rejects those)', () => {
    const row = buildInquiryRow({ kind: 'message', propertyId: 'p1', userId: null, ...base, email: 'budi@example.com' }) as Record<string, unknown>;
    for (const forged of ['status', 'admin_response', 'responded_by', 'responded_at']) expect(row).not.toHaveProperty(forged);
    expect(row.contact_phone).toBeNull();
    expect(row.property_id).toBe('p1');
  });

  it('marks visit requests as viewings', () => {
    expect(buildInquiryRow({ kind: 'visit', propertyId: 'p1', userId: 'u1', ...base, phone: '08123456789' }).inquiry_type).toBe('property_viewing');
  });
});
